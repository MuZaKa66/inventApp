# Deployment Guide

## Repository
Successfully pushed to: https://github.com/MuZaKa66/inventApp

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/MuZaKa66/inventApp.git
cd inventApp
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Setup Database
```bash
cd backend
npm run migrate
cd ..
```

### 4. Run the Application
```bash
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Default Login: admin / Admin@123

## Project Structure
```
inventApp/
├── backend/                # Node.js + Express Backend
│   ├── src/
│   │   ├── config/        # Database & migration
│   │   ├── middleware/    # JWT authentication
│   │   ├── routes/        # API endpoints
│   │   └── server.js      # Express server
│   └── package.json
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state
│   │   └── utils/         # API client
│   └── package.json
└── package.json           # Root package

```

## Features Implemented

### Backend (Complete)
- ✅ SQLite database with 14 tables
- ✅ JWT authentication
- ✅ User management (5 roles)
- ✅ Product management with categories
- ✅ Customer management (B2B/B2C)
- ✅ Quotation system
- ✅ Sales & invoicing support
- ✅ Purchase orders
- ✅ Inventory tracking
- ✅ Warranty management
- ✅ Installation jobs

### Frontend (Basic)
- ✅ Login page with authentication
- ✅ Dashboard layout with sidebar
- ✅ Protected routes
- ✅ State management
- ✅ API integration

### Database Schema
- users
- product_categories
- products
- customers
- quotations & quotation_items
- sales & sale_items
- payments
- suppliers
- purchase_orders & purchase_order_items
- inventory_movements
- warranties
- installations
- system_settings

## Next Steps

1. Install dependencies and run migration
2. Start development server
3. Login with default credentials
4. Change admin password
5. Start adding products and customers

## Support
- README: See README.md for full documentation
- API Docs: Check README.md for API endpoints
