import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { status, customer_id, from_date, to_date } = req.query;
    let query = `
      SELECT q.*, c.first_name, c.last_name, c.company_name,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND q.status = ?';
      params.push(status);
    }

    if (customer_id) {
      query += ' AND q.customer_id = ?';
      params.push(customer_id);
    }

    if (from_date) {
      query += ' AND q.quotation_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND q.quotation_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY q.created_at DESC';

    const quotations = db.prepare(query).all(...params);
    res.json({ quotations });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const quotation = db.prepare(`
      SELECT q.*, c.first_name, c.last_name, c.company_name, c.phone, c.address,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ?
    `).get(req.params.id);

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const items = db.prepare(`
      SELECT qi.*, p.image_url, p.description
      FROM quotation_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quotation_id = ?
      ORDER BY qi.sort_order
    `).all(req.params.id);

    quotation.items = items;

    res.json({ quotation });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      customer_id, quotation_date, valid_until, items,
      discount_percentage, discount_amount, include_gst, gst_rate,
      include_installation, installation_charge, customer_notes, internal_notes
    } = req.body;

    if (!customer_id || !quotation_date || !valid_until || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer, dates, and items are required' });
    }

    const quotationNumber = `QT-${Date.now().toString().slice(-8)}`;

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discAmt = discount_amount || (subtotal * ((discount_percentage || 0) / 100));
    const subtotalAfterDiscount = subtotal - discAmt;
    const gstAmt = include_gst ? subtotalAfterDiscount * ((gst_rate || 18) / 100) : 0;
    const total = subtotalAfterDiscount + gstAmt + (include_installation ? (installation_charge || 0) : 0);

    const transaction = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO quotations (
          quotation_number, customer_id, quotation_date, valid_until, status,
          subtotal, discount_percentage, discount_amount, include_gst, gst_rate, gst_amount,
          include_installation, installation_charge, total_amount,
          customer_notes, internal_notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        quotationNumber, customer_id, quotation_date, valid_until, 'Draft',
        subtotal, discount_percentage || 0, discAmt, include_gst ? 1 : 0, gst_rate || 18, gstAmt,
        include_installation ? 1 : 0, installation_charge || 0, total,
        customer_notes, internal_notes, req.user.id
      );

      const quotationId = result.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO quotation_items (
          quotation_id, product_id, product_name, product_sku,
          quantity, unit_price, discount_percentage, line_total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item, index) => {
        insertItem.run(
          quotationId, item.product_id, item.product_name, item.product_sku,
          item.quantity, item.unit_price, item.discount_percentage || 0, item.line_total, index
        );
      });

      return quotationId;
    });

    const quotationId = transaction();
    const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(quotationId);

    res.status(201).json({ message: 'Quotation created successfully', quotation });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const {
      customer_id, quotation_date, valid_until, items,
      discount_percentage, discount_amount, include_gst, gst_rate,
      include_installation, installation_charge, customer_notes, internal_notes
    } = req.body;

    const existing = db.prepare('SELECT id, status FROM quotations WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft quotations can be edited' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const discAmt = discount_amount || (subtotal * ((discount_percentage || 0) / 100));
    const subtotalAfterDiscount = subtotal - discAmt;
    const gstAmt = include_gst ? subtotalAfterDiscount * ((gst_rate || 18) / 100) : 0;
    const total = subtotalAfterDiscount + gstAmt + (include_installation ? (installation_charge || 0) : 0);

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE quotations SET
          customer_id = ?, quotation_date = ?, valid_until = ?,
          subtotal = ?, discount_percentage = ?, discount_amount = ?,
          include_gst = ?, gst_rate = ?, gst_amount = ?,
          include_installation = ?, installation_charge = ?, total_amount = ?,
          customer_notes = ?, internal_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        customer_id, quotation_date, valid_until,
        subtotal, discount_percentage || 0, discAmt,
        include_gst ? 1 : 0, gst_rate || 18, gstAmt,
        include_installation ? 1 : 0, installation_charge || 0, total,
        customer_notes, internal_notes, req.params.id
      );

      db.prepare('DELETE FROM quotation_items WHERE quotation_id = ?').run(req.params.id);

      const insertItem = db.prepare(`
        INSERT INTO quotation_items (
          quotation_id, product_id, product_name, product_sku,
          quantity, unit_price, discount_percentage, line_total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item, index) => {
        insertItem.run(
          req.params.id, item.product_id, item.product_name, item.product_sku,
          item.quantity, item.unit_price, item.discount_percentage || 0, item.line_total, index
        );
      });
    });

    transaction();

    const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);

    res.json({ message: 'Quotation updated successfully', quotation });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;

    if (!['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = db.prepare('SELECT id FROM quotations WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    db.prepare('UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    const quotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id);

    res.json({ message: 'Quotation status updated successfully', quotation });
  } catch (error) {
    console.error('Update quotation status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id, status FROM quotations WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (existing.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft quotations can be deleted' });
    }

    db.prepare('DELETE FROM quotations WHERE id = ?').run(req.params.id);

    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
