# Medineo ERP - Frontend Architecture
## React Application Structure & Design System

---

## 1. PROJECT STRUCTURE

```
erp-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── images/
│           └── logo.svg
│
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── config/
│   │   ├── api.config.ts
│   │   ├── app.config.ts
│   │   └── routes.config.ts
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── vendor.types.ts
│   │   ├── customer.types.ts
│   │   ├── medicine.types.ts
│   │   ├── batch.types.ts
│   │   ├── purchase.types.ts
│   │   ├── sales.types.ts
│   │   ├── payment.types.ts
│   │   ├── ledger.types.ts
│   │   ├── stock.types.ts
│   │   └── index.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── uiSlice.ts
│   │       └── cartSlice.ts  (for billing)
│   │
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── vendor.service.ts
│   │   ├── customer.service.ts
│   │   ├── medicine.service.ts
│   │   ├── purchase.service.ts
│   │   ├── sales.service.ts
│   │   ├── payment.service.ts
│   │   ├── stock.service.ts
│   │   ├── report.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── usePermission.ts
│   │   └── useToast.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── gst.utils.ts
│   │   ├── date.utils.ts
│   │   ├── number.utils.ts
│   │   └── pdf.utils.ts
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── gst.ts
│   │   └── states.ts
│   │
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Tabs/
│   │   │   ├── Dropdown/
│   │   │   ├── DatePicker/
│   │   │   ├── Pagination/
│   │   │   ├── SearchInput/
│   │   │   ├── LoadingSpinner/
│   │   │   ├── EmptyState/
│   │   │   ├── Toast/
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                 # Form components
│   │   │   ├── VendorForm/
│   │   │   ├── CustomerForm/
│   │   │   ├── MedicineForm/
│   │   │   ├── PurchaseForm/
│   │   │   ├── SalesForm/
│   │   │   ├── PaymentForm/
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── MainLayout/
│   │   │   ├── AuthLayout/
│   │   │   └── index.ts
│   │   │
│   │   ├── billing/               # Billing-specific components
│   │   │   ├── MedicineSearch/
│   │   │   ├── BatchSelector/
│   │   │   ├── BillingTable/
│   │   │   ├── InvoiceSummary/
│   │   │   ├── CustomerSelect/
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/             # Dashboard widgets
│   │   │   ├── SalesCard/
│   │   │   ├── StatsCard/
│   │   │   ├── SalesChart/
│   │   │   ├── TopCustomers/
│   │   │   ├── RecentInvoices/
│   │   │   ├── AlertsWidget/
│   │   │   └── index.ts
│   │   │
│   │   └── common/                # Shared components
│   │       ├── ConfirmDialog/
│   │       ├── ExportButton/
│   │       ├── PrintButton/
│   │       ├── StatusBadge/
│   │       ├── AmountDisplay/
│   │       ├── ProtectedRoute/
│   │       └── index.ts
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login/
│   │   │   ├── ForgotPassword/
│   │   │   └── ChangePassword/
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard/
│   │   │
│   │   ├── vendors/
│   │   │   ├── VendorList/
│   │   │   ├── VendorDetail/
│   │   │   ├── VendorCreate/
│   │   │   └── VendorEdit/
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerList/
│   │   │   ├── CustomerDetail/
│   │   │   ├── CustomerCreate/
│   │   │   └── CustomerEdit/
│   │   │
│   │   ├── medicines/
│   │   │   ├── MedicineList/
│   │   │   ├── MedicineDetail/
│   │   │   ├── MedicineCreate/
│   │   │   └── MedicineEdit/
│   │   │
│   │   ├── purchases/
│   │   │   ├── PurchaseList/
│   │   │   ├── PurchaseDetail/
│   │   │   ├── PurchaseCreate/
│   │   │   └── PurchaseEdit/
│   │   │
│   │   ├── sales/
│   │   │   ├── SalesList/
│   │   │   ├── SalesDetail/
│   │   │   ├── SalesCreate/        # Main Billing Screen
│   │   │   └── InvoiceView/
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentsReceived/
│   │   │   ├── PaymentsMade/
│   │   │   └── PaymentCreate/
│   │   │
│   │   ├── stock/
│   │   │   ├── StockOverview/
│   │   │   ├── LowStock/
│   │   │   ├── ExpiryAlerts/
│   │   │   └── StockAdjustment/
│   │   │
│   │   ├── ledger/
│   │   │   ├── CustomerLedger/
│   │   │   ├── VendorLedger/
│   │   │   └── LedgerStatement/
│   │   │
│   │   ├── reports/
│   │   │   ├── SalesReport/
│   │   │   ├── PurchaseReport/
│   │   │   ├── StockReport/
│   │   │   ├── GSTReport/
│   │   │   ├── OutstandingReport/
│   │   │   └── ProfitLossReport/
│   │   │
│   │   ├── inquiries/
│   │   │   ├── InquiryList/
│   │   │   └── InquiryDetail/
│   │   │
│   │   ├── settings/
│   │   │   ├── CompanySettings/
│   │   │   ├── InvoiceSettings/
│   │   │   └── UserManagement/
│   │   │
│   │   └── errors/
│   │       ├── NotFound/
│   │       ├── Unauthorized/
│   │       └── ServerError/
│   │
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       └── components/
│
├── .env
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 2. DESIGN SYSTEM

### 2.1 Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #DC2626;        /* Red - Primary Actions */
  --color-primary-light: #EF4444;
  --color-primary-dark: #B91C1C;
  
  /* Secondary Colors */
  --color-success: #16A34A;        /* Green - Success States */
  --color-success-light: #22C55E;
  --color-success-dark: #15803D;
  
  /* Neutral Colors */
  --color-white: #FFFFFF;
  --color-black: #000000;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-warning: #F59E0B;
  --color-error: #DC2626;
  --color-info: #3B82F6;
  
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
}
```

### 2.2 Typography

```css
:root {
  /* Font Family */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### 2.3 Spacing

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
}
```

### 2.4 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 2.5 Border Radius

```css
:root {
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-full: 9999px;
}
```

---

## 3. COMPONENT LIBRARY

### 3.1 Button Component

```tsx
// src/components/ui/Button/Button.tsx

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

// Variants:
// primary: Red background, white text (main actions)
// secondary: White background, gray border (secondary actions)
// success: Green background (confirm, save)
// danger: Red outline (delete, cancel)
// ghost: No background (subtle actions)
```

### 3.2 Input Component

```tsx
// src/components/ui/Input/Input.tsx

interface InputProps {
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}
```

### 3.3 Table Component

```tsx
// src/components/ui/Table/Table.tsx

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectRow?: (id: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}
```

---

## 4. PAGE LAYOUTS

### 4.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                      │
│  ┌─────────┐                                   ┌─────┐ ┌──────────────┐ │
│  │  Logo   │     Search...                     │ 🔔  │ │ User ▼       │ │
│  └─────────┘                                   └─────┘ └──────────────┘ │
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                             │
│  SIDEBAR   │                      MAIN CONTENT                          │
│            │                                                             │
│ ┌────────┐ │   ┌─────────────────────────────────────────────────────┐  │
│ │Dashboard│ │   │  Page Title                         + Add New      │  │
│ ├────────┤ │   └─────────────────────────────────────────────────────┘  │
│ │Vendors │ │                                                             │
│ ├────────┤ │   ┌─────────────────────────────────────────────────────┐  │
│ │Customer│ │   │                                                      │  │
│ ├────────┤ │   │                    CONTENT AREA                      │  │
│ │Medicine│ │   │                                                      │  │
│ ├────────┤ │   │              (Tables, Forms, Cards)                  │  │
│ │Purchase│ │   │                                                      │  │
│ ├────────┤ │   │                                                      │  │
│ │ Sales  │ │   │                                                      │  │
│ ├────────┤ │   │                                                      │  │
│ │Payments│ │   │                                                      │  │
│ ├────────┤ │   │                                                      │  │
│ │ Stock  │ │   └─────────────────────────────────────────────────────┘  │
│ ├────────┤ │                                                             │
│ │ Ledger │ │                                                             │
│ ├────────┤ │                                                             │
│ │Reports │ │                                                             │
│ ├────────┤ │                                                             │
│ │Settings│ │                                                             │
│ └────────┘ │                                                             │
│            │                                                             │
└────────────┴────────────────────────────────────────────────────────────┘
```

### 4.2 Dashboard Layout (Owner)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                              Today: 30 Jan 26│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Today Sales  │  │ Month Sales  │  │ Receivables  │  │  Payables    │ │
│  │   ₹45,000    │  │  ₹12,50,000  │  │  ₹8,75,000   │  │  ₹5,20,000   │ │
│  │  ↑ 12%       │  │  ↑ 8%        │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐                                     │
│  │ Low Stock    │  │ Expiry Alert │                                     │
│  │     23       │  │     15       │                                     │
│  │   items      │  │   batches    │                                     │
│  └──────────────┘  └──────────────┘                                     │
│                                                                          │
│  ┌─────────────────────────────────────┐  ┌───────────────────────────┐ │
│  │       SALES TREND (30 DAYS)         │  │     TOP CUSTOMERS         │ │
│  │                                      │  │                           │ │
│  │   ▄▄▄                               │  │  1. ABC Medical   ₹2.5L   │ │
│  │  ▄███▄▄▄    ▄▄                      │  │  2. City Pharma   ₹1.8L   │ │
│  │ ▄██████████████▄▄▄   ▄▄▄            │  │  3. Health Store  ₹1.2L   │ │
│  │███████████████████▄▄█████▄▄▄▄▄▄▄▄   │  │  4. MediCare      ₹0.9L   │ │
│  └─────────────────────────────────────┘  │  5. Life Pharmacy ₹0.7L   │ │
│                                           └───────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      RECENT INVOICES                                 ││
│  ├────────────┬────────────┬────────────┬────────────┬─────────────────┤│
│  │ Invoice #  │ Customer   │ Amount     │ Status     │ Date            ││
│  ├────────────┼────────────┼────────────┼────────────┼─────────────────┤│
│  │ MED/25/125 │ ABC Medical│ ₹8,500     │ ● Paid     │ 30 Jan 2026     ││
│  │ MED/25/124 │ City Pharma│ ₹12,000    │ ○ Pending  │ 30 Jan 2026     ││
│  │ MED/25/123 │ MediCare   │ ₹5,600     │ ● Paid     │ 29 Jan 2026     ││
│  └────────────┴────────────┴────────────┴────────────┴─────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Billing Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  New Sales Invoice                                     Invoice: DRAFT   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ Customer:                        │  │ Date: 30-01-2026            │   │
│  │ [Search Customer...        ▼]    │  │ Payment: Credit ▼           │   │
│  │                                  │  │                             │   │
│  │ City Medical Store               │  │ Credit Limit: ₹1,00,000     │   │
│  │ 123, Market Road, Pune           │  │ Outstanding:  ₹45,000       │   │
│  │ GSTIN: 27AABCC1234D1ZE           │  │ Available:    ₹55,000       │   │
│  └─────────────────────────────────┘  └─────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Add Medicine: [Search medicine by name or code...              🔍] ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ BILLING TABLE                                                        ││
│  ├────┬─────────────┬────────┬────────┬─────┬───────┬──────┬───────────┤│
│  │ #  │ Medicine    │ Batch  │ Expiry │ Qty │ Rate  │ GST% │ Amount    ││
│  ├────┼─────────────┼────────┼────────┼─────┼───────┼──────┼───────────┤│
│  │ 1  │ Paracetamol │PAR2501 │Jan 27  │ 50  │₹28.00 │ 12%  │ ₹1,568.00 ││
│  │    │ 500mg       │        │        │     │       │      │           ││
│  ├────┼─────────────┼────────┼────────┼─────┼───────┼──────┼───────────┤│
│  │ 2  │ Amoxicillin │AMX2502 │Mar 27  │ 30  │₹45.00 │ 12%  │ ₹1,512.00 ││
│  │    │ 250mg       │        │        │     │       │      │           ││
│  ├────┼─────────────┼────────┼────────┼─────┼───────┼──────┼───────────┤│
│  │ 3  │ Omeprazole  │OMP2503 │Jun 27  │ 20  │₹65.00 │ 12%  │ ₹1,456.00 ││
│  │    │ 20mg        │        │        │     │       │      │           ││
│  └────┴─────────────┴────────┴────────┴─────┴───────┴──────┴───────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                           INVOICE SUMMARY                            ││
│  │                                                     ┌───────────────┐││
│  │                                      Subtotal:      │     ₹4,050.00 │││
│  │                                      Discount:      │       -₹81.00 │││
│  │                                      Taxable:       │     ₹3,969.00 │││
│  │                                      CGST (6%):     │       ₹238.14 │││
│  │                                      SGST (6%):     │       ₹238.14 │││
│  │                                      Round Off:     │        -₹0.28 │││
│  │                                      ─────────────────────────────── ││
│  │                                      GRAND TOTAL:   │     ₹4,445.00 │││
│  │                                                     └───────────────┘││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Save Draft    │  │  Save & Print   │  │  Confirm & Generate     │  │
│  │                 │  │                 │  │       Invoice           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4 List Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Customers                                          [+ Add Customer]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ [🔍 Search customers...]  │ Type: [All ▼]  │ Status: [Active ▼]     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Showing 1-20 of 145 customers                      [Export ▼] [⟳]   ││
│  ├────────┬─────────────┬────────────┬────────────┬──────────┬─────────┤│
│  │ Code   │ Name        │ Type       │ Outstanding│ Status   │ Actions ││
│  ├────────┼─────────────┼────────────┼────────────┼──────────┼─────────┤│
│  │ C001   │ ABC Medical │ Retail     │ ₹45,000    │ ● Active │ ⋮       ││
│  ├────────┼─────────────┼────────────┼────────────┼──────────┼─────────┤│
│  │ C002   │ City Pharma │ Wholesale  │ ₹1,25,000  │ ● Active │ ⋮       ││
│  ├────────┼─────────────┼────────────┼────────────┼──────────┼─────────┤│
│  │ C003   │ Life Medical│ Hospital   │ ₹0         │ ● Active │ ⋮       ││
│  ├────────┼─────────────┼────────────┼────────────┼──────────┼─────────┤│
│  │ C004   │ MediCare    │ Retail     │ ₹28,500    │ ○ Blocked│ ⋮       ││
│  └────────┴─────────────┴────────────┴────────────┴──────────┴─────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ← Previous    1  2  3  4  5  ...  8    Next →      [20 ▼] per page ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. ROUTING CONFIGURATION

```tsx
// src/config/routes.config.ts

export const routes = {
  // Public
  login: '/login',
  forgotPassword: '/forgot-password',
  
  // Dashboard
  dashboard: '/',
  
  // Vendors
  vendors: '/vendors',
  vendorCreate: '/vendors/new',
  vendorDetail: '/vendors/:id',
  vendorEdit: '/vendors/:id/edit',
  vendorLedger: '/vendors/:id/ledger',
  
  // Customers
  customers: '/customers',
  customerCreate: '/customers/new',
  customerDetail: '/customers/:id',
  customerEdit: '/customers/:id/edit',
  customerLedger: '/customers/:id/ledger',
  
  // Medicines
  medicines: '/medicines',
  medicineCreate: '/medicines/new',
  medicineDetail: '/medicines/:id',
  medicineEdit: '/medicines/:id/edit',
  
  // Purchases
  purchases: '/purchases',
  purchaseCreate: '/purchases/new',
  purchaseDetail: '/purchases/:id',
  purchaseEdit: '/purchases/:id/edit',
  
  // Sales (Billing)
  sales: '/sales',
  salesCreate: '/sales/new',
  salesDetail: '/sales/:id',
  invoiceView: '/sales/:id/invoice',
  
  // Payments
  paymentsReceived: '/payments/received',
  paymentsMade: '/payments/made',
  paymentCreate: '/payments/new',
  
  // Stock
  stock: '/stock',
  lowStock: '/stock/low',
  expiryAlerts: '/stock/expiry',
  stockAdjustment: '/stock/adjustment',
  
  // Ledger
  customerLedger: '/ledger/customers',
  vendorLedger: '/ledger/vendors',
  
  // Reports
  salesReport: '/reports/sales',
  purchaseReport: '/reports/purchases',
  stockReport: '/reports/stock',
  gstReport: '/reports/gst',
  outstandingReport: '/reports/outstanding',
  profitLossReport: '/reports/profit-loss',
  
  // Inquiries
  inquiries: '/inquiries',
  inquiryDetail: '/inquiries/:id',
  
  // Settings
  companySettings: '/settings/company',
  invoiceSettings: '/settings/invoice',
  userManagement: '/settings/users',
  changePassword: '/settings/password',
};
```

---

## 6. STATE MANAGEMENT

### 6.1 Redux Store Structure

```typescript
// Store structure
{
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  },
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
  },
  billingCart: {
    customer: Customer | null;
    items: BillingItem[];
    discount: number;
    paymentMode: PaymentMode;
  }
}
```

### 6.2 React Query for Server State

```typescript
// API state managed by React Query
// - Vendors list with caching
// - Customers list with caching
// - Medicines search with debounce
// - Sales/Purchase data
// - Dashboard analytics
```

---

## 7. KEY FEATURES IMPLEMENTATION

### 7.1 Fast Medicine Search (Billing)

```typescript
// Features:
// - Debounced search (300ms)
// - Search by name, code, or barcode
// - Show available batches with FIFO order
// - Keyboard navigation (Arrow keys + Enter)
// - Batch quick select
```

### 7.2 Real-time Stock Check

```typescript
// During billing:
// - Check stock availability before adding
// - Show expiry date warning (< 3 months)
// - Prevent overselling
// - Auto-select FIFO batch
```

### 7.3 Auto GST Calculation

```typescript
// GST calculation logic:
// - Determine intra-state or inter-state
// - Apply correct rate (5%, 12%, 18%)
// - Calculate CGST + SGST or IGST
// - Handle inclusive/exclusive pricing
```

### 7.4 Credit Limit Enforcement

```typescript
// Before confirming sale:
// - Check customer credit limit
// - Calculate: (Outstanding + New Invoice) <= Credit Limit
// - Block if exceeded
// - Owner override option
```

---

## 8. RESPONSIVE BREAKPOINTS

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile Optimization:**
- Billing screen optimized for tablet
- Sidebar collapses to hamburger menu
- Tables scroll horizontally
- Forms stack vertically

---

## 9. ACCESSIBILITY

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Color contrast ratios
- ARIA labels

---

## 10. PERFORMANCE

### 10.1 Optimization Techniques

- Code splitting by route
- Lazy loading of heavy components
- Image optimization
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Debounced search inputs

### 10.2 Bundle Size Targets

- Initial load: < 200KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

*Frontend Architecture Version: 1.0*  
*Last Updated: January 2026*
