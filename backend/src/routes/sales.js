import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { payment_status, customer_id, from_date, to_date } = req.query;
    let query = `
      SELECT s.*, c.first_name, c.last_name, c.company_name,
             u.full_name as created_by_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(payment_status);
    }

    if (customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(customer_id);
    }

    if (from_date) {
      query += ' AND s.sale_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND s.sale_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY s.created_at DESC';

    const sales = db.prepare(query).all(...params);
    res.json({ sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const sale = db.prepare(`
      SELECT s.*, c.first_name, c.last_name, c.company_name, c.phone, c.address,
             u.full_name as created_by_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const items = db.prepare(`
      SELECT si.*, p.image_url
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(req.params.id);

    sale.items = items;

    res.json({ sale });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
