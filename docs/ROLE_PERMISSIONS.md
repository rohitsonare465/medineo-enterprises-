# Medineo ERP - Role-Based Access Control (RBAC)
## Permission Matrix & Authorization System

---

## 1. USER ROLES OVERVIEW

| Role | Description | Access Level |
|------|-------------|--------------|
| **OWNER** | Business owner / Super Admin | Full system access |
| **STAFF** | Billing & operations staff | Day-to-day operations |
| **ACCOUNTANT** | Accounts & finance (Future) | Financial modules only |

---

## 2. DETAILED PERMISSION MATRIX

### Legend
- ✅ Full Access (Create, Read, Update, Delete)
- 📖 Read Only
- ✏️ Create & Read Only
- ❌ No Access
- 🔒 Restricted (Partial Access)

---

### 2.1 DASHBOARD MODULE

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Dashboard | ✅ | 🔒 | 🔒 |
| Today Sales | ✅ | ✅ | ✅ |
| Monthly Sales | ✅ | ❌ | ✅ |
| Total Receivables | ✅ | ❌ | ✅ |
| Total Payables | ✅ | ❌ | ✅ |
| Profit Margins | ✅ | ❌ | ❌ |
| Low Stock Alerts | ✅ | ✅ | 📖 |
| Expiry Alerts | ✅ | ✅ | 📖 |
| Sales Trend Charts | ✅ | ❌ | ✅ |
| Top Customers | ✅ | ❌ | ✅ |

---

### 2.2 VENDOR MANAGEMENT

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Vendor List | ✅ | 📖 | 📖 |
| View Vendor Details | ✅ | 📖 | 📖 |
| Create Vendor | ✅ | ❌ | ❌ |
| Edit Vendor | ✅ | ❌ | ❌ |
| Delete Vendor | ✅ | ❌ | ❌ |
| View Vendor Ledger | ✅ | ❌ | ✅ |
| View Vendor Outstanding | ✅ | 📖 | ✅ |
| Export Vendor Data | ✅ | ❌ | 📖 |

---

### 2.3 CUSTOMER MANAGEMENT

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Customer List | ✅ | ✅ | ✅ |
| View Customer Details | ✅ | ✅ | ✅ |
| Create Customer | ✅ | ✅ | ❌ |
| Edit Customer | ✅ | 🔒¹ | ❌ |
| Delete Customer | ✅ | ❌ | ❌ |
| Block/Unblock Credit | ✅ | ❌ | ❌ |
| Modify Credit Limit | ✅ | ❌ | ❌ |
| View Customer Ledger | ✅ | ❌ | ✅ |
| View Outstanding | ✅ | 📖 | ✅ |
| Export Customer Data | ✅ | ❌ | 📖 |

> ¹ Staff can edit only basic contact info, not financial settings

---

### 2.4 MEDICINE & BATCH MANAGEMENT

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Medicine List | ✅ | ✅ | 📖 |
| View Medicine Details | ✅ | ✅ | 📖 |
| Create Medicine | ✅ | ❌ | ❌ |
| Edit Medicine | ✅ | ❌ | ❌ |
| Delete Medicine | ✅ | ❌ | ❌ |
| View Purchase Price | ✅ | ❌ | ❌ |
| View Selling Price | ✅ | ✅ | 📖 |
| View Batch Details | ✅ | ✅ | 📖 |
| Edit Batch Pricing | ✅ | ❌ | ❌ |
| View Stock Quantity | ✅ | ✅ | 📖 |

---

### 2.5 PURCHASE MANAGEMENT

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Purchase List | ✅ | 📖 | ✅ |
| View Purchase Details | ✅ | 📖 | ✅ |
| Create Purchase | ✅ | ❌ | ❌ |
| Edit Purchase (Draft) | ✅ | ❌ | ❌ |
| Confirm Purchase | ✅ | ❌ | ❌ |
| Cancel Purchase | ✅ | ❌ | ❌ |
| Create Purchase Return | ✅ | ❌ | ❌ |
| View Purchase Prices | ✅ | ❌ | ✅ |
| Export Purchase Data | ✅ | ❌ | ✅ |

---

### 2.6 SALES & BILLING

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Sales List | ✅ | ✅ | ✅ |
| View Sales Details | ✅ | ✅ | ✅ |
| Create Sale (New Bill) | ✅ | ✅ | ❌ |
| Edit Sale (Draft) | ✅ | ✅ | ❌ |
| Confirm Sale | ✅ | ✅ | ❌ |
| Cancel Sale | ✅ | ❌ | ❌ |
| Create Sales Return | ✅ | 🔒² | ❌ |
| Apply Discount | ✅ | 🔒³ | ❌ |
| Print Invoice | ✅ | ✅ | ✅ |
| View Invoice PDF | ✅ | ✅ | ✅ |
| Override Credit Limit | ✅ | ❌ | ❌ |
| Export Sales Data | ✅ | ❌ | ✅ |

> ² Staff can create return request, owner approves  
> ³ Staff limited to max 5% discount, owner unlimited

---

### 2.7 PAYMENTS MODULE

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Payments Received | ✅ | ❌ | ✅ |
| Create Payment Received | ✅ | 🔒⁴ | ✅ |
| View Payments Made | ✅ | ❌ | ✅ |
| Create Payment Made | ✅ | ❌ | ✅ |
| Allocate Payments | ✅ | ❌ | ✅ |
| Cancel Payment | ✅ | ❌ | ❌ |
| Print Receipt | ✅ | ✅ | ✅ |
| Export Payment Data | ✅ | ❌ | ✅ |

> ⁴ Staff can record cash payments at the time of sale only

---

### 2.8 STOCK MANAGEMENT

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Stock Summary | ✅ | ✅ | 📖 |
| View Batch Stock | ✅ | ✅ | 📖 |
| View Low Stock | ✅ | ✅ | 📖 |
| View Expiry Alerts | ✅ | ✅ | 📖 |
| Create Stock Adjustment | ✅ | ❌ | ❌ |
| Approve Stock Adjustment | ✅ | ❌ | ❌ |
| View Stock Value | ✅ | ❌ | 📖 |
| View Stock Movements | ✅ | 📖 | 📖 |
| Export Stock Data | ✅ | ❌ | 📖 |

---

### 2.9 LEDGER MODULE

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Customer Ledger | ✅ | ❌ | ✅ |
| View Vendor Ledger | ✅ | ❌ | ✅ |
| View Running Balance | ✅ | ❌ | ✅ |
| Print Ledger Statement | ✅ | ❌ | ✅ |
| Create Adjustment Entry | ✅ | ❌ | 🔒⁵ |
| Export Ledger Data | ✅ | ❌ | ✅ |

> ⁵ Accountant can create, owner approves

---

### 2.10 REPORTS

| Report | OWNER | STAFF | ACCOUNTANT |
|--------|-------|-------|------------|
| Daily Sales Report | ✅ | ❌ | ✅ |
| Monthly Sales Report | ✅ | ❌ | ✅ |
| Purchase Report | ✅ | ❌ | ✅ |
| Stock Report | ✅ | ❌ | ✅ |
| Low Stock Report | ✅ | ✅ | 📖 |
| Expiry Report | ✅ | ✅ | 📖 |
| GST Report (GSTR-1) | ✅ | ❌ | ✅ |
| GST Report (GSTR-2) | ✅ | ❌ | ✅ |
| Receivables Aging | ✅ | ❌ | ✅ |
| Payables Aging | ✅ | ❌ | ✅ |
| Outstanding Report | ✅ | ❌ | ✅ |
| Profit & Loss Report | ✅ | ❌ | ❌ |
| Margin Analysis | ✅ | ❌ | ❌ |
| Customer-wise Sales | ✅ | ❌ | ✅ |
| Medicine-wise Sales | ✅ | ❌ | ✅ |

---

### 2.11 INQUIRIES

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Inquiry List | ✅ | ✅ | ❌ |
| View Inquiry Details | ✅ | ✅ | ❌ |
| Update Inquiry Status | ✅ | ✅ | ❌ |
| Add Follow-up | ✅ | ✅ | ❌ |
| Convert to Customer | ✅ | ✅ | ❌ |
| Assign Inquiry | ✅ | ❌ | ❌ |
| Delete Inquiry | ✅ | ❌ | ❌ |

---

### 2.12 SETTINGS & ADMINISTRATION

| Feature | OWNER | STAFF | ACCOUNTANT |
|---------|-------|-------|------------|
| View Company Settings | ✅ | 📖 | 📖 |
| Edit Company Settings | ✅ | ❌ | ❌ |
| View Invoice Settings | ✅ | 📖 | ❌ |
| Edit Invoice Settings | ✅ | ❌ | ❌ |
| View User List | ✅ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ |
| Deactivate User | ✅ | ❌ | ❌ |
| Reset User Password | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ |
| Change Own Password | ✅ | ✅ | ✅ |

---

## 3. PERMISSION IMPLEMENTATION

### 3.1 Permission Constants

```typescript
// src/constants/permissions.ts

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_FULL: 'dashboard:full',
  
  // Vendors
  VENDOR_VIEW: 'vendor:view',
  VENDOR_CREATE: 'vendor:create',
  VENDOR_UPDATE: 'vendor:update',
  VENDOR_DELETE: 'vendor:delete',
  VENDOR_LEDGER: 'vendor:ledger',
  
  // Customers
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_LEDGER: 'customer:ledger',
  CUSTOMER_CREDIT_MANAGE: 'customer:credit:manage',
  
  // Medicines
  MEDICINE_VIEW: 'medicine:view',
  MEDICINE_CREATE: 'medicine:create',
  MEDICINE_UPDATE: 'medicine:update',
  MEDICINE_DELETE: 'medicine:delete',
  MEDICINE_PRICE_VIEW: 'medicine:price:view',
  
  // Purchases
  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_UPDATE: 'purchase:update',
  PURCHASE_CONFIRM: 'purchase:confirm',
  PURCHASE_CANCEL: 'purchase:cancel',
  
  // Sales
  SALE_VIEW: 'sale:view',
  SALE_CREATE: 'sale:create',
  SALE_UPDATE: 'sale:update',
  SALE_CONFIRM: 'sale:confirm',
  SALE_CANCEL: 'sale:cancel',
  SALE_RETURN: 'sale:return',
  SALE_DISCOUNT_FULL: 'sale:discount:full',
  SALE_CREDIT_OVERRIDE: 'sale:credit:override',
  
  // Payments
  PAYMENT_RECEIVED_VIEW: 'payment:received:view',
  PAYMENT_RECEIVED_CREATE: 'payment:received:create',
  PAYMENT_MADE_VIEW: 'payment:made:view',
  PAYMENT_MADE_CREATE: 'payment:made:create',
  
  // Stock
  STOCK_VIEW: 'stock:view',
  STOCK_VALUE_VIEW: 'stock:value:view',
  STOCK_ADJUST: 'stock:adjust',
  
  // Reports
  REPORT_SALES: 'report:sales',
  REPORT_PURCHASE: 'report:purchase',
  REPORT_STOCK: 'report:stock',
  REPORT_GST: 'report:gst',
  REPORT_OUTSTANDING: 'report:outstanding',
  REPORT_PROFIT: 'report:profit',
  
  // Settings
  SETTINGS_COMPANY: 'settings:company',
  SETTINGS_USERS: 'settings:users',
  AUDIT_LOGS: 'audit:logs',
} as const;
```

### 3.2 Role Permission Mapping

```typescript
// src/constants/roles.ts

import { PERMISSIONS } from './permissions';

export const ROLE_PERMISSIONS = {
  OWNER: Object.values(PERMISSIONS), // All permissions
  
  STAFF: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.MEDICINE_VIEW,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.SALE_CREATE,
    PERMISSIONS.SALE_UPDATE,
    PERMISSIONS.SALE_CONFIRM,
    PERMISSIONS.STOCK_VIEW,
    // ... limited permissions
  ],
  
  ACCOUNTANT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.VENDOR_LEDGER,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_LEDGER,
    PERMISSIONS.PURCHASE_VIEW,
    PERMISSIONS.SALE_VIEW,
    PERMISSIONS.PAYMENT_RECEIVED_VIEW,
    PERMISSIONS.PAYMENT_RECEIVED_CREATE,
    PERMISSIONS.PAYMENT_MADE_VIEW,
    PERMISSIONS.PAYMENT_MADE_CREATE,
    PERMISSIONS.REPORT_SALES,
    PERMISSIONS.REPORT_PURCHASE,
    PERMISSIONS.REPORT_GST,
    PERMISSIONS.REPORT_OUTSTANDING,
    // ... accounting permissions
  ],
};
```

### 3.3 Permission Hook

```typescript
// src/hooks/usePermission.ts

import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '@/constants/roles';

export function usePermission() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };
  
  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
```

### 3.4 Protected Component

```typescript
// src/components/common/ProtectedComponent.tsx

interface ProtectedComponentProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({ 
  permission, 
  children, 
  fallback = null 
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission } = usePermission();
  
  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);
  
  if (!hasAccess) return fallback;
  
  return <>{children}</>;
}
```

---

## 4. SENSITIVE DATA PROTECTION

### 4.1 Hidden from Staff

| Data | Protection |
|------|------------|
| Purchase Prices | Completely hidden |
| Profit Margins | Not calculated/shown |
| Vendor Financials | No ledger access |
| Business Reports | Restricted |
| User Management | No access |

### 4.2 Hidden from Accountant

| Data | Protection |
|------|------------|
| Profit & Loss | No access |
| Margin Analysis | No access |
| User Management | No access |
| System Settings | Read only |

---

## 5. AUDIT TRAIL

All sensitive actions are logged:

| Action | Logged Data |
|--------|-------------|
| Login/Logout | User, Time, IP, Device |
| Create Record | User, Entity, Data |
| Update Record | User, Entity, Before/After |
| Delete Record | User, Entity, Data |
| Confirm Invoice | User, Invoice, Amount |
| Payment Entry | User, Amount, Mode |
| Credit Override | User, Customer, Amount |

---

## 6. SESSION MANAGEMENT

| Setting | Value |
|---------|-------|
| Access Token Expiry | 15 minutes |
| Refresh Token Expiry | 7 days |
| Idle Timeout | 30 minutes |
| Max Sessions | 3 per user |
| Session on New Login | Revoke oldest |

---

## 7. FUTURE ENHANCEMENTS

### 7.1 Granular Permissions
- Per-customer access restrictions
- Per-vendor access restrictions
- Branch-level permissions

### 7.2 Workflow Approvals
- Multi-level approval for large transactions
- Discount approval workflow
- Credit limit change approval

### 7.3 Time-based Access
- Restrict access to business hours
- Holiday calendar integration

---

*RBAC Version: 1.0*  
*Last Updated: January 2026*
