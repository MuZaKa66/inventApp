import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import customersRoutes from './routes/customers.js';
import quotationsRoutes from './routes/quotations.js';
import categoriesRoutes from './routes/categories.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Security Sales System API is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log('\n🔐 Default credentials:');
  console.log('   Username: admin');
  console.log('   Password: Admin@123');
  console.log('\n⚠️  Please run migration: npm run migrate\n');
});
