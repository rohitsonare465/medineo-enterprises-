# Medineo ERP - Database Schema Design
## PostgreSQL Database Structure

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MEDINEO ERP - DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    users     │
                                    ├──────────────┤
                                    │ id           │
                                    │ email        │
                                    │ password     │
                                    │ role         │
                                    │ is_active    │
                                    └──────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
           │   vendors    │       │  customers   │       │  inquiries   │
           ├──────────────┤       ├──────────────┤       ├──────────────┤
           │ id           │       │ id           │       │ id           │
           │ name         │       │ name         │       │ company_name │
           │ gstin        │       │ gstin        │       │ contact_name │
           │ address      │       │ drug_license │       │ status       │
           │ payment_terms│       │ credit_limit │       │ customer_id  │─┐
           └──────┬───────┘       └──────┬───────┘       └──────────────┘ │
                  │                      │                                 │
                  │                      └─────────────────────────────────┘
                  │                      │
                  ▼                      ▼
         ┌──────────────┐       ┌──────────────┐
         │  purchases   │       │    sales     │
         ├──────────────┤       ├──────────────┤
         │ id           │       │ id           │
         │ vendor_id    │───┐   │ customer_id  │───┐
         │ invoice_no   │   │   │ invoice_no   │   │
         │ invoice_date │   │   │ invoice_date │   │
         │ total_amount │   │   │ total_amount │   │
         │ gst_amount   │   │   │ gst_amount   │   │
         └──────┬───────┘   │   └──────┬───────┘   │
                │           │          │           │
                ▼           │          ▼           │
      ┌────────────────┐    │  ┌────────────────┐  │
      │purchase_items  │    │  │  sales_items   │  │
      ├────────────────┤    │  ├────────────────┤  │
      │ id             │    │  │ id             │  │
      │ purchase_id    │    │  │ sale_id        │  │
      │ medicine_id    │─┐  │  │ medicine_id    │──┼─┐
      │ batch_id       │─┼──┼──│ batch_id       │  │ │
      │ quantity       │ │  │  │ quantity       │  │ │
      │ rate           │ │  │  │ rate           │  │ │
      └────────────────┘ │  │  └────────────────┘  │ │
                         │  │                      │ │
                         │  │                      │ │
                         ▼  │                      │ │
                  ┌──────────────┐                 │ │
                  │  medicines   │◄────────────────┘ │
                  ├──────────────┤                   │
                  │ id           │                   │
                  │ name         │                   │
                  │ generic_name │                   │
                  │ brand        │                   │
                  │ category     │                   │
                  │ hsn_code     │                   │
                  │ gst_rate     │                   │
                  └──────┬───────┘                   │
                         │                           │
                         ▼                           │
                  ┌──────────────┐                   │
                  │   batches    │◄──────────────────┘
                  ├──────────────┤
                  │ id           │
                  │ medicine_id  │
                  │ batch_number │
                  │ expiry_date  │
                  │ mrp          │
                  │ purchase_rate│
                  │ selling_rate │
                  │ quantity     │
                  └──────────────┘


              ┌─────────────────────────────────────────┐
              │           LEDGER SYSTEM                  │
              ├─────────────────────────────────────────┤
              │                                         │
              │  ┌──────────────────┐                   │
              │  │ customer_ledger  │                   │
              │  ├──────────────────┤                   │
              │  │ id               │                   │
              │  │ customer_id      │───► customers     │
              │  │ transaction_date │                   │
              │  │ type             │                   │
              │  │ reference_id     │───► sales         │
              │  │ debit            │                   │
              │  │ credit           │                   │
              │  │ balance          │                   │
              │  └──────────────────┘                   │
              │                                         │
              │  ┌──────────────────┐                   │
              │  │  vendor_ledger   │                   │
              │  ├──────────────────┤                   │
              │  │ id               │                   │
              │  │ vendor_id        │───► vendors       │
              │  │ transaction_date │                   │
              │  │ type             │                   │
              │  │ reference_id     │───► purchases     │
              │  │ debit            │                   │
              │  │ credit           │                   │
              │  │ balance          │                   │
              │  └──────────────────┘                   │
              │                                         │
              └─────────────────────────────────────────┘
```

---

## 2. TABLE DEFINITIONS

### 2.1 Users & Authentication

```sql
-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'STAFF', 'ACCOUNTANT')),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

-- Index for login queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    device_info     VARCHAR(255),
    ip_address      INET,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 2.2 Vendor Management

```sql
-- ============================================
-- VENDORS TABLE (Purchase Side)
-- ============================================
CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,  -- V001, V002, etc.
    name            VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(100),
    phone           VARCHAR(15) NOT NULL,
    email           VARCHAR(255),
    
    -- Address
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    state_code      VARCHAR(2) NOT NULL,  -- For GST (e.g., 27 for Maharashtra)
    pincode         VARCHAR(6) NOT NULL,
    
    -- GST Details
    gstin           VARCHAR(15) UNIQUE,
    pan             VARCHAR(10),
    
    -- Payment Terms
    payment_terms   VARCHAR(20) NOT NULL DEFAULT 'NET30' 
                    CHECK (payment_terms IN ('COD', 'NET15', 'NET30', 'NET45', 'NET60')),
    credit_days     INTEGER DEFAULT 30,
    
    -- Balances
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,  -- Outstanding payable
    
    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    
    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_gstin ON vendors(gstin);
CREATE INDEX idx_vendors_code ON vendors(code);
```

### 2.3 Customer Management

```sql
-- ============================================
-- CUSTOMERS TABLE (Sales Side)
-- ============================================
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,  -- C001, C002, etc.
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(20) NOT NULL DEFAULT 'RETAIL' 
                    CHECK (type IN ('RETAIL', 'HOSPITAL', 'CLINIC', 'WHOLESALE')),
    contact_person  VARCHAR(100),
    phone           VARCHAR(15) NOT NULL,
    email           VARCHAR(255),
    
    -- Address
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    state_code      VARCHAR(2) NOT NULL,  -- For GST
    pincode         VARCHAR(6) NOT NULL,
    
    -- Regulatory Details
    gstin           VARCHAR(15),
    drug_license_no VARCHAR(50) NOT NULL,
    dl_expiry_date  DATE,
    pan             VARCHAR(10),
    
    -- Credit Terms
    credit_limit    DECIMAL(15, 2) DEFAULT 0,
    credit_days     INTEGER DEFAULT 0,
    credit_blocked  BOOLEAN DEFAULT FALSE,
    
    -- Balances
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,  -- Outstanding receivable
    
    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    
    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_gstin ON customers(gstin);
CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_dl ON customers(drug_license_no);
```

### 2.4 Medicine & Batch Management

```sql
-- ============================================
-- MEDICINE CATEGORIES
-- ============================================
CREATE TABLE medicine_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO medicine_categories (name) VALUES 
('Tablets'), ('Capsules'), ('Syrups'), ('Injections'), 
('Ointments'), ('Drops'), ('Powders'), ('Devices'), ('Others');

-- ============================================
-- MEDICINES MASTER TABLE
-- ============================================
CREATE TABLE medicines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) UNIQUE NOT NULL,  -- MED001, MED002
    name            VARCHAR(200) NOT NULL,
    generic_name    VARCHAR(200),
    brand           VARCHAR(100),
    manufacturer    VARCHAR(200),
    
    -- Classification
    category_id     UUID REFERENCES medicine_categories(id),
    form            VARCHAR(50),  -- 10 Tablets, 100ml, etc.
    strength        VARCHAR(50),  -- 500mg, 10mg/ml, etc.
    pack_size       INTEGER DEFAULT 1,  -- Units per pack
    
    -- GST & HSN
    hsn_code        VARCHAR(8) NOT NULL,
    gst_rate        DECIMAL(5, 2) NOT NULL DEFAULT 12.00 
                    CHECK (gst_rate IN (0, 5, 12, 18, 28)),
    
    -- Pricing (Default values, actual in batches)
    default_mrp     DECIMAL(12, 2),
    min_stock       INTEGER DEFAULT 10,  -- Minimum stock alert level
    
    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    is_discontinued BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_medicines_code ON medicines(code);
CREATE INDEX idx_medicines_brand ON medicines(brand);
CREATE INDEX idx_medicines_category ON medicines(category_id);

-- ============================================
-- BATCHES TABLE
-- ============================================
CREATE TABLE batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id     UUID NOT NULL REFERENCES medicines(id),
    batch_number    VARCHAR(50) NOT NULL,
    
    -- Dates
    mfg_date        DATE,
    expiry_date     DATE NOT NULL,
    
    -- Pricing
    mrp             DECIMAL(12, 2) NOT NULL,
    purchase_rate   DECIMAL(12, 2) NOT NULL,  -- Rate at which purchased
    selling_rate    DECIMAL(12, 2) NOT NULL,  -- Rate at which sold
    ptr             DECIMAL(12, 2),  -- Price to Retailer
    pts             DECIMAL(12, 2),  -- Price to Stockist
    
    -- Stock
    initial_qty     INTEGER NOT NULL DEFAULT 0,
    current_qty     INTEGER NOT NULL DEFAULT 0,
    reserved_qty    INTEGER NOT NULL DEFAULT 0,  -- Reserved for pending orders
    
    -- Status
    status          VARCHAR(20) DEFAULT 'ACTIVE' 
                    CHECK (status IN ('ACTIVE', 'DEPLETED', 'EXPIRED', 'RETURNED')),
    
    -- Source
    purchase_id     UUID,  -- Reference to purchase entry
    
    -- Timestamps
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one batch number per medicine
    UNIQUE(medicine_id, batch_number)
);

CREATE INDEX idx_batches_medicine ON batches(medicine_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_number ON batches(batch_number);

-- View for available stock (FIFO order)
CREATE VIEW v_available_batches AS
SELECT 
    b.*,
    m.name as medicine_name,
    m.code as medicine_code,
    (b.current_qty - b.reserved_qty) as available_qty
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE b.status = 'ACTIVE'
  AND b.current_qty > b.reserved_qty
  AND b.expiry_date > CURRENT_DATE
ORDER BY b.expiry_date ASC;  -- FIFO: earliest expiry first
```

### 2.5 Purchase Management

```sql
-- ============================================
-- PURCHASES TABLE (Header)
-- ============================================
CREATE TABLE purchases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Invoice Details
    invoice_number      VARCHAR(50) UNIQUE NOT NULL,
    invoice_date        DATE NOT NULL,
    received_date       DATE DEFAULT CURRENT_DATE,
    
    -- Vendor
    vendor_id           UUID NOT NULL REFERENCES vendors(id),
    
    -- Amounts
    subtotal            DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(15, 2) DEFAULT 0,
    taxable_amount      DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- GST Breakup
    cgst_amount         DECIMAL(15, 2) DEFAULT 0,
    sgst_amount         DECIMAL(15, 2) DEFAULT 0,
    igst_amount         DECIMAL(15, 2) DEFAULT 0,
    total_gst           DECIMAL(15, 2) DEFAULT 0,
    
    -- Other Charges
    freight_charges     DECIMAL(12, 2) DEFAULT 0,
    other_charges       DECIMAL(12, 2) DEFAULT 0,
    round_off           DECIMAL(8, 2) DEFAULT 0,
    
    -- Grand Total
    grand_total         DECIMAL(15, 2) NOT NULL,
    
    -- Payment
    payment_status      VARCHAR(20) DEFAULT 'PENDING' 
                        CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID')),
    paid_amount         DECIMAL(15, 2) DEFAULT 0,
    due_date            DATE,
    
    -- Status
    status              VARCHAR(20) DEFAULT 'DRAFT' 
                        CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    
    -- Notes
    notes               TEXT,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    confirmed_by        UUID REFERENCES users(id),
    confirmed_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_purchases_date ON purchases(invoice_date);
CREATE INDEX idx_purchases_status ON purchases(status);

-- ============================================
-- PURCHASE ITEMS TABLE (Line Items)
-- ============================================
CREATE TABLE purchase_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id     UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    
    -- Medicine & Batch
    medicine_id     UUID NOT NULL REFERENCES medicines(id),
    batch_id        UUID REFERENCES batches(id),  -- Created after purchase confirmation
    
    -- Batch Details (used to create batch record)
    batch_number    VARCHAR(50) NOT NULL,
    mfg_date        DATE,
    expiry_date     DATE NOT NULL,
    
    -- Quantity & Pricing
    quantity        INTEGER NOT NULL,
    free_qty        INTEGER DEFAULT 0,
    total_qty       INTEGER GENERATED ALWAYS AS (quantity + free_qty) STORED,
    
    mrp             DECIMAL(12, 2) NOT NULL,
    purchase_rate   DECIMAL(12, 2) NOT NULL,  -- Per unit purchase price
    selling_rate    DECIMAL(12, 2) NOT NULL,  -- Per unit selling price
    
    -- Discount
    discount_pct    DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Tax
    hsn_code        VARCHAR(8),
    gst_rate        DECIMAL(5, 2) NOT NULL,
    taxable_amount  DECIMAL(12, 2) NOT NULL,
    cgst_amount     DECIMAL(12, 2) DEFAULT 0,
    sgst_amount     DECIMAL(12, 2) DEFAULT 0,
    igst_amount     DECIMAL(12, 2) DEFAULT 0,
    
    -- Line Total
    line_total      DECIMAL(12, 2) NOT NULL,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_medicine ON purchase_items(medicine_id);
CREATE INDEX idx_purchase_items_batch ON purchase_items(batch_id);

-- ============================================
-- PURCHASE RETURNS TABLE
-- ============================================
CREATE TABLE purchase_returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number       VARCHAR(50) UNIQUE NOT NULL,
    return_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    
    original_purchase_id UUID NOT NULL REFERENCES purchases(id),
    vendor_id           UUID NOT NULL REFERENCES vendors(id),
    
    subtotal            DECIMAL(15, 2) NOT NULL,
    gst_amount          DECIMAL(15, 2) NOT NULL,
    grand_total         DECIMAL(15, 2) NOT NULL,
    
    reason              TEXT,
    status              VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE TABLE purchase_return_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    purchase_item_id    UUID NOT NULL REFERENCES purchase_items(id),
    batch_id            UUID NOT NULL REFERENCES batches(id),
    
    quantity            INTEGER NOT NULL,
    rate                DECIMAL(12, 2) NOT NULL,
    gst_amount          DECIMAL(12, 2) NOT NULL,
    total               DECIMAL(12, 2) NOT NULL,
    
    reason              VARCHAR(100)
);
```

### 2.6 Sales Management

```sql
-- ============================================
-- SALES TABLE (Header)
-- ============================================
CREATE TABLE sales (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Invoice Details
    invoice_number      VARCHAR(50) UNIQUE NOT NULL,  -- MED/2025-26/0001
    invoice_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Customer
    customer_id         UUID NOT NULL REFERENCES customers(id),
    
    -- Billing Address (Snapshot from customer)
    billing_name        VARCHAR(200) NOT NULL,
    billing_address     TEXT NOT NULL,
    billing_gstin       VARCHAR(15),
    billing_state       VARCHAR(100) NOT NULL,
    billing_state_code  VARCHAR(2) NOT NULL,
    
    -- Shipping Address
    shipping_address    TEXT,
    
    -- Amounts
    subtotal            DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(15, 2) DEFAULT 0,
    taxable_amount      DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- GST Breakup
    cgst_amount         DECIMAL(15, 2) DEFAULT 0,
    sgst_amount         DECIMAL(15, 2) DEFAULT 0,
    igst_amount         DECIMAL(15, 2) DEFAULT 0,
    total_gst           DECIMAL(15, 2) DEFAULT 0,
    
    -- Other Charges
    freight_charges     DECIMAL(12, 2) DEFAULT 0,
    round_off           DECIMAL(8, 2) DEFAULT 0,
    
    -- Grand Total
    grand_total         DECIMAL(15, 2) NOT NULL,
    amount_in_words     VARCHAR(500),
    
    -- Payment
    payment_mode        VARCHAR(20) DEFAULT 'CREDIT'
                        CHECK (payment_mode IN ('CASH', 'CREDIT', 'UPI', 'CHEQUE', 'NEFT')),
    payment_status      VARCHAR(20) DEFAULT 'PENDING' 
                        CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID')),
    paid_amount         DECIMAL(15, 2) DEFAULT 0,
    due_date            DATE,
    
    -- Status
    status              VARCHAR(20) DEFAULT 'DRAFT' 
                        CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    
    -- Notes
    notes               TEXT,
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    confirmed_by        UUID REFERENCES users(id),
    confirmed_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(invoice_date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_invoice_number ON sales(invoice_number);

-- ============================================
-- SALES ITEMS TABLE (Line Items)
-- ============================================
CREATE TABLE sales_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    
    -- Medicine & Batch
    medicine_id     UUID NOT NULL REFERENCES medicines(id),
    batch_id        UUID NOT NULL REFERENCES batches(id),
    
    -- Batch Details (Snapshot)
    batch_number    VARCHAR(50) NOT NULL,
    expiry_date     DATE NOT NULL,
    
    -- Quantity & Pricing
    quantity        INTEGER NOT NULL,
    mrp             DECIMAL(12, 2) NOT NULL,
    rate            DECIMAL(12, 2) NOT NULL,  -- Actual selling rate
    
    -- Discount
    discount_pct    DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Tax
    hsn_code        VARCHAR(8),
    gst_rate        DECIMAL(5, 2) NOT NULL,
    taxable_amount  DECIMAL(12, 2) NOT NULL,
    cgst_amount     DECIMAL(12, 2) DEFAULT 0,
    sgst_amount     DECIMAL(12, 2) DEFAULT 0,
    igst_amount     DECIMAL(12, 2) DEFAULT 0,
    
    -- Line Total
    line_total      DECIMAL(12, 2) NOT NULL,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_items_sale ON sales_items(sale_id);
CREATE INDEX idx_sales_items_medicine ON sales_items(medicine_id);
CREATE INDEX idx_sales_items_batch ON sales_items(batch_id);

-- ============================================
-- SALES RETURNS (Credit Notes)
-- ============================================
CREATE TABLE sales_returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_number  VARCHAR(50) UNIQUE NOT NULL,
    return_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    
    original_sale_id    UUID NOT NULL REFERENCES sales(id),
    customer_id         UUID NOT NULL REFERENCES customers(id),
    
    subtotal            DECIMAL(15, 2) NOT NULL,
    gst_amount          DECIMAL(15, 2) NOT NULL,
    grand_total         DECIMAL(15, 2) NOT NULL,
    
    reason              TEXT,
    status              VARCHAR(20) DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE TABLE sales_return_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    sales_item_id       UUID NOT NULL REFERENCES sales_items(id),
    batch_id            UUID NOT NULL REFERENCES batches(id),
    
    quantity            INTEGER NOT NULL,
    rate                DECIMAL(12, 2) NOT NULL,
    gst_amount          DECIMAL(12, 2) NOT NULL,
    total               DECIMAL(12, 2) NOT NULL,
    
    return_to_stock     BOOLEAN DEFAULT FALSE,  -- Can returned goods be resold?
    reason              VARCHAR(100)
);

-- ============================================
-- INVOICE NUMBER SEQUENCE
-- ============================================
CREATE TABLE invoice_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_year  VARCHAR(9) NOT NULL,  -- 2025-26
    prefix          VARCHAR(10) NOT NULL DEFAULT 'MED',
    last_number     INTEGER NOT NULL DEFAULT 0,
    
    UNIQUE(financial_year, prefix)
);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_prefix VARCHAR DEFAULT 'MED')
RETURNS VARCHAR AS $$
DECLARE
    v_fy VARCHAR(9);
    v_seq INTEGER;
    v_invoice VARCHAR(50);
BEGIN
    -- Determine financial year (April to March)
    IF EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
        v_fy := EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                SUBSTRING(CAST(EXTRACT(YEAR FROM CURRENT_DATE) + 1 AS VARCHAR), 3, 2);
    ELSE
        v_fy := (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || 
                SUBSTRING(CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS VARCHAR), 3, 2);
    END IF;
    
    -- Get or create sequence
    INSERT INTO invoice_sequences (financial_year, prefix, last_number)
    VALUES (v_fy, p_prefix, 1)
    ON CONFLICT (financial_year, prefix) 
    DO UPDATE SET last_number = invoice_sequences.last_number + 1
    RETURNING last_number INTO v_seq;
    
    -- Format: MED/2025-26/0001
    v_invoice := p_prefix || '/' || v_fy || '/' || LPAD(v_seq::TEXT, 4, '0');
    
    RETURN v_invoice;
END;
$$ LANGUAGE plpgsql;
```

### 2.7 Ledger & Payments

```sql
-- ============================================
-- CUSTOMER LEDGER (Receivables)
-- ============================================
CREATE TABLE customer_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID NOT NULL REFERENCES customers(id),
    
    transaction_date    DATE NOT NULL,
    transaction_type    VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN (
                            'OPENING_BALANCE',
                            'SALES_INVOICE',
                            'SALES_RETURN',
                            'PAYMENT_RECEIVED',
                            'ADJUSTMENT'
                        )),
    
    -- Reference to source document
    reference_type      VARCHAR(30),  -- 'SALE', 'SALES_RETURN', 'PAYMENT'
    reference_id        UUID,
    reference_number    VARCHAR(50),
    
    -- Amounts
    debit_amount        DECIMAL(15, 2) DEFAULT 0,   -- Increases receivable
    credit_amount       DECIMAL(15, 2) DEFAULT 0,   -- Decreases receivable
    running_balance     DECIMAL(15, 2) NOT NULL,
    
    narration           TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_customer_ledger_customer ON customer_ledger(customer_id);
CREATE INDEX idx_customer_ledger_date ON customer_ledger(transaction_date);
CREATE INDEX idx_customer_ledger_reference ON customer_ledger(reference_type, reference_id);

-- ============================================
-- VENDOR LEDGER (Payables)
-- ============================================
CREATE TABLE vendor_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id           UUID NOT NULL REFERENCES vendors(id),
    
    transaction_date    DATE NOT NULL,
    transaction_type    VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN (
                            'OPENING_BALANCE',
                            'PURCHASE_INVOICE',
                            'PURCHASE_RETURN',
                            'PAYMENT_MADE',
                            'ADJUSTMENT'
                        )),
    
    -- Reference to source document
    reference_type      VARCHAR(30),
    reference_id        UUID,
    reference_number    VARCHAR(50),
    
    -- Amounts
    debit_amount        DECIMAL(15, 2) DEFAULT 0,   -- Decreases payable
    credit_amount       DECIMAL(15, 2) DEFAULT 0,   -- Increases payable
    running_balance     DECIMAL(15, 2) NOT NULL,
    
    narration           TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_vendor_ledger_vendor ON vendor_ledger(vendor_id);
CREATE INDEX idx_vendor_ledger_date ON vendor_ledger(transaction_date);

-- ============================================
-- PAYMENTS RECEIVED (From Customers)
-- ============================================
CREATE TABLE payments_received (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number      VARCHAR(50) UNIQUE NOT NULL,
    receipt_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    
    customer_id         UUID NOT NULL REFERENCES customers(id),
    
    amount              DECIMAL(15, 2) NOT NULL,
    payment_mode        VARCHAR(20) NOT NULL
                        CHECK (payment_mode IN ('CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS')),
    
    -- For cheque/NEFT
    bank_name           VARCHAR(100),
    cheque_number       VARCHAR(20),
    transaction_ref     VARCHAR(100),
    
    -- Allocation
    is_advance          BOOLEAN DEFAULT FALSE,
    allocated_amount    DECIMAL(15, 2) DEFAULT 0,
    unallocated_amount  DECIMAL(15, 2),
    
    notes               TEXT,
    status              VARCHAR(20) DEFAULT 'CONFIRMED'
                        CHECK (status IN ('CONFIRMED', 'BOUNCED', 'CANCELLED')),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

-- Allocation of payments against invoices
CREATE TABLE payment_allocations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL REFERENCES payments_received(id),
    sale_id             UUID NOT NULL REFERENCES sales(id),
    allocated_amount    DECIMAL(15, 2) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAYMENTS MADE (To Vendors)
-- ============================================
CREATE TABLE payments_made (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number      VARCHAR(50) UNIQUE NOT NULL,
    payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    
    vendor_id           UUID NOT NULL REFERENCES vendors(id),
    
    amount              DECIMAL(15, 2) NOT NULL,
    payment_mode        VARCHAR(20) NOT NULL
                        CHECK (payment_mode IN ('CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS')),
    
    bank_name           VARCHAR(100),
    cheque_number       VARCHAR(20),
    transaction_ref     VARCHAR(100),
    
    is_advance          BOOLEAN DEFAULT FALSE,
    
    notes               TEXT,
    status              VARCHAR(20) DEFAULT 'CONFIRMED'
                        CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

-- Allocation against purchase invoices
CREATE TABLE vendor_payment_allocations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          UUID NOT NULL REFERENCES payments_made(id),
    purchase_id         UUID NOT NULL REFERENCES purchases(id),
    allocated_amount    DECIMAL(15, 2) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.8 Stock Management

```sql
-- ============================================
-- STOCK MOVEMENTS (Audit Trail)
-- ============================================
CREATE TABLE stock_movements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    batch_id            UUID NOT NULL REFERENCES batches(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    
    movement_type       VARCHAR(30) NOT NULL
                        CHECK (movement_type IN (
                            'PURCHASE_IN',
                            'SALES_OUT',
                            'SALES_RETURN_IN',
                            'PURCHASE_RETURN_OUT',
                            'ADJUSTMENT_IN',
                            'ADJUSTMENT_OUT',
                            'EXPIRY_WRITE_OFF',
                            'DAMAGE_WRITE_OFF'
                        )),
    
    -- Reference
    reference_type      VARCHAR(30),
    reference_id        UUID,
    reference_number    VARCHAR(50),
    
    -- Quantities
    quantity_before     INTEGER NOT NULL,
    quantity_change     INTEGER NOT NULL,  -- Positive for IN, Negative for OUT
    quantity_after      INTEGER NOT NULL,
    
    -- Cost tracking
    rate                DECIMAL(12, 2),
    
    notes               TEXT,
    movement_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_stock_movements_batch ON stock_movements(batch_id);
CREATE INDEX idx_stock_movements_medicine ON stock_movements(medicine_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);

-- ============================================
-- STOCK ADJUSTMENTS
-- ============================================
CREATE TABLE stock_adjustments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number   VARCHAR(50) UNIQUE NOT NULL,
    adjustment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    
    adjustment_type     VARCHAR(20) NOT NULL
                        CHECK (adjustment_type IN ('INCREASE', 'DECREASE', 'EXPIRY', 'DAMAGE')),
    
    reason              TEXT NOT NULL,
    status              VARCHAR(20) DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED')),
    
    total_value         DECIMAL(15, 2),
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID REFERENCES users(id),
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMP WITH TIME ZONE
);

CREATE TABLE stock_adjustment_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id       UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    
    batch_id            UUID NOT NULL REFERENCES batches(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    
    quantity_before     INTEGER NOT NULL,
    quantity_adjust     INTEGER NOT NULL,
    quantity_after      INTEGER NOT NULL,
    
    rate                DECIMAL(12, 2),
    value               DECIMAL(12, 2),
    
    reason              TEXT
);

-- ============================================
-- EXPIRY ALERTS VIEW
-- ============================================
CREATE VIEW v_expiry_alerts AS
SELECT 
    b.id as batch_id,
    m.id as medicine_id,
    m.code as medicine_code,
    m.name as medicine_name,
    b.batch_number,
    b.expiry_date,
    b.current_qty,
    b.mrp,
    (b.current_qty * b.purchase_rate) as stock_value,
    CASE 
        WHEN b.expiry_date <= CURRENT_DATE THEN 'EXPIRED'
        WHEN b.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN '30_DAYS'
        WHEN b.expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN '60_DAYS'
        WHEN b.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN '90_DAYS'
    END as alert_type
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE b.current_qty > 0
  AND b.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY b.expiry_date ASC;

-- ============================================
-- LOW STOCK ALERTS VIEW
-- ============================================
CREATE VIEW v_low_stock_alerts AS
SELECT 
    m.id as medicine_id,
    m.code as medicine_code,
    m.name as medicine_name,
    m.brand,
    m.min_stock,
    COALESCE(SUM(b.current_qty), 0) as total_stock,
    m.min_stock - COALESCE(SUM(b.current_qty), 0) as shortage
FROM medicines m
LEFT JOIN batches b ON m.id = b.medicine_id AND b.status = 'ACTIVE'
WHERE m.is_active = TRUE
GROUP BY m.id, m.code, m.name, m.brand, m.min_stock
HAVING COALESCE(SUM(b.current_qty), 0) < m.min_stock
ORDER BY shortage DESC;
```

### 2.9 Inquiries (From Website)

```sql
-- ============================================
-- INQUIRIES TABLE
-- ============================================
CREATE TABLE inquiries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Info
    company_name        VARCHAR(200) NOT NULL,
    contact_person      VARCHAR(100) NOT NULL,
    phone               VARCHAR(15) NOT NULL,
    email               VARCHAR(255),
    
    -- Address
    city                VARCHAR(100),
    state               VARCHAR(100),
    
    -- Inquiry Details
    inquiry_type        VARCHAR(50) DEFAULT 'GENERAL'
                        CHECK (inquiry_type IN ('GENERAL', 'PARTNERSHIP', 'BULK_ORDER', 'FEEDBACK')),
    message             TEXT,
    
    -- Status Tracking
    status              VARCHAR(20) DEFAULT 'NEW'
                        CHECK (status IN ('NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'CLOSED')),
    
    -- Assignment
    assigned_to         UUID REFERENCES users(id),
    
    -- Conversion
    converted_customer_id UUID REFERENCES customers(id),
    
    -- Follow-up
    last_contact_date   DATE,
    next_follow_up      DATE,
    notes               TEXT,
    
    -- Source
    source              VARCHAR(50) DEFAULT 'WEBSITE',
    
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_assigned ON inquiries(assigned_to);

-- Inquiry follow-up history
CREATE TABLE inquiry_followups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id          UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    
    followup_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    contact_mode        VARCHAR(20) CHECK (contact_mode IN ('PHONE', 'EMAIL', 'MEETING', 'WHATSAPP')),
    summary             TEXT NOT NULL,
    next_action         TEXT,
    next_followup_date  DATE,
    
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.10 Company Settings

```sql
-- ============================================
-- COMPANY SETTINGS
-- ============================================
CREATE TABLE company_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Company Details
    company_name        VARCHAR(200) NOT NULL,
    legal_name          VARCHAR(200),
    
    -- Address
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    state_code          VARCHAR(2),
    pincode             VARCHAR(6),
    
    -- Contact
    phone               VARCHAR(15),
    email               VARCHAR(255),
    website             VARCHAR(255),
    
    -- Registration
    gstin               VARCHAR(15),
    pan                 VARCHAR(10),
    drug_license_no     VARCHAR(50),
    fssai_number        VARCHAR(20),
    
    -- Bank Details
    bank_name           VARCHAR(100),
    bank_account_no     VARCHAR(20),
    bank_ifsc           VARCHAR(11),
    bank_branch         VARCHAR(100),
    
    -- Invoice Settings
    invoice_prefix      VARCHAR(10) DEFAULT 'MED',
    invoice_footer      TEXT,
    terms_conditions    TEXT,
    
    -- Logo
    logo_url            VARCHAR(500),
    
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by          UUID REFERENCES users(id)
);

-- Insert default company record
INSERT INTO company_settings (company_name) VALUES ('Medineo Enterprises');
```

---

## 3. DATABASE TRIGGERS

```sql
-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medicines_updated_at BEFORE UPDATE ON medicines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchases_updated_at BEFORE UPDATE ON purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sales_updated_at BEFORE UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- UPDATE CUSTOMER BALANCE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers 
    SET current_balance = (
        SELECT COALESCE(SUM(debit_amount) - SUM(credit_amount), 0)
        FROM customer_ledger 
        WHERE customer_id = NEW.customer_id
    )
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_ledger_balance 
    AFTER INSERT OR UPDATE ON customer_ledger
    FOR EACH ROW EXECUTE FUNCTION update_customer_balance();

-- ============================================
-- UPDATE VENDOR BALANCE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_vendor_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors 
    SET current_balance = (
        SELECT COALESCE(SUM(credit_amount) - SUM(debit_amount), 0)
        FROM vendor_ledger 
        WHERE vendor_id = NEW.vendor_id
    )
    WHERE id = NEW.vendor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendor_ledger_balance 
    AFTER INSERT OR UPDATE ON vendor_ledger
    FOR EACH ROW EXECUTE FUNCTION update_vendor_balance();

-- ============================================
-- UPDATE BATCH STATUS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark as DEPLETED if quantity is 0
    IF NEW.current_qty = 0 AND OLD.current_qty > 0 THEN
        NEW.status = 'DEPLETED';
    END IF;
    
    -- Mark as EXPIRED if past expiry date
    IF NEW.expiry_date < CURRENT_DATE AND NEW.status != 'EXPIRED' THEN
        NEW.status = 'EXPIRED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_batch_status 
    BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_batch_status();
```

---

## 4. DATABASE INDICES SUMMARY

```sql
-- Performance critical indices
CREATE INDEX idx_batches_medicine_expiry ON batches(medicine_id, expiry_date) 
    WHERE status = 'ACTIVE';
CREATE INDEX idx_batches_fifo ON batches(medicine_id, expiry_date ASC) 
    WHERE status = 'ACTIVE' AND current_qty > 0;
CREATE INDEX idx_sales_monthly ON sales(invoice_date) 
    WHERE status = 'CONFIRMED';
CREATE INDEX idx_purchases_monthly ON purchases(invoice_date) 
    WHERE status = 'CONFIRMED';
CREATE INDEX idx_customer_ledger_outstanding ON customer_ledger(customer_id, transaction_date DESC);
CREATE INDEX idx_vendor_ledger_outstanding ON vendor_ledger(vendor_id, transaction_date DESC);
```

---

## 5. INITIAL DATA SEED

```sql
-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
    'admin@medineo.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4TXEFpXKKf8GlNy.',  -- Change this!
    'System Administrator',
    'OWNER'
);

-- ============================================
-- GST HSN CODES FOR MEDICINES
-- ============================================
-- Common HSN codes for pharmaceuticals:
-- 3003: Medicaments
-- 3004: Medicaments (packaged for retail)
-- 3006: Pharmaceutical goods

-- ============================================
-- STATE CODES FOR GST
-- ============================================
CREATE TABLE state_codes (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO state_codes VALUES
('01', 'Jammu & Kashmir'), ('02', 'Himachal Pradesh'), ('03', 'Punjab'),
('04', 'Chandigarh'), ('05', 'Uttarakhand'), ('06', 'Haryana'),
('07', 'Delhi'), ('08', 'Rajasthan'), ('09', 'Uttar Pradesh'),
('10', 'Bihar'), ('11', 'Sikkim'), ('12', 'Arunachal Pradesh'),
('13', 'Nagaland'), ('14', 'Manipur'), ('15', 'Mizoram'),
('16', 'Tripura'), ('17', 'Meghalaya'), ('18', 'Assam'),
('19', 'West Bengal'), ('20', 'Jharkhand'), ('21', 'Odisha'),
('22', 'Chhattisgarh'), ('23', 'Madhya Pradesh'), ('24', 'Gujarat'),
('26', 'Dadra & Nagar Haveli and Daman & Diu'), ('27', 'Maharashtra'),
('28', 'Andhra Pradesh'), ('29', 'Karnataka'), ('30', 'Goa'),
('31', 'Lakshadweep'), ('32', 'Kerala'), ('33', 'Tamil Nadu'),
('34', 'Puducherry'), ('35', 'Andaman & Nicobar'), ('36', 'Telangana'),
('37', 'Andhra Pradesh (New)'), ('38', 'Ladakh');
```

---

*Schema Version: 1.0*  
*Database: PostgreSQL 15+*  
*Last Updated: January 2026*
