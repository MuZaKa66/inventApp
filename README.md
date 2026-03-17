# Security Equipment Sales & Inventory System

A complete inventory and sales management system built specifically for security equipment businesses.

## Features

- **User Management**: Role-based access control (Owner, Sales, Inventory, Technician, Accountant)
- **Product Catalog**: Manage products with categories, SKUs, barcodes, and stock levels
- **Customer Management**: B2B and B2C customer support with credit limits
- **Quotation System**: Drag-drop quotation builder with PDF generation
- **Sales & Billing**: Invoice generation, partial payments, GST support
- **Purchase Orders**: Supplier management and stock receiving
- **Inventory Tracking**: Real-time stock movements and low stock alerts
- **Warranty Management**: Automatic warranty tracking for sold products
- **Installation Management**: Job scheduling and technician assignment
- **Reports**: Sales, inventory, financial, and customer reports

## Tech Stack

### Backend
- Node.js + Express
- SQLite3 (Better-sqlite3)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand for state management
- React Router
- React Hook Form

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd security-sales-system
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up backend environment**
```bash
cd backend
cp .env.example .env
```

4. **Run database migration**
```bash
cd backend
npm run migrate
```

5. **Start the application**

For development (both frontend and backend):
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Default Credentials

```
Username: admin
Password: Admin@123
```

**⚠️ Important: Change the admin password immediately after first login!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer

### Quotations
- `GET /api/quotations` - List all quotations
- `POST /api/quotations` - Create quotation
- `GET /api/quotations/:id` - Get quotation by ID
- `PUT /api/quotations/:id` - Update quotation
- `PUT /api/quotations/:id/status` - Update quotation status

## License

MIT License
