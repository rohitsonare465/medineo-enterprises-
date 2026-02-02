# Medineo Enterprises ERP System
## Complete System Architecture Document

---

## 1. EXECUTIVE SUMMARY

**Project:** Medineo ERP - Medical Distribution Management System  
**Company:** Medineo Enterprises  
**Business Type:** Pharmaceutical Distributor / Medical Vendor  
**Target Users:** Internal staff (Owner, Billing Staff, Accountant)

### Business Context
Medineo Enterprises operates as a pharmaceutical distributor in India, purchasing medicines from pharma companies and supplying to medical stores and hospitals. The ERP system must handle:
- **Regulatory Compliance:** GST billing, Drug License tracking, Batch management
- **Financial Management:** Receivables, Payables, Ledger maintenance
- **Inventory Control:** Batch-wise stock with expiry tracking, FIFO selling

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MEDINEO ERP SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        PRESENTATION LAYER                            │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │    │
│  │  │  Dashboard  │ │   Billing   │ │  Inventory  │ │   Reports   │    │    │
│  │  │    Module   │ │    Module   │ │    Module   │ │    Module   │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │    │
│  │  React 18 + TypeScript + TailwindCSS + Redux Toolkit                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         API GATEWAY LAYER                            │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │    │
│  │  │    Auth     │ │    Rate     │ │   Request   │ │    CORS     │    │    │
│  │  │ Middleware  │ │   Limiter   │ │  Validator  │ │   Handler   │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │    │
│  │  Express.js + Helmet + Express-Validator                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       BUSINESS LOGIC LAYER                           │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │    │
│  │  │  Vendor   │ │ Customer  │ │ Medicine  │ │  Purchase │            │    │
│  │  │  Service  │ │  Service  │ │  Service  │ │  Service  │            │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │    │
│  │  │   Sales   │ │  Ledger   │ │   Stock   │ │  Reports  │            │    │
│  │  │  Service  │ │  Service  │ │  Service  │ │  Service  │            │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │    │
│  │  Node.js + Express + TypeScript                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        DATA ACCESS LAYER                             │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Prisma ORM / Knex.js                      │    │    │
│  │  │         Models | Migrations | Transactions | Queries         │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DATABASE LAYER                               │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                      PostgreSQL 15+                          │    │    │
│  │  │    Normalized Schema | Transactions | Triggers | Indexes     │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Redux Toolkit | State Management | 2.x |
| React Router | Navigation | 6.x |
| TailwindCSS | Styling | 3.x |
| React Query | Server State | 5.x |
| React Hook Form | Form Management | 7.x |
| Zod | Validation | 3.x |
| Recharts | Analytics Charts | 2.x |
| React-PDF | Invoice Generation | 3.x |

### 3.2 Backend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 20.x LTS |
| Express.js | API Framework | 4.x |
| TypeScript | Type Safety | 5.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Database | 15.x |
| Redis | Caching & Sessions | 7.x |
| JWT | Authentication | - |
| bcrypt | Password Hashing | - |
| Winston | Logging | 3.x |
| PDFKit | PDF Generation | 0.14.x |

### 3.3 DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Nginx | Reverse Proxy |
| PM2 | Process Manager |
| GitHub Actions | CI/CD |

---

## 4. MODULE ARCHITECTURE

### 4.1 Authentication & Security Module

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Login                                                  │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────┐                                        │
│  │ Validate Input  │ (email/username + password)            │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Verify Password │ (bcrypt compare)                       │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Check User Role │ (OWNER / STAFF / ACCOUNTANT)           │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Generate Tokens │                                        │
│  │  - Access JWT   │ (15 min expiry)                        │
│  │  - Refresh JWT  │ (7 days expiry)                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Log Session     │ (IP, device, timestamp)                │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│       Response                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Security Features:**
- Password hashing with bcrypt (12 salt rounds)
- JWT with RS256 algorithm
- Refresh token rotation
- Rate limiting (5 login attempts per 15 minutes)
- Session tracking with device fingerprinting
- Automatic logout on suspicious activity

### 4.2 Vendor Management Module

**Purpose:** Manage pharmaceutical companies/vendors from whom medicines are purchased.

**Core Entities:**
- Vendor master details
- GST registration
- Payment terms
- Outstanding balance tracking

**Key Features:**
- Vendor CRUD operations
- GST validation (15-digit GSTIN format)
- Payment terms configuration (COD, 15/30/45/60 days credit)
- Automatic outstanding calculation from purchases
- Vendor-wise purchase history
- Outstanding aging reports

### 4.3 Customer Management Module

**Purpose:** Manage medical stores and hospitals to whom medicines are sold.

**Core Entities:**
- Customer master details
- Drug license tracking
- Credit limit management
- Outstanding tracking

**Key Features:**
- Customer CRUD operations
- Drug license number validation
- Credit limit enforcement
- Outstanding balance tracking
- Credit hold/release functionality
- Customer-wise sales history

### 4.4 Medicine & Batch Management Module

**Purpose:** Maintain medicine master and batch-wise inventory.

**Core Entities:**
- Medicine master
- Batches
- Stock movements

**Medicine Master Fields:**
- Medicine name
- Generic name
- Brand/Manufacturer
- Category (Tablet, Syrup, Injection, etc.)
- HSN Code (for GST)
- GST Rate (5%, 12%, 18%)
- Default MRP
- Minimum stock level

**Batch Management:**
- Batch number
- Manufacturing date
- Expiry date
- Purchase price
- Selling price
- MRP
- Current quantity
- Status (Active/Depleted/Expired)

### 4.5 Purchase Management Module

```
┌─────────────────────────────────────────────────────────────┐
│                    PURCHASE FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Receive Vendor Invoice                                      │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Create Purchase │                                        │
│  │     Entry       │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ├─────────────────────────────────────────┐       │
│           │                                         │       │
│           ▼                                         ▼       │
│  ┌─────────────────┐                    ┌─────────────────┐ │
│  │ For Each Item:  │                    │ Calculate GST   │ │
│  │ Create/Update   │                    │ CGST + SGST     │ │
│  │ Batch Record    │                    │ or IGST         │ │
│  └────────┬────────┘                    └────────┬────────┘ │
│           │                                      │          │
│           ▼                                      │          │
│  ┌─────────────────┐                             │          │
│  │ Update Stock    │◄────────────────────────────┘          │
│  │ (Add Quantity)  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Update Vendor   │                                        │
│  │ Payable Ledger  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  Purchase Complete                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Purchase invoice entry
- Automatic batch creation
- GST input tracking
- Stock auto-update
- Vendor payable update
- Purchase return handling

### 4.6 Sales & Billing Module

```
┌─────────────────────────────────────────────────────────────┐
│                      SALES FLOW (FIFO)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create Sales Invoice                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Select Customer │                                        │
│  │ Check Credit    │──────► Block if over limit             │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Add Line Items  │                                        │
│  │ (Medicine +     │                                        │
│  │  Quantity)      │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 FIFO BATCH SELECTION                 │    │
│  │  1. Get batches ordered by expiry date (ASC)        │    │
│  │  2. Exclude expired batches                          │    │
│  │  3. Allocate from oldest batch first                 │    │
│  │  4. If partial, continue to next batch               │    │
│  │  5. Deduct stock from selected batches               │    │
│  └────────┬────────────────────────────────────────────┘    │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Calculate GST   │                                        │
│  │ CGST + SGST     │                                        │
│  │ Generate Total  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Generate Invoice│                                        │
│  │ Number          │ (Format: MED/2024-25/0001)             │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Update Customer │                                        │
│  │ Receivable      │                                        │
│  │ Ledger          │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ Generate PDF    │                                        │
│  │ Invoice         │                                        │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Invoice Number Format:** `MED/{FINANCIAL_YEAR}/{SERIAL}`
- Example: MED/2025-26/0001

**GST Calculation:**
- Intra-state: CGST (50%) + SGST (50%)
- Inter-state: IGST (100%)
- GST rates: 5%, 12%, 18% based on medicine category

### 4.7 Ledger & Payments Module

```
┌─────────────────────────────────────────────────────────────┐
│                    LEDGER SYSTEM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CUSTOMER LEDGER (Receivables)                               │
│  ┌────────────┬──────────┬──────────┬──────────────────┐    │
│  │   Date     │  Type    │  Amount  │  Running Balance │    │
│  ├────────────┼──────────┼──────────┼──────────────────┤    │
│  │ 01-Jan-26  │ Invoice  │ +50,000  │  50,000 (Dr)     │    │
│  │ 05-Jan-26  │ Payment  │ -30,000  │  20,000 (Dr)     │    │
│  │ 10-Jan-26  │ Invoice  │ +25,000  │  45,000 (Dr)     │    │
│  │ 15-Jan-26  │ Return   │  -5,000  │  40,000 (Dr)     │    │
│  └────────────┴──────────┴──────────┴──────────────────┘    │
│                                                              │
│  VENDOR LEDGER (Payables)                                    │
│  ┌────────────┬──────────┬──────────┬──────────────────┐    │
│  │   Date     │  Type    │  Amount  │  Running Balance │    │
│  ├────────────┼──────────┼──────────┼──────────────────┤    │
│  │ 01-Jan-26  │ Purchase │ +80,000  │  80,000 (Cr)     │    │
│  │ 10-Jan-26  │ Payment  │ -50,000  │  30,000 (Cr)     │    │
│  │ 20-Jan-26  │ Purchase │ +40,000  │  70,000 (Cr)     │    │
│  └────────────┴──────────┴──────────┴──────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entry Types:**
- Invoice (Sales/Purchase)
- Payment Received/Made
- Credit Note (Sales Return)
- Debit Note (Purchase Return)
- Opening Balance
- Adjustment

### 4.8 Stock Management Module

**Stock Views:**
1. **Medicine-wise Stock:** Total stock per medicine across all batches
2. **Batch-wise Stock:** Individual batch quantities
3. **Low Stock Alert:** Medicines below minimum level
4. **Expiry Alert:** Batches expiring in 30/60/90 days
5. **Near-Expiry Stock Value:** Financial impact of expiring stock

**Stock Movements:**
- Purchase In
- Sales Out
- Sales Return In
- Purchase Return Out
- Stock Adjustment
- Expiry Write-off

### 4.9 Dashboard Module

**Owner Dashboard KPIs:**
```
┌─────────────────────────────────────────────────────────────┐
│                     OWNER DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Today Sales  │  │ Month Sales  │  │  Total       │       │
│  │   ₹45,000    │  │  ₹12,50,000  │  │  Receivable  │       │
│  │              │  │              │  │  ₹8,75,000   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Total        │  │ Low Stock    │  │  Expiry      │       │
│  │ Payable      │  │   Items      │  │  Alerts      │       │
│  │ ₹5,20,000    │  │     23       │  │     15       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌───────────────────────────────────────────────────┐      │
│  │           SALES TREND (Last 30 Days)              │      │
│  │   ▄▄▄                                             │      │
│  │  ▄███▄▄▄    ▄▄                                   │      │
│  │ ▄██████████████▄▄▄   ▄▄▄                         │      │
│  │███████████████████▄▄█████▄▄▄▄▄▄▄▄▄▄▄▄▄           │      │
│  └───────────────────────────────────────────────────┘      │
│                                                              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │  TOP CUSTOMERS          │ │  RECENT INVOICES        │    │
│  │  1. ABC Medical  ₹2.5L  │ │  MED/25-26/0125  ₹8500  │    │
│  │  2. City Pharma  ₹1.8L  │ │  MED/25-26/0124  ₹12000 │    │
│  │  3. Health Store ₹1.2L  │ │  MED/25-26/0123  ₹5600  │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.10 Inquiry Management Module

**Purpose:** Capture inquiries from public website and track conversion.

**Workflow:**
1. Inquiry received (from website form)
2. Status: NEW
3. Staff contacts → Status: CONTACTED
4. If interested → Create Customer → Status: CONVERTED
5. If not interested → Status: CLOSED

---

## 5. SECURITY ARCHITECTURE

### 5.1 Authentication
- JWT-based stateless authentication
- Access tokens (15 min) + Refresh tokens (7 days)
- Secure HTTP-only cookies for tokens
- CSRF protection

### 5.2 Authorization (RBAC)
```
Permission Matrix loaded from: /docs/ROLE_PERMISSIONS.md
```

### 5.3 Data Security
- All passwords hashed with bcrypt
- Sensitive data encrypted at rest
- TLS 1.3 for data in transit
- SQL injection prevention via parameterized queries
- XSS prevention via output encoding

### 5.4 Audit Logging
- All CRUD operations logged
- User ID, timestamp, IP address
- Before/after values for updates
- 90-day retention

---

## 6. PERFORMANCE CONSIDERATIONS

### 6.1 Database Optimization
- Proper indexing on frequently queried columns
- Partitioning for large tables (ledger entries)
- Connection pooling
- Query optimization

### 6.2 Caching Strategy
- Redis for session management
- Cache frequently accessed data (medicine list, customer list)
- Cache invalidation on updates

### 6.3 Frontend Optimization
- Code splitting
- Lazy loading of modules
- Optimistic updates
- Debounced search

---

## 7. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │    Cloudflare   │  (CDN + DDoS Protection)               │
│  │       CDN       │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │     Nginx       │  (Reverse Proxy + Load Balancer)       │
│  │   Port 443      │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│     ┌─────┴─────┐                                           │
│     ▼           ▼                                           │
│  ┌──────┐   ┌──────┐                                        │
│  │ App  │   │ App  │   (Node.js via PM2)                    │
│  │  :1  │   │  :2  │                                        │
│  └──┬───┘   └──┬───┘                                        │
│     │          │                                             │
│     └────┬─────┘                                             │
│          ▼                                                   │
│  ┌───────────────────────────────┐                          │
│  │         PostgreSQL            │                          │
│  │      (Primary + Replica)      │                          │
│  └───────────────────────────────┘                          │
│                                                              │
│  ┌───────────────────────────────┐                          │
│  │           Redis               │                          │
│  │   (Sessions + Cache)          │                          │
│  └───────────────────────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. BACKUP & DISASTER RECOVERY

### 8.1 Backup Strategy
- **Database:** Daily full backup + hourly incremental
- **Application:** Version controlled in Git
- **Documents/PDFs:** Cloud storage with replication

### 8.2 Recovery Objectives
- **RPO (Recovery Point Objective):** 1 hour
- **RTO (Recovery Time Objective):** 4 hours

---

## 9. MONITORING & ALERTING

### 9.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- API response times
- Database query performance

### 9.2 Business Alerts
- Low stock alerts (daily email)
- Expiry alerts (weekly report)
- Outstanding over credit limit
- Failed login attempts

---

## 10. COMPLIANCE & REGULATIONS

### 10.1 GST Compliance
- Proper GSTIN validation
- HSN code mapping
- CGST/SGST/IGST calculation
- GST report generation

### 10.2 Drug License Compliance
- Mandatory DL number for customers
- DL expiry tracking
- Alert before DL expiry

### 10.3 Data Retention
- Transaction data: 8 years (as per GST regulations)
- Audit logs: 7 years
- Session logs: 90 days

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: Medineo ERP Team*
