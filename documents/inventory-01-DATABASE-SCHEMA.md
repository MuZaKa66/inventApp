# Database Schema - Security Equipment Inventory & Sales System

## Schema Version: 1.0
**Database**: SQLite3 (migration-ready for PostgreSQL)

---

## Table: users

**Purpose**: System users (owner, sales staff, inventory manager, technicians)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,  -- owner, sales, inventory, technician, accountant
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `CREATE INDEX idx_users_username ON users(username);`
- `CREATE INDEX idx_users_role ON users(role);`

**Default Data**:
```sql
INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
    ('admin', 'admin@company.com', '[HASHED]', 'System Admin', 'owner');
```

---

## Table: product_categories

**Purpose**: Hierarchical product categories

```sql
CREATE TABLE product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id)
);
```

**Example Categories**:
- Cameras → IP Cameras → Bullet / Dome / PTZ
- DVR / NVR → 4CH / 8CH / 16CH / 32CH
- Accessories → Cables / Power Supplies / Hard Drives / Monitors

**Indexes**:
- `CREATE INDEX idx_categories_parent ON product_categories(parent_id);`

---

## Table: products

**Purpose**: Product catalog (~500 products)

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    specifications TEXT,  -- JSON or text
    
    -- Pricing
    cost_price DECIMAL(10,2) DEFAULT 0,  -- Purchase price
    selling_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2),  -- Minimum selling price (for discounts)
    
    -- Inventory
    current_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,  -- Low stock alert threshold
    unit VARCHAR(20) DEFAULT 'piece',  -- piece, box, meter, etc.
    
    -- Warranty
    warranty_months INTEGER DEFAULT 12,
    track_serial_numbers BOOLEAN DEFAULT 0,  -- Track individual serial numbers?
    
    -- Product details
    brand VARCHAR(50) DEFAULT 'Hikvision',
    model_number VARCHAR(100),
    image_path VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    
    -- Metadata
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_products_sku ON products(sku);`
- `CREATE INDEX idx_products_barcode ON products(barcode);`
- `CREATE INDEX idx_products_name ON products(name);`
- `CREATE INDEX idx_products_category ON products(category_id);`
- `CREATE INDEX idx_products_active ON products(is_active);`

---

## Table: customers

**Purpose**: B2B and B2C customers

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id VARCHAR(20) UNIQUE NOT NULL,  -- CUS-YYYYMMDD-0001
    customer_type VARCHAR(10) NOT NULL,  -- B2B, B2C
    
    -- Personal/Contact Info (always required)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    alternate_phone VARCHAR(20),
    
    -- Company Info (for B2B)
    company_name VARCHAR(200),
    company_gst_number VARCHAR(50),  -- GST/NTN number
    company_ntn VARCHAR(50),
    
    -- Address
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    
    -- Business Info
    credit_limit DECIMAL(10,2) DEFAULT 0,  -- For credit sales
    credit_days INTEGER DEFAULT 0,  -- Payment terms (0=cash, 30=net 30)
    discount_percentage DECIMAL(5,2) DEFAULT 0,  -- Customer-specific discount
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    customer_since DATE DEFAULT CURRENT_DATE,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_customers_customer_id ON customers(customer_id);`
- `CREATE INDEX idx_customers_phone ON customers(phone);`
- `CREATE INDEX idx_customers_name ON customers(last_name, first_name);`
- `CREATE INDEX idx_customers_company ON customers(company_name);`
- `CREATE INDEX idx_customers_type ON customers(customer_type);`

---

## Table: quotations

**Purpose**: Sales quotations (THE critical feature)

```sql
CREATE TABLE quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_number VARCHAR(20) UNIQUE NOT NULL,  -- QT-YYYYMMDD-0001
    customer_id INTEGER NOT NULL,
    
    -- Quotation Info
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,  -- Validity period
    status VARCHAR(20) DEFAULT 'Draft',  -- Draft, Sent, Accepted, Rejected, Expired
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- GST (selectable)
    include_gst BOOLEAN DEFAULT 0,
    gst_percentage DECIMAL(5,2) DEFAULT 18,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Additional Info
    notes TEXT,  -- Terms, conditions, notes for customer
    internal_notes TEXT,  -- Internal notes (not shown to customer)
    
    -- Installation (if quoted)
    include_installation BOOLEAN DEFAULT 0,
    installation_charge DECIMAL(10,2) DEFAULT 0,
    
    -- Tracking
    sent_date DATE,
    accepted_date DATE,
    converted_to_sale_id INTEGER,  -- Link to sale if accepted
    rejection_reason TEXT,
    
    -- Follow-up
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Metadata
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finalized_at DATETIME,  -- When locked from editing
    finalized_by INTEGER,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (finalized_by) REFERENCES users(id),
    FOREIGN KEY (converted_to_sale_id) REFERENCES sales(id)
);
```

**Indexes**:
- `CREATE INDEX idx_quotations_number ON quotations(quotation_number);`
- `CREATE INDEX idx_quotations_customer ON quotations(customer_id);`
- `CREATE INDEX idx_quotations_date ON quotations(quotation_date);`
- `CREATE INDEX idx_quotations_status ON quotations(status);`
- `CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);`

---

## Table: quotation_items

**Purpose**: Line items in quotations

```sql
CREATE TABLE quotation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Product snapshot (in case product changes later)
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_description TEXT,
    
    -- Pricing
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(10,2) NOT NULL,  -- (quantity * unit_price) - discount
    
    -- Warranty
    warranty_months INTEGER,
    
    -- Display order (for drag-drop)
    sort_order INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

**Indexes**:
- `CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);`
- `CREATE INDEX idx_quotation_items_product ON quotation_items(product_id);`

---

## Table: sales

**Purpose**: Completed sales (invoices)

```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,  -- INV-YYYYMMDD-0001
    quotation_id INTEGER,  -- Link to quotation if converted
    customer_id INTEGER NOT NULL,
    
    -- Sale Info
    sale_date DATE NOT NULL,
    due_date DATE,
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- GST
    include_gst BOOLEAN DEFAULT 0,
    gst_percentage DECIMAL(5,2) DEFAULT 18,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment Status
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Unpaid',  -- Paid, Partial, Unpaid, Overdue
    
    -- Installation
    include_installation BOOLEAN DEFAULT 0,
    installation_charge DECIMAL(10,2) DEFAULT 0,
    installation_status VARCHAR(20),  -- Pending, Scheduled, Completed
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_sales_invoice ON sales(invoice_number);`
- `CREATE INDEX idx_sales_customer ON sales(customer_id);`
- `CREATE INDEX idx_sales_date ON sales(sale_date);`
- `CREATE INDEX idx_sales_status ON sales(payment_status);`
- `CREATE INDEX idx_sales_quotation ON sales(quotation_id);`

---

## Table: sale_items

**Purpose**: Line items in sales

```sql
CREATE TABLE sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Product snapshot
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    serial_number VARCHAR(100),  -- If tracked
    
    -- Pricing
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    line_total DECIMAL(10,2) NOT NULL,
    
    -- Warranty
    warranty_months INTEGER,
    warranty_start_date DATE,
    warranty_end_date DATE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

**Indexes**:
- `CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);`
- `CREATE INDEX idx_sale_items_product ON sale_items(product_id);`
- `CREATE INDEX idx_sale_items_serial ON sale_items(serial_number);`

---

## Table: payments

**Purpose**: Payment records (supports partial payments)

```sql
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number VARCHAR(20) UNIQUE NOT NULL,  -- PAY-YYYYMMDD-0001
    sale_id INTEGER NOT NULL,
    
    -- Payment Info
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,  -- Cash, Card, Bank Transfer, Cheque, UPI
    
    -- Payment Details
    reference_number VARCHAR(100),  -- Cheque #, Transaction ID, etc.
    bank_name VARCHAR(100),
    notes TEXT,
    
    -- Metadata
    received_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE RESTRICT,
    FOREIGN KEY (received_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_payments_sale ON payments(sale_id);`
- `CREATE INDEX idx_payments_date ON payments(payment_date);`

---

## Table: suppliers

**Purpose**: Suppliers for purchase orders

```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code VARCHAR(20) UNIQUE NOT NULL,  -- SUP-001
    supplier_name VARCHAR(200) NOT NULL,
    
    -- Contact
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Address
    address TEXT,
    city VARCHAR(50),
    
    -- Business
    gst_number VARCHAR(50),
    payment_terms INTEGER DEFAULT 0,  -- Days (0=cash, 30=net 30)
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    
    -- Notes
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);`
- `CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);`

---

## Table: purchase_orders

**Purpose**: Purchase orders to suppliers (cash flow management)

```sql
CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number VARCHAR(20) UNIQUE NOT NULL,  -- PO-YYYYMMDD-0001
    supplier_id INTEGER NOT NULL,
    
    -- PO Info
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',  -- Pending, Partial, Received, Cancelled
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Unpaid',
    payment_due_date DATE,
    
    -- Delivery
    received_date DATE,
    received_by INTEGER,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (received_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_po_number ON purchase_orders(po_number);`
- `CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);`
- `CREATE INDEX idx_po_date ON purchase_orders(po_date);`
- `CREATE INDEX idx_po_status ON purchase_orders(status);`

---

## Table: purchase_order_items

**Purpose**: Line items in purchase orders

```sql
CREATE TABLE purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Order details
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

**Indexes**:
- `CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);`
- `CREATE INDEX idx_po_items_product ON purchase_order_items(product_id);`

---

## Table: inventory_movements

**Purpose**: Track all stock movements (in/out)

```sql
CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    
    -- Movement Info
    movement_type VARCHAR(20) NOT NULL,  -- IN, OUT, ADJUSTMENT
    quantity INTEGER NOT NULL,  -- Positive for IN, negative for OUT
    reference_type VARCHAR(20),  -- PO, SALE, ADJUSTMENT
    reference_id INTEGER,  -- ID of PO, Sale, etc.
    
    -- Stock levels
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    
    -- Details
    notes TEXT,
    
    -- Metadata
    movement_date DATE DEFAULT CURRENT_DATE,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_movements_product ON inventory_movements(product_id);`
- `CREATE INDEX idx_movements_date ON inventory_movements(movement_date);`
- `CREATE INDEX idx_movements_type ON inventory_movements(movement_type);`

---

## Table: warranties

**Purpose**: Warranty tracking for sold products

```sql
CREATE TABLE warranties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_item_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    
    -- Warranty Info
    serial_number VARCHAR(100),
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    warranty_months INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'Active',  -- Active, Expired, Claimed
    
    -- Claim tracking
    claim_date DATE,
    claim_description TEXT,
    claim_resolution TEXT,
    claim_resolved_date DATE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

**Indexes**:
- `CREATE INDEX idx_warranties_serial ON warranties(serial_number);`
- `CREATE INDEX idx_warranties_customer ON warranties(customer_id);`
- `CREATE INDEX idx_warranties_end_date ON warranties(warranty_end_date);`
- `CREATE INDEX idx_warranties_status ON warranties(status);`

---

## Table: installations

**Purpose**: Simple installation job tracking

```sql
CREATE TABLE installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_number VARCHAR(20) UNIQUE NOT NULL,  -- JOB-YYYYMMDD-0001
    sale_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    
    -- Installation Info
    scheduled_date DATE,
    scheduled_time TIME,
    completed_date DATE,
    
    -- Assignment
    technician_id INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'Pending',  -- Pending, Scheduled, In Progress, Completed, Cancelled
    
    -- Site Details
    installation_address TEXT,
    site_contact_name VARCHAR(100),
    site_contact_phone VARCHAR(20),
    
    -- Notes
    installation_notes TEXT,
    completion_notes TEXT,
    customer_signature_required BOOLEAN DEFAULT 1,
    customer_signature_path VARCHAR(255),
    
    -- Metadata
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (technician_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Indexes**:
- `CREATE INDEX idx_installations_job ON installations(job_number);`
- `CREATE INDEX idx_installations_sale ON installations(sale_id);`
- `CREATE INDEX idx_installations_customer ON installations(customer_id);`
- `CREATE INDEX idx_installations_technician ON installations(technician_id);`
- `CREATE INDEX idx_installations_date ON installations(scheduled_date);`
- `CREATE INDEX idx_installations_status ON installations(status);`

---

## Table: system_settings

**Purpose**: Application configuration

```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Settings**:
```sql
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('company_name', 'Hikvision Security Solutions', 'Company name'),
    ('company_address', '', 'Company address for invoices'),
    ('company_phone', '', 'Contact phone'),
    ('company_email', '', 'Contact email'),
    ('company_gst', '', 'GST/NTN number'),
    ('currency', 'PKR', 'Currency'),
    ('default_gst_rate', '18', 'Default GST percentage'),
    ('quotation_validity_days', '30', 'Default quotation validity'),
    ('low_stock_alert', '10', 'Low stock alert threshold'),
    ('invoice_prefix', 'INV', 'Invoice number prefix'),
    ('quotation_prefix', 'QT', 'Quotation number prefix'),
    ('po_prefix', 'PO', 'Purchase order prefix');
```

---

## Relationships Summary

```
users → quotations (created_by)
users → sales (created_by)
users → purchase_orders (created_by)

customers → quotations (one-to-many)
customers → sales (one-to-many)
customers → warranties (one-to-many)

quotations → quotation_items (one-to-many)
quotations → sales (one-to-one when converted)

sales → sale_items (one-to-many)
sales → payments (one-to-many)
sales → installations (one-to-one)

products → quotation_items
products → sale_items
products → inventory_movements

suppliers → purchase_orders (one-to-many)
purchase_orders → purchase_order_items (one-to-many)
```

---

## Data Migration Notes (SQLite → PostgreSQL)

- Change `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- Change `DATETIME` → `TIMESTAMP`
- Add schema versioning
- Implement migration scripts
- Test performance with larger datasets

---

## Triggers for Auto-Updates

### Update Stock on Sale
```sql
CREATE TRIGGER update_stock_on_sale
AFTER INSERT ON sale_items
BEGIN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, stock_before, stock_after, created_by)
    VALUES (NEW.product_id, 'OUT', -NEW.quantity, 'SALE', NEW.sale_id, 
            (SELECT current_stock FROM products WHERE id = NEW.product_id) + NEW.quantity,
            (SELECT current_stock FROM products WHERE id = NEW.product_id),
            (SELECT created_by FROM sales WHERE id = NEW.sale_id));
END;
```

### Update Stock on PO Receipt
```sql
CREATE TRIGGER update_stock_on_po_receive
AFTER UPDATE ON purchase_order_items
WHEN NEW.quantity_received > OLD.quantity_received
BEGIN
    UPDATE products 
    SET current_stock = current_stock + (NEW.quantity_received - OLD.quantity_received)
    WHERE id = NEW.product_id;
    
    INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, stock_before, stock_after, created_by)
    VALUES (NEW.product_id, 'IN', (NEW.quantity_received - OLD.quantity_received), 'PO', NEW.po_id,
            (SELECT current_stock FROM products WHERE id = NEW.product_id) - (NEW.quantity_received - OLD.quantity_received),
            (SELECT current_stock FROM products WHERE id = NEW.product_id),
            (SELECT received_by FROM purchase_orders WHERE id = NEW.po_id));
END;
```

---

## Backup Strategy

**Daily Automated Backup**:
- SQLite file: `security-sales-YYYYMMDD.db`
- Keep last 30 days
- External storage recommended

**Weekly Full Backup**:
- Database + uploaded files
- Compressed archive
- Off-site storage

---

This schema is optimized for **fast queries, simple transactions, and easy reporting** while maintaining data integrity and supporting future growth.
