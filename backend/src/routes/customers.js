import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, type, status } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR company_name LIKE ? OR phone LIKE ? OR customer_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ' AND customer_type = ?';
      params.push(type);
    }

    if (status !== undefined) {
      query += ' AND is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const customers = db.prepare(query).all(...params);
    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      first_name, last_name, company_name, customer_type, phone, alternate_phone,
      email, gst_number, ntn_number, address, city, postal_code,
      credit_limit, credit_days, discount_percentage, notes
    } = req.body;

    if (!first_name || !last_name || !phone || !customer_type) {
      return res.status(400).json({ error: 'First name, last name, phone, and customer type are required' });
    }

    const customerCode = `CUST-${Date.now().toString().slice(-8)}`;

    const result = db.prepare(`
      INSERT INTO customers (
        customer_code, first_name, last_name, company_name, customer_type, phone, alternate_phone,
        email, gst_number, ntn_number, address, city, postal_code,
        credit_limit, credit_days, discount_percentage, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customerCode, first_name, last_name, company_name, customer_type, phone, alternate_phone,
      email, gst_number, ntn_number, address, city, postal_code,
      credit_limit || 0, credit_days || 0, discount_percentage || 0, notes
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const {
      first_name, last_name, company_name, customer_type, phone, alternate_phone,
      email, gst_number, ntn_number, address, city, postal_code,
      credit_limit, credit_days, discount_percentage, notes, is_active
    } = req.body;

    const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    db.prepare(`
      UPDATE customers SET
        first_name = ?, last_name = ?, company_name = ?, customer_type = ?, phone = ?, alternate_phone = ?,
        email = ?, gst_number = ?, ntn_number = ?, address = ?, city = ?, postal_code = ?,
        credit_limit = ?, credit_days = ?, discount_percentage = ?, notes = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      first_name, last_name, company_name, customer_type, phone, alternate_phone,
      email, gst_number, ntn_number, address, city, postal_code,
      credit_limit, credit_days, discount_percentage, notes, is_active ? 1 : 0,
      req.params.id
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
