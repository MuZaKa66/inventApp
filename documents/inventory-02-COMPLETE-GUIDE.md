# Complete Implementation Guide - Security Equipment Sales System

## Overview
This document contains all 6 phases of development. Each phase builds on the previous one.

---

# PHASE 1: Foundation - Products, Customers, Users

## Objective
Build core system with authentication, product catalog, and customer management.

## Features to Build

### 1. Authentication & User Management

**Login Page**:
- Username/password
- Role-based redirect

**User Roles**:
- **Owner**: Full access
- **Sales**: Quotations, sales, customers (no settings/reports)
- **Inventory**: Products, stock, purchase orders
- **Technician**: View assigned installations only
- **Accountant**: Billing, payments, reports (read-only on products/customers)

**User Management** (Owner only):
- List users
- Add/edit user
- Assign role
- Activate/deactivate

### 2. Dashboard Layout

**Header**:
- Company logo
- User name + role
- Quick actions: New Quote, New Sale
- Logout

**Sidebar Navigation**:
- Dashboard
- Quotations ⭐ (most important)
- Sales
- Customers
- Products
- Inventory
- Purchase Orders
- Installations
- Reports
- Settings (Owner only)

### 3. Product Catalog Management

#### Product List Page
- Search bar (name, SKU, barcode)
- Filters: Category, Active/Inactive, Low Stock
- **Barcode scan button** (camera icon) - opens scanner
- Table columns:
  - Image (thumbnail)
  - SKU
  - Name
  - Category
  - Selling Price
  - Stock (highlight if < reorder level)
  - Status
  - Actions (Edit, View)
- Add Product button
- Pagination (50 per page)
- Export to CSV

#### Add/Edit Product Form
**Basic Info**:
- SKU (auto-generate or manual): `CAM-001`
- Barcode (optional - can scan)
- Product Name (required)
- Category (dropdown with hierarchy)
- Brand (default: Hikvision)
- Model Number

**Pricing**:
- Cost Price (purchase price)
- Selling Price (required)
- Minimum Price (for discount validation)

**Inventory**:
- Current Stock (read-only, updated via PO/Sales)
- Reorder Level (alert threshold, default 10)
- Unit (piece, box, meter)

**Warranty**:
- Warranty Period (months, default 12)
- Track Serial Numbers (checkbox)

**Details**:
- Description (textarea)
- Specifications (textarea or JSON)
- Product Image (upload)

**Status**:
- Active/Inactive
- Featured Product (checkbox)

**Barcode Scanner Integration**:
```javascript
// Use html5-qrcode library
import { Html5QrcodeScanner } from "html5-qrcode";

// Scanner component
<button onClick={startScanner}>Scan Barcode</button>
// Opens modal with camera view
// On scan success: populate barcode field
// Option to use USB scanner (keyboard emulation)
```

#### Product Categories
- Hierarchical tree view
- Add/edit/reorder categories
- Drag to rearrange

**Example Structure**:
```
Cameras
├── IP Cameras
│   ├── Bullet
│   ├── Dome
│   └── PTZ
├── Analog Cameras
DVR/NVR
├── 4 Channel
├── 8 Channel
├── 16 Channel
├── 32 Channel
Accessories
├── Cables
├── Power Supplies
├── Hard Drives
├── Monitors
```

### 4. Customer Management

#### Customer List
- Search: Name, phone, company, customer ID
- Filters: Type (B2B/B2C), Active/Inactive
- Table:
  - Customer ID
  - Name
  - Company (if B2B)
  - Phone
  - Type
  - Credit Limit
  - Outstanding Balance
  - Actions
- Add Customer button

#### Add/Edit Customer Form
**Personal Info** (always required):
- First Name, Last Name
- Phone (required, validation)
- Email (optional)
- Alternate Phone

**Customer Type**:
- Radio: B2B or B2C

**Company Info** (if B2B):
- Company Name
- GST Number
- NTN Number

**Address**:
- Address (textarea)
- City
- Postal Code

**Business Terms**:
- Credit Limit (amount)
- Credit Days (0=cash, 30=net 30, etc.)
- Discount % (customer-specific)

**Notes**: (textarea)

#### Customer Detail Page
**Tabs**:
- Overview (basic info + summary)
- Quotations (all quotes for this customer)
- Sales (all invoices)
- Payments (payment history)
- Installations (if any)
- Warranties (products under warranty)

**Summary Cards**:
- Total Quotations: 12 (3 pending)
- Total Sales: PKR 250,000
- Outstanding Balance: PKR 50,000
- Last Purchase: 15/03/2026

### 5. Dashboard Widgets

**Summary Cards** (today/this month):
- Total Sales: PKR 150,000 (▲ 12% vs last month)
- Pending Quotations: 8
- Low Stock Items: 5 (alert badge)
- Pending Installations: 3

**Charts**:
- Sales trend (last 30 days) - line chart
- Top selling products (bar chart)
- Quotation conversion rate (%) - gauge

**Recent Activity**:
- Last 5 quotations
- Last 5 sales
- Pending follow-ups

**Quick Actions**:
- Create New Quotation
- Record Sale
- Add Product
- Add Customer

## Technical Implementation

### Backend Routes
```javascript
// Auth
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Users
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

// Products
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/search?q=...
GET    /api/products/barcode/:barcode
POST   /api/products/upload-image

// Categories
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

// Customers
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
GET    /api/customers/search?q=...
```

### Database Init
```javascript
// Create default admin user
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@company.com', [BCRYPT_HASH], 'Admin', 'owner');

// Password: Admin@123
```

### Barcode Scanner Setup
```javascript
// Product search by barcode
GET /api/products/barcode/:barcode
// Returns product if found

// In quotation/sale screens:
// Scan → Auto-add to cart with qty 1
```

## Testing Checklist
- [ ] Can login with admin credentials
- [ ] Can create users with different roles
- [ ] Role-based access works
- [ ] Can create product with all fields
- [ ] Product image uploads correctly
- [ ] Can scan barcode (camera/USB)
- [ ] Barcode search finds product
- [ ] Can create hierarchical categories
- [ ] Can create B2B and B2C customers
- [ ] Customer search works
- [ ] Dashboard shows correct stats
- [ ] All navigation works

---

# PHASE 2: Quotation System ⭐ (CRITICAL)

## Objective
Build the drag-drop quotation builder with PDF generation and tracking.

## Features to Build

### 1. Quotation List Page

**Filters**:
- Status: Draft, Sent, Accepted, Rejected, Expired
- Date range
- Customer search
- Created by (user)

**Quick Filters** (buttons):
- My Drafts
- Awaiting Follow-up
- Expiring Soon (< 7 days)
- All Active

**Table**:
| Quote # | Date | Customer | Total | Valid Until | Status | Actions |
|---------|------|----------|-------|-------------|--------|---------|
| QT-001  | ... | ABC Corp | PKR 50K | 15 days | Sent | View/Edit/PDF |

**Status Colors**:
- Draft: Gray
- Sent: Blue
- Accepted: Green
- Rejected: Red
- Expired: Orange

### 2. Create Quotation Page (THE CRITICAL FEATURE)

#### Layout: Two-Panel Design

**Left Panel: Product Catalog**
- Search bar (with barcode scan button)
- Category filter dropdown
- Product grid/list:
  ```
  [Image] Camera XYZ-123
  SKU: CAM-001
  Stock: 25
  Price: PKR 12,500
  [+ Add] button
  ```
- Click product or drag to right panel

**Right Panel: Quotation Builder**

**Header Section**:
- Customer: [Search/Select Customer] (required)
  - Shows: Name, Company, Phone
  - "Add New Customer" link
- Quotation Date: [Date picker] (default today)
- Valid Until: [Date picker] (default +30 days)
  - Quick buttons: +15 days, +30 days, +60 days
- Status: Draft (badge)

**Items Section** (drag-drop zone):
```
┌─────────────────────────────────────────────────────┐
│ Drag products here or click Add button             │
│                                                     │
│ [Product List - Draggable/Reorderable]             │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ [≡] Camera ABC-123           [X Remove]      │   │
│ │     SKU: CAM-001                             │   │
│ │     Qty: [2]  Price: [12,500]  Disc: [0]%   │   │
│ │     Line Total: PKR 25,000                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ [≡] DVR 8-Channel           [X Remove]       │   │
│ │     SKU: DVR-008                             │   │
│ │     Qty: [1]  Price: [18,000]  Disc: [5]%   │   │
│ │     Line Total: PKR 17,100                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [+ Add Product button]                              │
└─────────────────────────────────────────────────────┘
```

**Drag & Drop Features**:
- Drag product from left panel → drops into items list
- Drag [≡] handle to reorder items
- Click + Add → opens product selector modal
- Edit qty/price/discount inline
- Remove item with X button

**Calculations Section**:
```
Subtotal:              PKR 42,100
Discount: [0]% or [0 PKR]  PKR 0
                       ─────────
Subtotal after disc:   PKR 42,100

☐ Include GST [18]%     PKR 7,578
                       ─────────
Total Amount:          PKR 49,678

☐ Include Installation
  Installation Charge: [5,000] PKR
```

**Notes Section**:
- Customer Notes (shown on PDF):
  - Terms and conditions
  - Payment terms
  - Validity
  - Custom notes
- Internal Notes (not on PDF):
  - Follow-up reminders
  - Special instructions

**Action Buttons**:
- **Save Draft** (saves, stays in draft mode)
- **Finalize & Send** (locks for editing, status → Sent, opens PDF)
- **Preview PDF** (generates PDF preview)
- **Discard** (deletes draft)

### 3. Quotation Detail/View Page

**Header**:
- Quotation Number (large)
- Status badge
- Customer info card
- Dates (created, valid until)
- Created by

**Items Table** (read-only):
| Product | SKU | Qty | Price | Discount | Total |
|---------|-----|-----|-------|----------|-------|
| ...     | ... | ... | ...   | ...      | ...   |

**Totals** (right side):
- Subtotal, Discount, GST, Total

**Actions** (based on status):

**If Draft**:
- Edit (returns to builder)
- Finalize & Send
- Delete

**If Sent**:
- **Download PDF**
- **Email PDF** (future)
- **Print**
- **Follow Up** (add follow-up note + next date)
- **Mark as Accepted** → Convert to Sale
- **Mark as Rejected** (reason required)
- **Revise** (creates new version, links to original)

**If Accepted**:
- View linked sale
- Download PDF

**Follow-up Section**:
- Follow-up Date: [Date picker]
- Notes: [Textarea]
- Save Follow-up
- History of follow-ups (list)

### 4. PDF Generation

**Professional Quotation Layout**:
```
┌───────────────────────────────────────────────────┐
│ [Company Logo]        QUOTATION                   │
│                                                   │
│ Company Name                    Quote #: QT-001   │
│ Address, City                   Date: 15/03/2026  │
│ Phone: XXX  Email: XXX          Valid: 14/04/2026 │
│ GST: XXXXX                                        │
├───────────────────────────────────────────────────┤
│ BILL TO:                                          │
│ Customer Name / Company Name                      │
│ Phone: XXX                                        │
│ Address                                           │
├───────────────────────────────────────────────────┤
│                                                   │
│ # Description      SKU    Qty  Price  Disc  Total│
│ 1 Camera ABC-123   CAM-001  2  12,500  0%  25,000│
│   [Product description/specs if any]              │
│                                                   │
│ 2 DVR 8-Channel    DVR-008  1  18,000  5%  17,100│
│   [Product description/specs if any]              │
│                                                   │
├───────────────────────────────────────────────────┤
│                                   Subtotal: 42,100│
│                                   Discount:     0 │
│                                   ─────────────── │
│                                  Sub Total: 42,100│
│                                   GST @18%:  7,578│
│                                   ─────────────── │
│                                 TOTAL AMT: 49,678 │
├───────────────────────────────────────────────────┤
│ Terms & Conditions:                               │
│ • This quotation is valid for 30 days            │
│ • 12 months warranty on all products             │
│ • Installation charges not included unless       │
│   specified                                       │
│ • Prices subject to change without notice        │
│                                                   │
│ [Custom notes from quotation]                    │
├───────────────────────────────────────────────────┤
│ Prepared by: [User Name]                         │
│ Date: 15/03/2026                                 │
│                                                   │
│ For: [Company Name]                              │
│ Authorized Signatory: ________________           │
└───────────────────────────────────────────────────┘
```

**PDF Library**: Use jsPDF or react-pdf/renderer
**Features**:
- Professional layout
- Company branding
- Itemized list with descriptions
- Clear totals
- Terms & conditions
- Print-ready (A4 size)

### 5. Quotation Status Management

**Status Workflow**:
```
Draft → Sent → Accepted ──→ Sale Created
              ↓
            Rejected
              ↓
            Expired (auto after valid_until date)
```

**Automated Status Updates**:
- Cron job checks `valid_until` date
- Changes Sent → Expired if date passed
- Email alert to owner (future)

### 6. Convert Quotation to Sale

**From Quotation Detail**:
- Button: "Convert to Sale"
- Opens sale form pre-filled with:
  - Customer
  - All items (qty, prices)
  - Totals
  - GST setting
- User can edit before saving
- Links sale to quotation
- Quotation status → Accepted

## Technical Implementation

### Backend Routes
```javascript
// Quotations
GET    /api/quotations
POST   /api/quotations
GET    /api/quotations/:id
PUT    /api/quotations/:id
DELETE /api/quotations/:id
PUT    /api/quotations/:id/finalize
PUT    /api/quotations/:id/status
POST   /api/quotations/:id/follow-up
GET    /api/quotations/:id/pdf
POST   /api/quotations/:id/convert-to-sale

// Quotation items
POST   /api/quotations/:id/items
PUT    /api/quotations/:id/items/:itemId
DELETE /api/quotations/:id/items/:itemId
PUT    /api/quotations/:id/items/reorder
```

### Drag & Drop Implementation
```javascript
// Use @dnd-kit/core
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';

// Draggable product from catalog
<Draggable id={product.id} data={product}>
  <ProductCard {...product} />
</Draggable>

// Droppable quotation items area
<Droppable>
  {items.map(item => (
    <SortableItem key={item.id} id={item.id}>
      <QuotationItem item={item} />
    </SortableItem>
  ))}
</Droppable>

// Handle drop
function handleDragEnd(event) {
  const { active, over } = event;
  
  if (over && over.id === 'quotation-items') {
    // Add product to quotation
    addItemToQuotation(active.data);
  } else {
    // Reorder items
    setItems(arrayMove(items, oldIndex, newIndex));
  }
}
```

### PDF Generation
```javascript
// Option 1: jsPDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function generatePDF(quotation) {
  const doc = new jsPDF();
  
  // Header
  doc.addImage(logo, 'PNG', 10, 10, 50, 20);
  doc.text('QUOTATION', 150, 20);
  
  // Customer info
  doc.text(`Quote #: ${quotation.number}`, 10, 40);
  // ... add all content
  
  // Items table
  doc.autoTable({
    head: [['#', 'Description', 'SKU', 'Qty', 'Price', 'Disc', 'Total']],
    body: quotation.items.map((item, i) => [
      i + 1,
      item.product_name,
      item.product_sku,
      item.quantity,
      item.unit_price,
      item.discount_percentage + '%',
      item.line_total
    ]),
  });
  
  // Save
  doc.save(`Quotation-${quotation.number}.pdf`);
}

// Option 2: react-pdf/renderer (better for complex layouts)
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const QuotationPDF = ({ quotation }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text>QUOTATION</Text>
      </View>
      {/* ... rest of content */}
    </Page>
  </Document>
);

// Usage
<PDFDownloadLink document={<QuotationPDF quotation={data} />} fileName="quotation.pdf">
  Download PDF
</PDFDownloadLink>
```

### Real-time Calculations
```javascript
// Calculate line total
function calculateLineTotal(qty, price, discountPct) {
  const subtotal = qty * price;
  const discount = subtotal * (discountPct / 100);
  return subtotal - discount;
}

// Calculate quotation totals
function calculateQuotationTotals(items, discountPct, includeGst, gstRate, installationCharge) {
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const discount = subtotal * (discountPct / 100);
  const subtotalAfterDiscount = subtotal - discount;
  const gst = includeGst ? subtotalAfterDiscount * (gstRate / 100) : 0;
  const total = subtotalAfterDiscount + gst + (installationCharge || 0);
  
  return { subtotal, discount, subtotalAfterDiscount, gst, total };
}

// Update on every change
useEffect(() => {
  const totals = calculateQuotationTotals(items, discountPct, includeGst, gstRate, installationCharge);
  setQuotationTotals(totals);
}, [items, discountPct, includeGst, gstRate, installationCharge]);
```

## Testing Checklist
- [ ] Can create draft quotation
- [ ] Can drag product from catalog to quotation
- [ ] Can reorder items by dragging
- [ ] Can edit qty/price/discount inline
- [ ] Calculations update in real-time
- [ ] Can add/remove items
- [ ] Can select customer
- [ ] Can set validity period
- [ ] GST checkbox works
- [ ] Can save draft (editable)
- [ ] Can finalize quotation (locks editing)
- [ ] PDF generates correctly with all details
- [ ] PDF downloads with correct filename
- [ ] Can mark as sent/accepted/rejected
- [ ] Can add follow-up notes
- [ ] Can convert accepted quote to sale
- [ ] Quotation list filters work
- [ ] Expired quotes marked automatically

---

# PHASE 3: Sales & Billing

## Objective
Record sales, manage invoices, track payments (including partial payments).

## Features to Build

### 1. Sales List Page

Similar to quotations list:
- Filters: Date range, customer, payment status, created by
- Quick filters: Today's Sales, Unpaid, Partially Paid, Overdue
- Table with invoice #, date, customer, total, paid, balance, status
- Export to CSV

### 2. Create Sale (Two Entry Methods)

**Method A: From Quotation**
- "Convert to Sale" button from accepted quotation
- Pre-fills all data
- User reviews and saves

**Method B: Direct Sale Entry**
- Similar to quotation builder
- Customer selection
- Drag-drop products OR quick barcode scan
- Real-time calculations
- Payment recording in same form

### 3. Sale Form

**Header**:
- Customer (search/select)
- Sale Date (default today)
- Due Date (based on customer credit days)
- Invoice Number (auto-generated)

**Items** (similar to quotation):
- Drag-drop or add products
- Qty, price, discount per item
- **Serial Number field** (if product tracks serial numbers)
  - Required if product.track_serial_numbers = true
  - Optional otherwise

**Calculations**:
- Subtotal
- Discount % or amount
- Include GST checkbox
- Installation charge (if applicable)
- **Total Amount**

**Payment Section** (in same form):
- Amount Paying Now (can be partial)
- Payment Method dropdown
- Reference # (for card/bank transfer)
- Notes

**Serial Number Validation**:
```javascript
// If product tracks serial numbers
if (product.track_serial_numbers) {
  // Must enter serial number for each quantity
  // Example: Qty 2 → Enter 2 serial numbers
  serialNumbers: ['SN123456', 'SN123457']
}

// Validate serial not already sold
GET /api/products/serial/:serialNumber/check
```

**Save Options**:
- **Save & Print Invoice**
- **Save & Record Installation** (if installation included)
- **Cancel**

### 4. Payment Management

**Record Payment** (from sale detail):
- Shows: Invoice total, amount paid, balance
- Enter: Amount paying now, payment method, reference, notes
- Updates balance and payment status
- Generates receipt

**Payment History** (in sale detail):
| Date | Amount | Method | Reference | Received By |
|------|--------|--------|-----------|-------------|
| ...  | ...    | ...    | ...       | ...         |

**Payment Status Auto-update**:
```javascript
if (amountPaid >= totalAmount) {
  paymentStatus = 'Paid';
} else if (amountPaid > 0) {
  paymentStatus = 'Partial';
} else {
  paymentStatus = 'Unpaid';
}

// Check overdue
if (paymentStatus !== 'Paid' && currentDate > dueDate) {
  paymentStatus = 'Overdue';
}
```

### 5. Invoice & Receipt Printing

**Invoice Layout** (similar to quotation):
- Header with company info
- "INVOICE" title
- Invoice #, date, due date
- Customer details
- Itemized list with serial numbers
- Totals with GST breakdown
- Payment info (if paid/partial)
- Terms

**Receipt Layout** (after payment):
- "PAYMENT RECEIPT" title
- Receipt #
- Invoice # reference
- Amount paid
- Payment method
- Balance remaining
- "Thank you" message

### 6. Stock Deduction Automation

**On Sale Save**:
```javascript
// Trigger: After sale_items inserted
for each item in sale_items:
  - Update products.current_stock -= item.quantity
  - Insert inventory_movement record:
    - type: OUT
    - quantity: -item.quantity
    - reference: SALE
    - reference_id: sale.id
    - stock_before: old stock
    - stock_after: new stock
```

**Low Stock Alerts**:
- Check if new stock < reorder_level
- Show notification to inventory manager
- Highlight in product list

## Technical Implementation

### Backend Routes
```javascript
// Sales
GET    /api/sales
POST   /api/sales
GET    /api/sales/:id
PUT    /api/sales/:id
GET    /api/sales/customer/:customerId

// Convert quotation
POST   /api/quotations/:id/convert-to-sale

// Payments
GET    /api/payments/sale/:saleId
POST   /api/payments
GET    /api/payments/:id

// Serial number validation
GET    /api/products/serial/:serialNumber/check

// Receipts
GET    /api/sales/:id/invoice-pdf
GET    /api/payments/:id/receipt-pdf
```

### Stock Update Trigger
```sql
-- See database schema for trigger definition
-- Automatically updates stock on sale
```

## Testing Checklist
- [ ] Can convert quotation to sale
- [ ] Can create direct sale
- [ ] Serial numbers required when product tracks them
- [ ] Serial number validation prevents duplicates
- [ ] Stock deducts correctly on sale
- [ ] Low stock alerts trigger
- [ ] Can record full payment
- [ ] Can record partial payment
- [ ] Multiple payments per sale allowed
- [ ] Payment status updates correctly
- [ ] Overdue status auto-updates
- [ ] Invoice PDF generates correctly
- [ ] Receipt PDF generates after payment
- [ ] GST calculation correct
- [ ] Sale links to quotation (if converted)

---

# PHASE 4: Purchase Orders & Inventory

## Objective
Manage purchase orders from suppliers and track inventory movements.

## Features to Build

### 1. Supplier Management

**Supplier List**:
- Search, filter (active/inactive)
- Add/edit supplier
- View supplier details (POs, payments due)

**Supplier Form**:
- Supplier Code (auto or manual)
- Supplier Name
- Contact Person, Phone, Email
- Address
- GST Number
- Payment Terms (days)
- Notes

### 2. Purchase Order System

**PO List**:
- Filters: Status (Pending, Received), date range, supplier
- Table: PO#, date, supplier, total, received date, status
- Create PO button

**Create PO Form**:
- Supplier (select)
- PO Date (default today)
- Expected Delivery Date
- Add products:
  - Search product
  - Enter quantity needed
  - Unit cost (may differ from selling price)
  - Line total
- Subtotal, GST, Total
- Notes
- Save PO

**PO Detail Page**:
- Header: PO#, supplier, dates, status
- Items table: Product, qty ordered, qty received, cost, total
- Actions:
  - **Mark as Received** (all items)
  - **Partial Receive** (specify qty per item)
  - **Cancel PO**
  - Print PO
- Payment tracking (if paid to supplier)

### 3. Receive Stock

**From PO Detail**:
- Click "Receive Stock"
- Shows items with qty ordered
- Enter qty received per item (can be partial)
- On save:
  - Update purchase_order_items.quantity_received
  - **Update product stock** (trigger)
  - Create inventory_movements (IN)
  - If all received: PO status → Received

**Stock Update on PO Receive**:
```javascript
// Trigger on purchase_order_items update
if (quantityReceived > oldQuantityReceived) {
  const qtyReceived = quantityReceived - oldQuantityReceived;
  
  // Update product stock
  UPDATE products 
  SET current_stock += qtyReceived
  WHERE id = productId;
  
  // Log movement
  INSERT INTO inventory_movements (...)
}
```

### 4. Inventory Management

**Stock Overview Page**:
- All products with current stock
- Filters: Low stock, out of stock, category
- Columns: Product, SKU, current stock, reorder level, status
- **Low Stock Alerts** (highlighted)
- Actions: Adjust Stock, View History

**Stock Adjustment** (manual correction):
- Enter new stock quantity
- Reason (dropdown): Damage, Theft, Correction, Return
- Notes
- Creates inventory_movement (ADJUSTMENT type)

**Inventory Movements History**:
- Filter: Product, date range, movement type
- Table: Date, product, type (IN/OUT/ADJUSTMENT), qty, reference, user
- Shows stock before/after

### 5. Supplier Payment Tracking

**From PO Detail**:
- Payment Status: Unpaid/Partial/Paid
- Amount Paid, Balance Due
- Record Payment button
- Payment history list

**Similar to customer payments but for suppliers**

## Technical Implementation

### Backend Routes
```javascript
// Suppliers
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id

// Purchase Orders
GET    /api/purchase-orders
POST   /api/purchase-orders
GET    /api/purchase-orders/:id
PUT    /api/purchase-orders/:id
POST   /api/purchase-orders/:id/receive
POST   /api/purchase-orders/:id/payments

// Inventory
GET    /api/inventory/movements
GET    /api/inventory/movements/:productId
POST   /api/inventory/adjust
GET    /api/inventory/low-stock
```

### Stock Triggers
See database schema for triggers that auto-update stock on:
- Sale (OUT)
- PO receive (IN)
- Manual adjustment

## Testing Checklist
- [ ] Can create supplier
- [ ] Can create purchase order
- [ ] Can add multiple items to PO
- [ ] Can mark PO as fully received
- [ ] Can do partial receives
- [ ] Stock increases correctly on receive
- [ ] Inventory movements logged correctly
- [ ] Low stock alerts work
- [ ] Can manually adjust stock
- [ ] Adjustment creates inventory movement
- [ ] Can track supplier payments
- [ ] PO list filters work

---

# PHASE 5: Warranty & Installation Tracking

## Objective
Track product warranties and manage simple installation jobs.

## Features to Build

### 1. Warranty Management

**Warranty Auto-creation**:
```javascript
// On sale_items insert
for each item with warranty_months > 0:
  INSERT INTO warranties (
    sale_item_id,
    customer_id,
    product_id,
    serial_number,  // if available
    warranty_start_date: sale_date,
    warranty_end_date: sale_date + warranty_months,
    warranty_months,
    status: 'Active'
  )
```

**Warranty List**:
- Filters: Status (Active, Expired, Claimed), product, customer
- Expiring soon (< 30 days) highlighted
- Table: Serial#, product, customer, start, end, status
- Actions: View, Claim

**Warranty Detail**:
- Product info
- Customer info
- Warranty period
- Serial number
- Status
- Claim history (if any)

**Warranty Claim**:
- From warranty detail: "File Claim" button
- Claim Date
- Description (issue)
- Resolution (textarea)
- Resolved Date
- Updates status to 'Claimed'

**Warranty Expiry Check** (daily cron):
```javascript
// Check warranties with end_date < today
UPDATE warranties
SET status = 'Expired'
WHERE warranty_end_date < CURRENT_DATE
  AND status = 'Active';
```

### 2. Installation Management

**Installation Auto-creation**:
```javascript
// If sale.include_installation = true
INSERT INTO installations (
  job_number: 'JOB-YYYYMMDD-####',
  sale_id,
  customer_id,
  status: 'Pending',
  installation_address: customer.address,
  site_contact_name: customer.name,
  site_contact_phone: customer.phone
)
```

**Installation List**:
- Filters: Status, date, technician
- Table: Job#, customer, scheduled date, technician, status
- Actions: View, Schedule, Complete

**Installation Detail**:
- Job info
- Customer & site details
- Related sale (with products installed)
- Status
- Technician assigned
- Dates
- Notes

**Simple Workflow**:
1. **Pending** → Click "Schedule"
   - Assign technician
   - Set date/time
   - Status → Scheduled

2. **Scheduled** → Technician completes job
   - Click "Mark Complete"
   - Completion date (auto today)
   - Completion notes
   - Optional: Customer signature (future)
   - Status → Completed

**Technician Dashboard** (if logged in as technician):
- My Scheduled Jobs
- Today's jobs
- Job details
- Mark complete option

## Technical Implementation

### Backend Routes
```javascript
// Warranties
GET    /api/warranties
GET    /api/warranties/:id
GET    /api/warranties/customer/:customerId
GET    /api/warranties/expiring-soon
POST   /api/warranties/:id/claim
GET    /api/warranties/check-expiry  // Cron job endpoint

// Installations
GET    /api/installations
GET    /api/installations/:id
GET    /api/installations/technician/:technicianId
PUT    /api/installations/:id/schedule
PUT    /api/installations/:id/complete
```

### Automated Processes
```javascript
// Cron job (daily)
- Check warranty expiry
- Send alerts for expiring warranties (email - future)
- Update overdue payment statuses
```

## Testing Checklist
- [ ] Warranty auto-creates on sale
- [ ] Warranty end date calculates correctly
- [ ] Can view warranties by customer/product
- [ ] Expiring soon filter works
- [ ] Can file warranty claim
- [ ] Expired warranties marked correctly
- [ ] Installation auto-creates if included in sale
- [ ] Can schedule installation (assign technician, date)
- [ ] Can mark installation complete
- [ ] Technician sees only their jobs
- [ ] Installation status updates correctly

---

# PHASE 6: Reports & Final Polish

## Objective
Add comprehensive reports, data export, and system polish.

## Features to Build

### 1. Reports Page

**Sales Reports**:
- Date range selector
- **Sales Summary**:
  - Total sales
  - Total revenue
  - Average sale value
  - Number of transactions
- **Sales by Period** (chart):
  - Daily/weekly/monthly toggle
  - Line chart showing trend
- **Top Selling Products** (bar chart)
- **Sales by Category** (pie chart)
- **Payment Methods Breakdown**
- Export to PDF/CSV

**Inventory Reports**:
- **Current Stock Levels**:
  - All products with qty
  - Low stock highlighted
- **Stock Movements**:
  - Date range
  - IN/OUT summary
  - Movement log
- **Stock Value**:
  - Total inventory value (cost price basis)
  - Value by category
- Export to CSV

**Financial Reports**:
- **Profit & Loss**:
  - Date range
  - Revenue (sales)
  - Cost (purchases)
  - Gross profit
  - Profit margin %
- **Outstanding Payments**:
  - Customer dues (receivables)
  - Supplier dues (payables)
  - Aging report (0-30, 31-60, 61-90, 90+ days)
- **Cash Flow**:
  - Money in (sales payments)
  - Money out (supplier payments)
  - Net cash flow

**Quotation Reports**:
- **Conversion Rate**:
  - Total quotes
  - Accepted
  - Rejected
  - Pending
  - Conversion %
- **Quote Value Analysis**:
  - Total quoted value
  - Average quote value
  - Won value vs lost value

**Customer Reports**:
- **Top Customers**:
  - By revenue
  - By number of purchases
- **Customer Types** (B2B vs B2C breakdown)
- **New Customers** (trend)

### 2. Advanced Search

**Global Search** (top bar):
- Search across: Products, Customers, Quotations, Sales, POs
- Quick results dropdown
- Enter to view all results

**Smart Filters**:
- Save commonly used filter combinations
- Quick access buttons

### 3. System Settings

**Company Settings**:
- Company name, logo
- Address, contact info
- GST number
- Invoice/quotation templates (letterhead)

**Document Settings**:
- Invoice prefix, starting number
- Quotation prefix, starting number
- PO prefix, starting number
- Default validity days
- Default payment terms
- Default GST rate

**Inventory Settings**:
- Default reorder level
- Low stock alert threshold
- Stock valuation method (FIFO/Weighted Avg)

**User Settings** (per user):
- Notification preferences
- Default filters
- Dashboard layout preferences

### 4. Data Export

**Export Wizard**:
- Select entity: Products, Sales, Customers, etc.
- Date range (if applicable)
- Fields to include (checkboxes)
- Format: CSV, Excel
- Generate & download

**Bulk Import** (products/customers):
- Download template CSV
- Fill in Excel
- Upload CSV
- Validation & preview
- Import

### 5. Backup & Restore

**Backup** (Settings page):
- Manual backup button
- Downloads ZIP:
  - SQLite database file
  - Uploads folder
  - Configuration
- Filename: `backup-YYYYMMDD-HHMMSS.zip`

**Auto-backup Setup**:
- Enable daily backup
- Backup time
- Retention (days)
- Backup location

**Restore**:
- Upload backup ZIP
- Warning: "This will replace current data"
- Admin password confirmation
- Restore process

### 6. Activity Log

**Log All Actions**:
- User, timestamp, action, entity
- Example: "John Doe created Quotation QT-001"
- Filter by user, date, action type
- Export log

### 7. Dashboard Polish

**Customizable Widgets**:
- Drag to rearrange
- Show/hide widgets
- Save layout preference

**Notifications Panel**:
- Low stock alerts
- Expiring warranties
- Overdue payments
- Quotations to follow up
- Pending installations

**Quick Stats** (cards):
- Today's sales
- This month's revenue
- Pending quotations
- Low stock items (count)

### 8. UI/UX Polish

**Performance**:
- Lazy loading for lists
- Infinite scroll or pagination
- Image optimization
- Caching

**Responsive Design**:
- Works on tablet (for techs in field)
- Mobile-friendly views

**Error Handling**:
- User-friendly error messages
- Toast notifications
- Loading states
- Confirmation dialogs

**Keyboard Shortcuts**:
- Ctrl+K: Global search
- Ctrl+N: New quotation
- Ctrl+S: Save form
- Esc: Close modal

## Technical Implementation

### Backend Routes
```javascript
// Reports
GET    /api/reports/sales?from=...&to=...
GET    /api/reports/inventory
GET    /api/reports/financial
GET    /api/reports/quotations
GET    /api/reports/customers

// Export
POST   /api/export/:entityType
GET    /api/export/download/:fileId

// Import
POST   /api/import/:entityType
GET    /api/import/template/:entityType

// Backup
POST   /api/backup/create
POST   /api/backup/restore
GET    /api/backup/list

// Activity Log
GET    /api/activity-log
POST   /api/activity-log  // Middleware logs automatically
```

### Report Calculations
```javascript
// Sales summary
SELECT 
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_sale_value
FROM sales
WHERE sale_date BETWEEN ? AND ?;

// Quotation conversion rate
SELECT 
  COUNT(*) as total_quotes,
  COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted,
  COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected,
  (COUNT(CASE WHEN status = 'Accepted' THEN 1 END) * 100.0 / COUNT(*)) as conversion_rate
FROM quotations
WHERE quotation_date BETWEEN ? AND ?;

// Top selling products
SELECT 
  p.name,
  SUM(si.quantity) as total_sold,
  SUM(si.line_total) as total_revenue
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.sale_date BETWEEN ? AND ?
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;
```

### Activity Logging Middleware
```javascript
// Log all POST/PUT/DELETE operations
function activityLogger(req, res, next) {
  // After operation success
  res.on('finish', () => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      logActivity({
        user_id: req.user.id,
        action: req.method,
        entity_type: extractEntityType(req.path),
        entity_id: extractEntityId(req.path),
        ip_address: req.ip,
        timestamp: new Date()
      });
    }
  });
  next();
}
```

## Testing Checklist
- [ ] All reports calculate correctly
- [ ] Charts display properly
- [ ] Export to CSV/PDF works
- [ ] Global search finds results across entities
- [ ] Can backup database
- [ ] Backup includes all files
- [ ] Can restore from backup
- [ ] Activity log records actions
- [ ] Dashboard widgets customizable
- [ ] Notifications display correctly
- [ ] Low stock alerts trigger
- [ ] Overdue payment alerts work
- [ ] All settings save correctly
- [ ] Keyboard shortcuts work
- [ ] System is fast (<1s page loads)
- [ ] No console errors
- [ ] Mobile/tablet responsive

---

# DEPLOYMENT SUMMARY

## Quick Deploy (Ubuntu/Windows)

### Ubuntu
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Deploy app
mkdir /opt/security-sales
cd /opt/security-sales
# Copy app files here
npm install
npm run build

# Install PM2
sudo npm install -g pm2

# Start app
pm2 start npm --name "security-sales" -- start
pm2 startup
pm2 save

# Access: http://localhost:3000
```

### Windows
```cmd
# Install Node.js 18 from nodejs.org

# Deploy app
cd C:\security-sales
npm install
npm run build
npm start

# Or use PM2 on Windows
npm install -g pm2
pm2 start npm --name "security-sales" -- start

# Access: http://localhost:3000
```

## Default Login
- Username: `admin`
- Password: `Admin@123`
- **Change immediately after first login!**

## Post-Install Steps
1. Change admin password
2. Configure company settings (logo, address, GST)
3. Create user accounts
4. Add product categories
5. Import products (or add manually)
6. Add suppliers
7. Test creating quotation
8. Test barcode scanner (if using)
9. Enable daily backups

---

# SUCCESS CRITERIA

System is production-ready when:
- ✅ Can create quotation with drag-drop in < 2 minutes
- ✅ PDF generates correctly
- ✅ Can track quotation status
- ✅ Can convert quotation to sale
- ✅ Stock updates automatically on sale
- ✅ Low stock alerts work
- ✅ Can record partial payments
- ✅ Barcode scanner works (if using)
- ✅ Can receive stock from PO
- ✅ Warranties auto-create
- ✅ Installations track status
- ✅ All reports calculate correctly
- ✅ Backup/restore works
- ✅ System is fast and responsive
- ✅ User training completed

**Total Development Time**: 3-4 weeks to full production system
