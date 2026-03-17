import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM product_categories ORDER BY sort_order, name').all();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, parent_id, description, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = db.prepare(`
      INSERT INTO product_categories (name, parent_id, description, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(name, parent_id || null, description, sort_order || 0);

    const category = db.prepare('SELECT * FROM product_categories WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, parent_id, description, sort_order } = req.body;

    const existing = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(`
      UPDATE product_categories
      SET name = ?, parent_id = ?, description = ?, sort_order = ?
      WHERE id = ?
    `).run(name, parent_id || null, description, sort_order || 0, req.params.id);

    const category = db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id);

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM product_categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare('DELETE FROM product_categories WHERE id = ?').run(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
