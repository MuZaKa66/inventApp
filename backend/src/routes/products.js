import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, category, status, lowStock } = req.query;
    let query = `
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (status !== undefined) {
      query += ' AND p.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    if (lowStock === 'true') {
      query += ' AND p.current_stock < p.reorder_level';
    }

    query += ' ORDER BY p.created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/barcode/:barcode', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE barcode = ? AND is_active = 1').get(req.params.barcode);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      sku, barcode, name, description, category_id, brand, model_number,
      cost_price, selling_price, minimum_price, reorder_level, unit,
      warranty_months, track_serial_numbers, specifications, is_active, is_featured
    } = req.body;

    if (!sku || !name || !selling_price) {
      return res.status(400).json({ error: 'SKU, name, and selling price are required' });
    }

    const result = db.prepare(`
      INSERT INTO products (
        sku, barcode, name, description, category_id, brand, model_number,
        cost_price, selling_price, minimum_price, reorder_level, unit,
        warranty_months, track_serial_numbers, specifications, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sku, barcode || null, name, description, category_id, brand || 'Hikvision', model_number,
      cost_price || 0, selling_price, minimum_price || 0, reorder_level || 10, unit || 'piece',
      warranty_months || 12, track_serial_numbers ? 1 : 0, specifications, is_active !== false ? 1 : 0, is_featured ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'SKU or barcode already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const {
      sku, barcode, name, description, category_id, brand, model_number,
      cost_price, selling_price, minimum_price, reorder_level, unit,
      warranty_months, track_serial_numbers, specifications, is_active, is_featured
    } = req.body;

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET
        sku = ?, barcode = ?, name = ?, description = ?, category_id = ?, brand = ?, model_number = ?,
        cost_price = ?, selling_price = ?, minimum_price = ?, reorder_level = ?, unit = ?,
        warranty_months = ?, track_serial_numbers = ?, specifications = ?, is_active = ?, is_featured = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      sku, barcode || null, name, description, category_id, brand, model_number,
      cost_price, selling_price, minimum_price, reorder_level, unit,
      warranty_months, track_serial_numbers ? 1 : 0, specifications, is_active ? 1 : 0, is_featured ? 1 : 0,
      req.params.id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
