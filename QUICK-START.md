# Quick Start Guide

## Security Equipment Sales & Inventory System

### Prerequisites
- Node.js v18+ installed
- Git (for version control)

### Installation & Setup (5 minutes)

#### Step 1: Install Dependencies
```bash
npm run install:all
```
This installs dependencies for both backend and frontend.

#### Step 2: Initialize Database
```bash
cd backend
node src/config/migrate.js
cd ..
```
This creates the database and seeds initial data.

#### Step 3: Start the Application

**Development Mode** (recommended for testing):
```bash
npm run dev
```
This starts both backend (port 3001) and frontend (port 3000).

**OR Production Mode**:
```bash
# Build frontend first
npm run build

# Start backend
npm start
```

#### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

#### Step 5: Login

Use the default credentials:
- **Username**: `admin`
- **Password**: `Admin@123`

### What to Test First

1. **Dashboard** - View system statistics
2. **Products** - Add a few products (click "Add Product")
3. **Customers** - Add some customers (B2B and B2C)
4. **Quotations** - View quotations list (will be empty initially)
5. **Sales** - View sales list (will be empty initially)
6. **Users** - Manage system users (Owner access only)

### Common Commands

```bash
# Install all dependencies
npm run install:all

# Run database migrations
cd backend && node src/config/migrate.js

# Start development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Default Port Configuration

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

### Troubleshooting

**Problem**: Dependencies not installed
```bash
npm run install:all
```

**Problem**: Database error
```bash
cd backend
node src/config/migrate.js
```

**Problem**: Port already in use
```bash
# Change ports in:
# - backend/.env (PORT=3001)
# - frontend/vite.config.js (port: 3000)
```

**Problem**: Cannot login
- Username: `admin`
- Password: `Admin@123`
- If still fails, re-run migrations

### Next Steps

1. Change the default admin password (Settings > coming soon, use Users page to edit)
2. Create additional user accounts
3. Add your product catalog
4. Add your customer database
5. Start creating quotations

### Documentation

- **COMPLETION-SUMMARY.md** - Full feature list and technical details
- **TESTING-GUIDE.md** - Comprehensive testing checklist
- **DEPLOYMENT.md** - Production deployment guide
- **inventory-02-COMPLETE-GUIDE.md** - Detailed system documentation

### Support

For issues:
1. Check backend terminal for server errors
2. Check frontend browser console (F12)
3. Verify database file exists: `backend/database.sqlite`
4. Ensure all dependencies installed
5. Check the documentation files

---

**Ready to use!** The system is fully functional and production-ready for core operations.
