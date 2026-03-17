# Testing Guide - Security Sales System

## Prerequisites

All dependencies have been installed and the database has been migrated successfully.

## Starting the Application

### Development Mode

1. **Start Backend Server** (Terminal 1):
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:3001

2. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### Production Mode

```bash
# From project root
npm start
```

## Default Login Credentials

- **Username**: `admin`
- **Password**: `Admin@123`

## Testing Checklist

### 1. Authentication
- [x] Login with default credentials
- [x] Dashboard loads successfully
- [x] User role displayed correctly (Owner)
- [x] Logout functionality

### 2. Products Management
- [x] View products list
- [x] Add new product
  - SKU generation
  - Category selection
  - Pricing fields
  - Stock management
- [x] Edit existing product
- [x] Delete product
- [x] Search products by name/SKU/barcode
- [x] Filter by category
- [x] Filter low stock items
- [x] Low stock indicator visible

### 3. Customers Management
- [x] View customers list
- [x] Add new customer (B2C)
- [x] Add new customer (B2B with company details)
- [x] Edit customer information
- [x] Search customers
- [x] Filter by type (B2B/B2C)
- [x] Customer card display with proper icons

### 4. Quotations Management
- [x] View quotations list
- [x] Filter by status
- [x] Search quotations
- [x] Change quotation status
- [x] View quotation details

### 5. Sales Management
- [x] View sales/invoices list
- [x] Filter by payment status
- [x] Search sales
- [x] View sale details
- [x] Payment status display

### 6. Dashboard
- [x] Real-time statistics display
  - Total Products count
  - Total Customers count
  - Pending Quotations count
  - Monthly Sales amount
- [x] Quick actions available
- [x] Stats load without 20-second delay

### 7. Navigation & UI
- [x] Sidebar navigation works
- [x] All menu items accessible
- [x] Responsive design
- [x] No duplicate menu items
- [x] Proper role-based menu filtering

### 8. User Management (Owner Only)
- [x] View users list
- [x] Add new user
- [x] Edit user
- [x] Delete user
- [x] Role selection
- [x] Owner-only access verified

## Known Limitations

1. **Quotation Builder**: Full quotation creation interface shows placeholder alert
2. **Sales Creation**: Full sales/invoice creation interface shows placeholder alert
3. **Settings Page**: Not yet implemented (shows "Coming Soon")

## Performance Notes

✅ **20-second delay issue RESOLVED**
- Dashboard now loads instantly
- Stats are fetched in parallel using Promise.all()
- Proper error handling prevents hanging

## Test Scenarios

### Scenario 1: Add Complete Product
1. Navigate to Products
2. Click "Add Product"
3. Fill in:
   - SKU: CAM-001
   - Name: Hikvision 2MP Bullet Camera
   - Category: Select from dropdown
   - Brand: Hikvision
   - Selling Price: 8500
   - Current Stock: 25
   - Reorder Level: 10
4. Save and verify product appears in list

### Scenario 2: Add Customer & View Dashboard
1. Navigate to Customers
2. Add B2B customer with company details
3. Add B2C individual customer
4. Navigate to Dashboard
5. Verify "Total Customers" shows count of 2

### Scenario 3: Low Stock Alert
1. Create product with stock < reorder level
2. Enable "Low Stock Only" filter
3. Verify product appears with red warning icon

## API Endpoints Tested

### Working Endpoints:
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me
- ✅ GET /api/products
- ✅ POST /api/products
- ✅ PUT /api/products/:id
- ✅ DELETE /api/products/:id
- ✅ GET /api/customers
- ✅ POST /api/customers
- ✅ PUT /api/customers/:id
- ✅ GET /api/quotations
- ✅ PUT /api/quotations/:id/status
- ✅ GET /api/sales
- ✅ GET /api/categories
- ✅ GET /api/users
- ✅ POST /api/users
- ✅ PUT /api/users/:id
- ✅ DELETE /api/users/:id

## Browser Compatibility

Tested and working on:
- Chrome/Edge (Recommended)
- Firefox
- Safari

## Production Build

Production build completed successfully:
```
dist/index.html                   0.47 kB │ gzip:  0.30 kB
dist/assets/index-D9XWG44q.css   19.75 kB │ gzip:  4.22 kB
dist/assets/index-jj8PnEvu.js   258.95 kB │ gzip: 75.78 kB
```

## Next Steps for Full Production Deployment

1. Configure environment variables
2. Set up reverse proxy (nginx)
3. Enable HTTPS
4. Configure automated backups
5. Set up monitoring
6. Change default admin password
7. Create additional user accounts

## Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all dependencies are installed
