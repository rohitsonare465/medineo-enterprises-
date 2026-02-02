# Medineo ERP - API Structure Document
## RESTful API Design Specification

---

## 1. API OVERVIEW

### Base URL
```
Production:  https://api.medineo.com/v1
Development: http://localhost:3001/api/v1
```

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <access_token>
X-Request-ID: <uuid>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 2. AUTHENTICATION MODULE

### 2.1 Login
```http
POST /auth/login
```
**Request:**
```json
{
  "email": "staff@medineo.com",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "staff@medineo.com",
      "fullName": "Rahul Sharma",
      "role": "STAFF"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### 2.2 Refresh Token
```http
POST /auth/refresh
```
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### 2.3 Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### 2.4 Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
```
**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

### 2.5 Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 3. VENDOR MODULE

### 3.1 List Vendors
```http
GET /vendors
Authorization: Bearer <token>
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name, code, gstin |
| status | string | ACTIVE / INACTIVE |
| sortBy | string | Field to sort by |
| sortOrder | string | asc / desc |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "V001",
      "name": "Sun Pharmaceuticals",
      "contactPerson": "Amit Patel",
      "phone": "9876543210",
      "email": "amit@sunpharma.com",
      "gstin": "27AABCS1429B1ZB",
      "city": "Mumbai",
      "state": "Maharashtra",
      "paymentTerms": "NET30",
      "currentBalance": 125000.00,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 3.2 Get Vendor by ID
```http
GET /vendors/:id
```

### 3.3 Create Vendor
```http
POST /vendors
```
**Request:**
```json
{
  "name": "Sun Pharmaceuticals",
  "contactPerson": "Amit Patel",
  "phone": "9876543210",
  "email": "amit@sunpharma.com",
  "addressLine1": "123, Industrial Area",
  "addressLine2": "Andheri East",
  "city": "Mumbai",
  "state": "Maharashtra",
  "stateCode": "27",
  "pincode": "400069",
  "gstin": "27AABCS1429B1ZB",
  "pan": "AABCS1429B",
  "paymentTerms": "NET30",
  "creditDays": 30,
  "openingBalance": 0
}
```

### 3.4 Update Vendor
```http
PUT /vendors/:id
```

### 3.5 Delete Vendor (Soft Delete)
```http
DELETE /vendors/:id
```

### 3.6 Get Vendor Ledger
```http
GET /vendors/:id/ledger
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | From date |
| endDate | date | To date |
| page | number | Page number |
| limit | number | Items per page |

### 3.7 Get Vendor Purchase History
```http
GET /vendors/:id/purchases
```

### 3.8 Get Vendor Outstanding Summary
```http
GET /vendors/:id/outstanding
```

---

## 4. CUSTOMER MODULE

### 4.1 List Customers
```http
GET /customers
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search by name, code, gstin |
| type | string | RETAIL / HOSPITAL / CLINIC / WHOLESALE |
| status | string | ACTIVE / INACTIVE |
| creditBlocked | boolean | Filter by credit status |

### 4.2 Get Customer by ID
```http
GET /customers/:id
```

### 4.3 Create Customer
```http
POST /customers
```
**Request:**
```json
{
  "name": "City Medical Store",
  "type": "RETAIL",
  "contactPerson": "Suresh Kumar",
  "phone": "9876543210",
  "email": "citymedical@gmail.com",
  "addressLine1": "Shop 15, Market Road",
  "city": "Pune",
  "state": "Maharashtra",
  "stateCode": "27",
  "pincode": "411001",
  "gstin": "27AABCC1234D1ZE",
  "drugLicenseNo": "20B-MH-123456",
  "dlExpiryDate": "2027-03-31",
  "creditLimit": 100000,
  "creditDays": 15
}
```

### 4.4 Update Customer
```http
PUT /customers/:id
```

### 4.5 Delete Customer
```http
DELETE /customers/:id
```

### 4.6 Block/Unblock Customer Credit
```http
PATCH /customers/:id/credit-status
```
**Request:**
```json
{
  "creditBlocked": true,
  "reason": "Outstanding over 30 days"
}
```

### 4.7 Get Customer Ledger
```http
GET /customers/:id/ledger
```

### 4.8 Get Customer Sales History
```http
GET /customers/:id/sales
```

### 4.9 Get Customer Outstanding Summary
```http
GET /customers/:id/outstanding
```

---

## 5. MEDICINE MODULE

### 5.1 List Medicines
```http
GET /medicines
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name, code, brand |
| category | uuid | Category ID |
| brand | string | Brand name |
| manufacturer | string | Manufacturer |
| hasStock | boolean | Only with stock |
| lowStock | boolean | Only low stock |

### 5.2 Get Medicine by ID
```http
GET /medicines/:id
```

### 5.3 Create Medicine
```http
POST /medicines
```
**Request:**
```json
{
  "name": "Paracetamol 500mg",
  "genericName": "Paracetamol",
  "brand": "Crocin",
  "manufacturer": "GSK",
  "categoryId": "uuid",
  "form": "Strip of 10 Tablets",
  "strength": "500mg",
  "packSize": 10,
  "hsnCode": "30049099",
  "gstRate": 12,
  "defaultMrp": 35.00,
  "minStock": 100
}
```

### 5.4 Update Medicine
```http
PUT /medicines/:id
```

### 5.5 Delete Medicine
```http
DELETE /medicines/:id
```

### 5.6 Get Medicine Stock
```http
GET /medicines/:id/stock
```
**Response:**
```json
{
  "success": true,
  "data": {
    "medicineId": "uuid",
    "medicineName": "Paracetamol 500mg",
    "totalStock": 500,
    "minStock": 100,
    "batches": [
      {
        "id": "uuid",
        "batchNumber": "PAR202501",
        "expiryDate": "2027-01-15",
        "mrp": 35.00,
        "sellingRate": 28.00,
        "currentQty": 200,
        "availableQty": 180,
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 5.7 Search Medicines (For Billing)
```http
GET /medicines/search
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query (min 2 chars) |
| limit | number | Max results (default: 10) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "MED001",
      "name": "Paracetamol 500mg",
      "brand": "Crocin",
      "gstRate": 12,
      "totalStock": 500,
      "batches": [
        {
          "id": "uuid",
          "batchNumber": "PAR202501",
          "expiryDate": "2027-01-15",
          "mrp": 35.00,
          "sellingRate": 28.00,
          "availableQty": 180
        }
      ]
    }
  ]
}
```

---

## 6. BATCH MODULE

### 6.1 List Batches
```http
GET /batches
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| medicineId | uuid | Filter by medicine |
| status | string | ACTIVE / DEPLETED / EXPIRED |
| expiringIn | number | Days until expiry |

### 6.2 Get Batch by ID
```http
GET /batches/:id
```

### 6.3 Get Expiring Batches
```http
GET /batches/expiring
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| days | number | Expiring within days (30/60/90) |

### 6.4 Get Expired Batches
```http
GET /batches/expired
```

### 6.5 Update Batch Pricing
```http
PATCH /batches/:id/pricing
```
**Request:**
```json
{
  "sellingRate": 30.00,
  "ptr": 28.00,
  "pts": 25.00
}
```

---

## 7. PURCHASE MODULE

### 7.1 List Purchases
```http
GET /purchases
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| vendorId | uuid | Filter by vendor |
| startDate | date | From date |
| endDate | date | To date |
| status | string | DRAFT / CONFIRMED / CANCELLED |
| paymentStatus | string | PENDING / PARTIAL / PAID |

### 7.2 Get Purchase by ID
```http
GET /purchases/:id
```

### 7.3 Create Purchase (Draft)
```http
POST /purchases
```
**Request:**
```json
{
  "vendorId": "uuid",
  "invoiceNumber": "INV/SUN/2026/1234",
  "invoiceDate": "2026-01-28",
  "dueDate": "2026-02-27",
  "items": [
    {
      "medicineId": "uuid",
      "batchNumber": "PAR202601",
      "mfgDate": "2025-12-01",
      "expiryDate": "2027-12-31",
      "quantity": 100,
      "freeQty": 10,
      "mrp": 35.00,
      "purchaseRate": 22.00,
      "sellingRate": 28.00,
      "discountPct": 5,
      "gstRate": 12
    }
  ],
  "freightCharges": 200,
  "notes": "Regular order"
}
```

### 7.4 Update Purchase
```http
PUT /purchases/:id
```

### 7.5 Confirm Purchase
```http
POST /purchases/:id/confirm
```
**Effect:**
- Creates batch records
- Updates stock
- Creates vendor ledger entry
- Updates vendor payable

### 7.6 Cancel Purchase
```http
POST /purchases/:id/cancel
```

### 7.7 Create Purchase Return
```http
POST /purchases/:id/return
```
**Request:**
```json
{
  "returnDate": "2026-01-30",
  "items": [
    {
      "purchaseItemId": "uuid",
      "quantity": 10,
      "reason": "Damaged goods"
    }
  ],
  "notes": "Goods damaged during transit"
}
```

---

## 8. SALES MODULE

### 8.1 List Sales
```http
GET /sales
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| customerId | uuid | Filter by customer |
| startDate | date | From date |
| endDate | date | To date |
| status | string | DRAFT / CONFIRMED / CANCELLED |
| paymentStatus | string | PENDING / PARTIAL / PAID |

### 8.2 Get Sale by ID
```http
GET /sales/:id
```

### 8.3 Create Sale (Draft)
```http
POST /sales
```
**Request:**
```json
{
  "customerId": "uuid",
  "invoiceDate": "2026-01-30",
  "paymentMode": "CREDIT",
  "items": [
    {
      "medicineId": "uuid",
      "batchId": "uuid",
      "quantity": 20,
      "rate": 28.00,
      "discountPct": 2
    }
  ],
  "notes": "Regular order"
}
```

### 8.4 Confirm Sale
```http
POST /sales/:id/confirm
```
**Effect:**
- Generates invoice number
- Deducts stock (FIFO)
- Creates customer ledger entry
- Updates customer receivable

### 8.5 Get Sale Invoice PDF
```http
GET /sales/:id/invoice/pdf
```
**Response:** PDF file download

### 8.6 Create Sales Return (Credit Note)
```http
POST /sales/:id/return
```
**Request:**
```json
{
  "returnDate": "2026-02-01",
  "items": [
    {
      "salesItemId": "uuid",
      "quantity": 5,
      "returnToStock": true,
      "reason": "Expiry near"
    }
  ]
}
```

### 8.7 Get FIFO Batches for Medicine
```http
GET /sales/fifo-batches/:medicineId
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| quantity | number | Required quantity |

**Response:**
```json
{
  "success": true,
  "data": {
    "medicineId": "uuid",
    "requestedQty": 50,
    "allocations": [
      {
        "batchId": "uuid",
        "batchNumber": "PAR202501",
        "expiryDate": "2026-06-15",
        "availableQty": 30,
        "allocateQty": 30,
        "rate": 28.00
      },
      {
        "batchId": "uuid",
        "batchNumber": "PAR202502",
        "expiryDate": "2027-01-15",
        "availableQty": 50,
        "allocateQty": 20,
        "rate": 28.00
      }
    ],
    "totalAllocated": 50,
    "fulfilled": true
  }
}
```

---

## 9. PAYMENT MODULE

### 9.1 List Payments Received
```http
GET /payments/received
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| customerId | uuid | Filter by customer |
| startDate | date | From date |
| endDate | date | To date |
| paymentMode | string | CASH/UPI/CHEQUE/NEFT |

### 9.2 Create Payment Received
```http
POST /payments/received
```
**Request:**
```json
{
  "customerId": "uuid",
  "receiptDate": "2026-01-30",
  "amount": 50000,
  "paymentMode": "NEFT",
  "bankName": "HDFC Bank",
  "transactionRef": "NEFT123456789",
  "allocations": [
    {
      "saleId": "uuid",
      "amount": 30000
    },
    {
      "saleId": "uuid",
      "amount": 20000
    }
  ],
  "notes": "Payment for January invoices"
}
```

### 9.3 List Payments Made
```http
GET /payments/made
```

### 9.4 Create Payment Made
```http
POST /payments/made
```
**Request:**
```json
{
  "vendorId": "uuid",
  "paymentDate": "2026-01-30",
  "amount": 100000,
  "paymentMode": "NEFT",
  "bankName": "HDFC Bank",
  "transactionRef": "NEFT987654321",
  "allocations": [
    {
      "purchaseId": "uuid",
      "amount": 100000
    }
  ]
}
```

---

## 10. STOCK MODULE

### 10.1 Get Stock Summary
```http
GET /stock/summary
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 450,
    "totalValue": 1250000,
    "lowStockCount": 23,
    "expiringCount": 15,
    "expiredCount": 5
  }
}
```

### 10.2 Get Stock by Medicine
```http
GET /stock/medicines
```

### 10.3 Get Low Stock Items
```http
GET /stock/low
```

### 10.4 Get Expiring Stock
```http
GET /stock/expiring
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| days | number | 30, 60, or 90 |

### 10.5 Create Stock Adjustment
```http
POST /stock/adjustments
```
**Request:**
```json
{
  "adjustmentType": "DECREASE",
  "reason": "Physical stock count",
  "items": [
    {
      "batchId": "uuid",
      "quantityAdjust": -5,
      "reason": "Damaged"
    }
  ]
}
```

### 10.6 Get Stock Movements
```http
GET /stock/movements
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| batchId | uuid | Filter by batch |
| medicineId | uuid | Filter by medicine |
| startDate | date | From date |
| endDate | date | To date |
| type | string | Movement type |

---

## 11. LEDGER MODULE

### 11.1 Get Customer Ledger
```http
GET /ledger/customers/:customerId
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | From date |
| endDate | date | To date |

### 11.2 Get Vendor Ledger
```http
GET /ledger/vendors/:vendorId
```

### 11.3 Get All Receivables Summary
```http
GET /ledger/receivables
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalReceivable": 875000,
    "current": 450000,
    "overdue30": 250000,
    "overdue60": 125000,
    "overdue90": 50000,
    "customers": [
      {
        "customerId": "uuid",
        "customerName": "City Medical",
        "outstanding": 45000,
        "agingBucket": "CURRENT"
      }
    ]
  }
}
```

### 11.4 Get All Payables Summary
```http
GET /ledger/payables
```

### 11.5 Get Ledger Statement PDF
```http
GET /ledger/customers/:customerId/statement/pdf
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | From date |
| endDate | date | To date |

---

## 12. DASHBOARD MODULE

### 12.1 Get Owner Dashboard
```http
GET /dashboard/owner
```
**Response:**
```json
{
  "success": true,
  "data": {
    "todaySales": {
      "count": 12,
      "amount": 45000
    },
    "monthSales": {
      "count": 245,
      "amount": 1250000
    },
    "totalReceivable": 875000,
    "totalPayable": 520000,
    "lowStockCount": 23,
    "expiryAlerts": 15,
    "recentSales": [...],
    "topCustomers": [...],
    "salesTrend": [
      { "date": "2026-01-01", "amount": 42000 },
      { "date": "2026-01-02", "amount": 38000 }
    ]
  }
}
```

### 12.2 Get Staff Dashboard
```http
GET /dashboard/staff
```
**Response:**
```json
{
  "success": true,
  "data": {
    "todaySales": {
      "count": 12,
      "amount": 45000
    },
    "pendingInvoices": 3,
    "lowStockCount": 23,
    "recentSales": [...]
  }
}
```

### 12.3 Get Sales Analytics
```http
GET /dashboard/analytics/sales
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | day/week/month/year |
| startDate | date | From date |
| endDate | date | To date |

---

## 13. REPORTS MODULE

### 13.1 Sales Report
```http
GET /reports/sales
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | From date |
| endDate | date | To date |
| customerId | uuid | Filter by customer |
| format | string | json / pdf / excel |

### 13.2 Purchase Report
```http
GET /reports/purchases
```

### 13.3 Stock Report
```http
GET /reports/stock
```

### 13.4 GST Report
```http
GET /reports/gst
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| month | number | Month (1-12) |
| year | number | Year |
| type | string | GSTR1 / GSTR2 / GSTR3B |

### 13.5 Outstanding Report
```http
GET /reports/outstanding
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | receivables / payables |
| asOnDate | date | As on date |

### 13.6 Expiry Report
```http
GET /reports/expiry
```

### 13.7 Profit & Loss Report (Owner Only)
```http
GET /reports/profit-loss
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | From date |
| endDate | date | To date |

---

## 14. INQUIRY MODULE

### 14.1 List Inquiries
```http
GET /inquiries
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | NEW/CONTACTED/INTERESTED/CONVERTED/CLOSED |
| assignedTo | uuid | Filter by assigned user |
| startDate | date | From date |
| endDate | date | To date |

### 14.2 Get Inquiry by ID
```http
GET /inquiries/:id
```

### 14.3 Create Inquiry (Public - No Auth)
```http
POST /public/inquiries
```
**Request:**
```json
{
  "companyName": "New Medical Store",
  "contactPerson": "Ramesh Kumar",
  "phone": "9876543210",
  "email": "newmedical@gmail.com",
  "city": "Nashik",
  "state": "Maharashtra",
  "inquiryType": "PARTNERSHIP",
  "message": "Interested in becoming a distributor partner"
}
```

### 14.4 Update Inquiry Status
```http
PATCH /inquiries/:id/status
```
**Request:**
```json
{
  "status": "CONTACTED",
  "notes": "Spoke with contact person, interested in partnership"
}
```

### 14.5 Assign Inquiry
```http
PATCH /inquiries/:id/assign
```
**Request:**
```json
{
  "assignedTo": "uuid"
}
```

### 14.6 Add Follow-up
```http
POST /inquiries/:id/followups
```
**Request:**
```json
{
  "contactMode": "PHONE",
  "summary": "Discussed pricing and terms",
  "nextAction": "Send quotation",
  "nextFollowupDate": "2026-02-05"
}
```

### 14.7 Convert to Customer
```http
POST /inquiries/:id/convert
```
**Request:**
```json
{
  "name": "New Medical Store",
  "drugLicenseNo": "20B-MH-789012",
  "creditLimit": 50000,
  ...
}
```

---

## 15. USER MANAGEMENT MODULE (Owner Only)

### 15.1 List Users
```http
GET /users
```

### 15.2 Create User
```http
POST /users
```
**Request:**
```json
{
  "email": "newstaff@medineo.com",
  "password": "TempPass123!",
  "fullName": "New Staff Member",
  "phone": "9876543210",
  "role": "STAFF"
}
```

### 15.3 Update User
```http
PUT /users/:id
```

### 15.4 Deactivate User
```http
PATCH /users/:id/deactivate
```

### 15.5 Reset User Password
```http
POST /users/:id/reset-password
```

---

## 16. SETTINGS MODULE

### 16.1 Get Company Settings
```http
GET /settings/company
```

### 16.2 Update Company Settings
```http
PUT /settings/company
```

### 16.3 Get Invoice Settings
```http
GET /settings/invoice
```

### 16.4 Update Invoice Settings
```http
PUT /settings/invoice
```

---

## 17. AUDIT LOG MODULE (Owner Only)

### 17.1 Get Audit Logs
```http
GET /audit-logs
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | uuid | Filter by user |
| entityType | string | Filter by entity type |
| action | string | CREATE/UPDATE/DELETE |
| startDate | datetime | From date |
| endDate | datetime | To date |

---

## 18. API VERSIONING

- Current version: v1
- Version in URL path: `/api/v1/`
- Breaking changes will create new version (v2, v3...)
- Deprecated endpoints marked with header: `X-API-Deprecated: true`

---

## 19. RATE LIMITING

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5 requests/15 min |
| Public | 30 requests/min |
| Authenticated | 100 requests/min |
| Reports | 10 requests/min |

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706623200
```

---

*API Version: 1.0*  
*Last Updated: January 2026*
