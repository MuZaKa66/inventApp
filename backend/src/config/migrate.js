import db from './database.js';
import bcrypt from 'bcryptjs';

console.log('Starting database migration...');

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'sales', 'inventory', 'technician', 'accountant')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `,

  `
  CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_categories_parent ON product_categories(parent_id);
  `,

  `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    brand TEXT DEFAULT 'Hikvision',
    model_number TEXT,
    cost_price REAL DEFAULT 0,
    selling_price REAL NOT NULL,
    minimum_price REAL DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    unit TEXT DEFAULT 'piece',
    warranty_months INTEGER DEFAULT 12,
    track_serial_numbers INTEGER DEFAULT 0,
    specifications TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  `,

  `
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_name TEXT,
    customer_type TEXT NOT NULL CHECK(customer_type IN ('B2B', 'B2C')),
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    email TEXT,
    gst_number TEXT,
    ntn_number TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    credit_limit REAL DEFAULT 0,
    credit_days INTEGER DEFAULT 0,
    discount_percentage REAL DEFAULT 0,
    outstanding_balance REAL DEFAULT 0,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
  CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
  CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
  `,

  `
  CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    quotation_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired')) DEFAULT 'Draft',
    subtotal REAL DEFAULT 0,
    discount_percentage REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    include_gst INTEGER DEFAULT 0,
    gst_rate REAL DEFAULT 18,
    gst_amount REAL DEFAULT 0,
    include_installation INTEGER DEFAULT 0,
    installation_charge REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    customer_notes TEXT,
    internal_notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
  CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
  CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
  CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date);
  `,

  `
  CREATE TABLE IF NOT EXISTS quotation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount_percentage REAL DEFAULT 0,
    line_total REAL NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  );
  CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
  `,

  `
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    quotation_id INTEGER,
    customer_id INTEGER NOT NULL,
    sale_date DATE NOT NULL,
    due_date DATE,
    subtotal REAL DEFAULT 0,
    discount_percentage REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    include_gst INTEGER DEFAULT 0,
    gst_rate REAL DEFAULT 18,
    gst_amount REAL DEFAULT 0,
    include_installation INTEGER DEFAULT 0,
    installation_charge REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    amount_paid REAL DEFAULT 0,
    balance_due REAL DEFAULT 0,
    payment_status TEXT CHECK(payment_status IN ('Unpaid', 'Partial', 'Paid', 'Overdue')) DEFAULT 'Unpaid',
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
  CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
  CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(payment_status);
  `,

  `
  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    serial_number TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount_percentage REAL DEFAULT 0,
    line_total REAL NOT NULL,
    warranty_months INTEGER,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  );
  CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
  CREATE INDEX IF NOT EXISTS idx_sale_items_serial ON sale_items(serial_number);
  `,

  `
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number TEXT UNIQUE NOT NULL,
    sale_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Cheque', 'Other')) DEFAULT 'Cash',
    reference_number TEXT,
    notes TEXT,
    received_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_payments_sale ON payments(sale_id);
  CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
  `,

  `
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code TEXT UNIQUE NOT NULL,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    payment_terms_days INTEGER DEFAULT 0,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
  `,

  `
  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    received_date DATE,
    status TEXT CHECK(status IN ('Pending', 'Partial', 'Received', 'Cancelled')) DEFAULT 'Pending',
    subtotal REAL DEFAULT 0,
    gst_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);
  CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
  `,

  `
  CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost REAL NOT NULL,
    line_total REAL NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  );
  CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
  `,

  `
  CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT CHECK(movement_type IN ('IN', 'OUT', 'ADJUSTMENT')) NOT NULL,
    quantity INTEGER NOT NULL,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    reason TEXT,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_movements_product ON inventory_movements(product_id);
  CREATE INDEX IF NOT EXISTS idx_movements_type ON inventory_movements(movement_type);
  `,

  `
  CREATE TABLE IF NOT EXISTS warranties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_item_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    serial_number TEXT,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    warranty_months INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Expired', 'Claimed')) DEFAULT 'Active',
    claim_date DATE,
    claim_description TEXT,
    resolution TEXT,
    resolved_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_warranties_customer ON warranties(customer_id);
  CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
  `,

  `
  CREATE TABLE IF NOT EXISTS installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_number TEXT UNIQUE NOT NULL,
    sale_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled')) DEFAULT 'Pending',
    scheduled_date DATE,
    completed_date DATE,
    technician_id INTEGER,
    installation_address TEXT,
    site_contact_name TEXT,
    site_contact_phone TEXT,
    notes TEXT,
    completion_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS idx_installations_job ON installations(job_number);
  CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
  CREATE INDEX IF NOT EXISTS idx_installations_technician ON installations(technician_id);
  `,

  `
  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'string',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `
];

try {
  migrations.forEach((migration, index) => {
    console.log(`Running migration ${index + 1}...`);
    db.exec(migration);
  });

  const adminPassword = bcrypt.hashSync('Admin@123', 10);
  const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

  if (!checkAdmin) {
    console.log('Creating default admin user...');
    db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin@company.com', adminPassword, 'System Administrator', 'owner');
    console.log('✓ Admin user created (username: admin, password: Admin@123)');
  }

  const defaultCategories = [
    { name: 'Cameras', parent_id: null, sort_order: 1 },
    { name: 'IP Cameras', parent_id: 1, sort_order: 1 },
    { name: 'Analog Cameras', parent_id: 1, sort_order: 2 },
    { name: 'DVR/NVR', parent_id: null, sort_order: 2 },
    { name: 'Accessories', parent_id: null, sort_order: 3 }
  ];

  const checkCategories = db.prepare('SELECT COUNT(*) as count FROM product_categories').get();
  if (checkCategories.count === 0) {
    console.log('Creating default categories...');
    const insertCat = db.prepare('INSERT INTO product_categories (name, parent_id, sort_order) VALUES (?, ?, ?)');
    defaultCategories.forEach(cat => {
      insertCat.run(cat.name, cat.parent_id, cat.sort_order);
    });
    console.log('✓ Default categories created');
  }

  const defaultSettings = [
    { key: 'company_name', value: 'Security Solutions Ltd', type: 'string' },
    { key: 'gst_rate', value: '18', type: 'number' },
    { key: 'invoice_prefix', value: 'INV', type: 'string' },
    { key: 'quotation_prefix', value: 'QT', type: 'string' },
    { key: 'po_prefix', value: 'PO', type: 'string' },
    { key: 'default_warranty_months', value: '12', type: 'number' },
    { key: 'default_quotation_validity_days', value: '30', type: 'number' }
  ];

  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
  if (checkSettings.count === 0) {
    console.log('Creating default settings...');
    const insertSetting = db.prepare('INSERT INTO system_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)');
    defaultSettings.forEach(setting => {
      insertSetting.run(setting.key, setting.value, setting.type);
    });
    console.log('✓ Default settings created');
  }

  console.log('\n✅ Database migration completed successfully!');
  console.log('\nDefault credentials:');
  console.log('Username: admin');
  console.log('Password: Admin@123');
  console.log('\n⚠️  Please change the admin password after first login!\n');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}

db.close();
