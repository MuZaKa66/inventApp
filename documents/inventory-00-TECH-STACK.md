# Security Equipment Inventory & Sales System - Tech Stack

## Project Overview
A fast, responsive inventory and sales management system for a Hikvision security equipment franchise, optimized for single-system deployment with future expansion capability.

---

## Technology Stack

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (for professional retail interface)
- **State Management**: Zustand (lighter than Redux)
- **Form Handling**: React Hook Form
- **Drag & Drop**: @dnd-kit/core (for quotation builder)
- **PDF Generation**: jsPDF or react-pdf/renderer
- **Barcode Scanning**: html5-qrcode or quagga2
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Tables**: TanStack Table (React Table v8) - fast, lightweight

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (minimal, fast)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer (for product images, attachments)
- **Validation**: Zod
- **CORS**: cors middleware

### Database
- **Primary**: SQLite3 (fast, zero-config, perfect for single system)
- **Future Migration**: PostgreSQL (when moving to multi-location/online)
- **Query Builder**: Better-sqlite3 (synchronous, faster than node-sqlite3)
- **No ORM**: Direct SQL for maximum performance

### File Storage
- **Location**: Local filesystem (`/uploads` directory)
- **Structure**:
  - `/uploads/products/{product_id}/image.jpg`
  - `/uploads/quotations/{quote_id}/quote.pdf`
  - `/uploads/attachments/{entity_type}/{id}/`

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Vite (fastest React build tool)
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

### Deployment (Single System)
- **OS**: Windows 10/11 OR Ubuntu 22.04 LTS
- **RAM**: 4GB minimum (8GB recommended)
- **Process Manager**: PM2 (for auto-restart)
- **Web Server**: Express built-in
- **Port**: 3000 (configurable)
- **Access**: http://localhost:3000 or http://[LOCAL-IP]:3000

---

## Key Technical Decisions

### Why SQLite?
✅ **Zero configuration** - no separate database server
✅ **Fast** - faster than MySQL/PostgreSQL for single-user scenarios
✅ **Reliable** - ACID-compliant, used by millions of applications
✅ **Small footprint** - entire database is one file
✅ **Easy backup** - just copy the .db file
✅ **Migration path** - can upgrade to PostgreSQL when needed

### Why Better-sqlite3?
✅ **Synchronous API** - simpler code, no async/await for DB calls
✅ **Faster** - 2-3x faster than async sqlite3 library
✅ **Prepared statements** - automatic SQL injection protection
✅ **Better performance** - optimized for single-threaded access

### Performance Optimizations
- **Indexing**: All foreign keys and search fields indexed
- **Pagination**: Load only 50 records at a time
- **Lazy loading**: Images loaded on demand
- **Caching**: Product catalog cached in memory
- **Debouncing**: Search input debounced (300ms)
- **Virtual scrolling**: For large product lists

---

## Architecture Pattern

**Client-Server (Single System)**
```
React Frontend
     ↓
Express API (REST)
     ↓
SQLite Database
     ↓
Local File System
```

**All on one machine** - no network complexity

---

## Key Features by Technology

### Quotation System (Critical Feature)
- **Drag & Drop**: @dnd-kit for dragging products into quote
- **Live Calculation**: Real-time totals as items added
- **PDF Generation**: jsPDF for professional quotations
- **Print**: Browser print API with custom CSS

### Product Catalog
- **Fast Search**: Indexed search on name, SKU, barcode
- **Barcode Scanning**: html5-qrcode for camera-based scanning
- **Image Upload**: Multer with image compression
- **Categories**: Hierarchical categories (Camera → IP Camera → Bullet)

### Inventory Management
- **Real-time Stock**: Updates on every sale/purchase
- **Low Stock Alerts**: Frontend notifications
- **Stock History**: Track all in/out movements
- **Serial Number Tracking**: Optional per product

### Sales & Billing
- **Partial Payments**: Multiple payment records per invoice
- **GST Calculation**: Selectable 18% GST (checkbox)
- **Receipt Printing**: Thermal printer compatible
- **Payment Methods**: Cash, Card, Bank Transfer, Cheque

### Purchase Orders
- **Supplier Management**: Track multiple suppliers
- **PO Tracking**: Status from Pending → Received
- **Auto Stock Update**: When PO marked as received
- **Due Payments**: Track supplier payment due dates

---

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt (10 rounds)
- **Role-Based Access**: Owner, Sales, Inventory, Technician
- **Input Validation**: Zod schemas on frontend and backend
- **SQL Injection Protection**: Parameterized queries
- **Session Management**: 24-hour JWT expiry

---

## Performance Targets

- **Page Load**: < 1 second
- **Search Results**: < 200ms
- **Quotation Generation**: < 500ms
- **PDF Generation**: < 1 second
- **Database Queries**: < 50ms average
- **Startup Time**: < 5 seconds

---

## Scalability Considerations

### Current (Single System)
- 500 products
- 1-5 concurrent users
- 10,000 transactions/year
- 1GB database size

### Future (Multi-location/Online)
- Migrate to PostgreSQL
- Add Redis for caching
- Load balancer for multiple instances
- S3/MinIO for file storage
- WebSockets for real-time updates

---

## Data Backup Strategy

**Automated Daily Backup**:
- SQLite database file
- Uploaded files
- Configuration files
- Backup to external drive or network location

**Manual Backup**: 
- One-click backup from settings
- Downloads ZIP file with all data

---

## Browser Support

- **Primary**: Google Chrome / Edge (latest)
- **Secondary**: Firefox (latest)
- **Print**: Optimized for Chrome print engine

---

## Hardware Requirements

### Minimum
- **CPU**: Intel i3 or equivalent
- **RAM**: 4GB
- **Storage**: 20GB free space
- **OS**: Windows 10 or Ubuntu 20.04

### Recommended
- **CPU**: Intel i5 or equivalent
- **RAM**: 8GB
- **Storage**: 50GB free space (SSD preferred)
- **OS**: Windows 11 or Ubuntu 22.04
- **Optional**: Barcode scanner (USB)
- **Optional**: Receipt printer (thermal)

---

## Development Approach

**Build in Phases**:
1. Foundation (products, customers, users)
2. **Quotation system** (PRIORITY - drag-drop, PDF)
3. Sales & billing (partial payments, GST)
4. Purchase orders & inventory
5. Warranty & installation tracking
6. Reports & polish

**Testing at Each Phase**:
- Unit tests for critical functions
- Manual testing in real environment
- Performance testing with 500+ products

---

## Barcode Integration

**Scanner Support**:
- USB barcode scanners (keyboard emulation)
- Camera-based scanning (mobile/webcam)
- QR code support

**Workflow**:
1. Scan barcode → Auto-search product
2. Add to quotation/sale with one click
3. Track inventory by barcode

---

## Printer Integration

**Quotation/Invoice Printing**:
- Standard A4 paper
- Professional layout
- Browser print dialog

**Receipt Printing** (optional):
- Thermal printer (58mm or 80mm)
- ESC/POS command support
- Auto-cut after print

---

## Future Enhancements (Post-Launch)

- SMS quotation follow-ups
- WhatsApp integration for quotes
- Mobile app for technicians
- Customer portal (view quotes, invoices)
- Email automation
- Analytics dashboard
- Stock forecasting
- Multi-location support
- Online store integration

---

## Success Metrics

- ✅ Quotation generation < 2 minutes
- ✅ System startup < 5 seconds
- ✅ Search response < 200ms
- ✅ Zero data loss (daily backups)
- ✅ 99% uptime (single system, PM2 auto-restart)
- ✅ Easy to use (minimal training needed)

---

## Support & Maintenance

**Regular Tasks**:
- Daily: Automated backup
- Weekly: Review stock levels
- Monthly: Database optimization (VACUUM)
- Quarterly: System updates

**Troubleshooting**:
- Application logs via PM2
- Database integrity checks
- Backup verification

---

## Deployment Timeline

**Phase 1-2** (Quotation system): 1-2 weeks
**Phase 3-4** (Sales & PO): 1 week
**Phase 5** (Warranty & Service): 3-4 days
**Phase 6** (Reports & Polish): 3-4 days
**Testing & Deployment**: 2-3 days

**Total**: 3-4 weeks to production-ready system

---

This stack prioritizes **speed, simplicity, and reliability** for a single-system deployment while maintaining a clear path for future expansion.
