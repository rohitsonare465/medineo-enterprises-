# Medineo ERP - Billing Flow Logic
## Purchase → Stock → Sales → Ledger Complete Flow

---

## 1. END-TO-END BUSINESS FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MEDINEO ERP - COMPLETE BUSINESS FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

    PURCHASE SIDE                              SALES SIDE
    ─────────────                              ──────────
         │                                          │
         ▼                                          ▼
┌─────────────────┐                        ┌─────────────────┐
│   Vendor        │                        │   Customer      │
│   Invoice       │                        │   Order         │
│   Received      │                        │                 │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         ▼                                          ▼
┌─────────────────┐                        ┌─────────────────┐
│   Purchase      │                        │   Sales         │
│   Entry         │                        │   Billing       │
│   Created       │                        │   Created       │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         │    ┌─────────────────────────────┐       │
         │    │                             │       │
         ▼    ▼                             ▼       ▼
    ┌─────────────────────────────────────────────────────┐
    │                                                      │
    │                    STOCK (BATCHES)                   │
    │                                                      │
    │   ┌──────────┐  ┌──────────┐  ┌──────────┐          │
    │   │ Batch 1  │  │ Batch 2  │  │ Batch 3  │          │
    │   │ Exp: Mar │  │ Exp: Jun │  │ Exp: Dec │          │
    │   │ Qty: 100 │  │ Qty: 150 │  │ Qty: 200 │          │
    │   └──────────┘  └──────────┘  └──────────┘          │
    │                                                      │
    │   Purchase ──► ADD Stock                             │
    │   Sales    ──► DEDUCT Stock (FIFO)                   │
    │                                                      │
    └─────────────────────────────────────────────────────┘
         │                                          │
         ▼                                          ▼
┌─────────────────┐                        ┌─────────────────┐
│   Vendor        │                        │   Customer      │
│   Ledger        │                        │   Ledger        │
│   (Payable)     │                        │   (Receivable)  │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         ▼                                          ▼
┌─────────────────┐                        ┌─────────────────┐
│   Payment       │                        │   Payment       │
│   Made          │                        │   Received      │
└─────────────────┘                        └─────────────────┘
```

---

## 2. PURCHASE FLOW (Vendor → Stock → Payable)

### 2.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PURCHASE FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: RECEIVE VENDOR INVOICE
┌─────────────────────────────────────────────────────────────────────────────┐
│  Vendor: Sun Pharmaceuticals                                                 │
│  Invoice: INV/SUN/2026/1234                                                 │
│  Date: 28-Jan-2026                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Items:                                                                      │
│  ┌──────────────┬─────────┬────────┬─────┬────────┬────────┬──────────────┐│
│  │ Medicine     │ Batch   │ Expiry │ Qty │ Rate   │ GST    │ Amount       ││
│  ├──────────────┼─────────┼────────┼─────┼────────┼────────┼──────────────┤│
│  │ Paracetamol  │PAR26001 │Jan 28  │ 500 │ ₹18.00 │ 12%    │ ₹10,080.00   ││
│  │ Amoxicillin  │AMX26002 │Mar 28  │ 200 │ ₹35.00 │ 12%    │ ₹7,840.00    ││
│  └──────────────┴─────────┴────────┴─────┴────────┴────────┴──────────────┘│
│                                                                              │
│  Subtotal: ₹16,000.00    CGST: ₹960.00    SGST: ₹960.00                     │
│  Grand Total: ₹17,920.00                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 2: CREATE PURCHASE ENTRY
┌─────────────────────────────────────────────────────────────────────────────┐
│  Status: DRAFT                                                               │
│  - Validate vendor details                                                   │
│  - Enter line items with batch info                                          │
│  - Calculate GST automatically                                               │
│  - Set due date based on payment terms                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 3: CONFIRM PURCHASE
┌─────────────────────────────────────────────────────────────────────────────┐
│  On Confirmation:                                                            │
│                                                                              │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐│
│  │ CREATE BATCHES      │   │ UPDATE STOCK        │   │ UPDATE LEDGER       ││
│  │                     │   │                     │   │                     ││
│  │ - Batch PAR26001    │   │ - Paracetamol +500  │   │ - Vendor Payable    ││
│  │   Qty: 500          │   │ - Amoxicillin +200  │   │   +₹17,920.00       ││
│  │   Rate: ₹18.00      │   │                     │   │                     ││
│  │                     │   │                     │   │ - Running Balance   ││
│  │ - Batch AMX26002    │   │                     │   │   Updated           ││
│  │   Qty: 200          │   │                     │   │                     ││
│  │   Rate: ₹35.00      │   │                     │   │                     ││
│  └─────────────────────┘   └─────────────────────┘   └─────────────────────┘│
│                                                                              │
│  All operations in SINGLE DATABASE TRANSACTION                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Purchase Confirmation Algorithm

```typescript
async function confirmPurchase(purchaseId: string): Promise<void> {
  // Start transaction
  await prisma.$transaction(async (tx) => {
    // 1. Get purchase with items
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true, vendor: true }
    });
    
    if (purchase.status !== 'DRAFT') {
      throw new Error('Only draft purchases can be confirmed');
    }
    
    // 2. Create/Update batches for each item
    for (const item of purchase.items) {
      // Check if batch already exists
      const existingBatch = await tx.batch.findFirst({
        where: {
          medicineId: item.medicineId,
          batchNumber: item.batchNumber
        }
      });
      
      if (existingBatch) {
        // Add quantity to existing batch
        await tx.batch.update({
          where: { id: existingBatch.id },
          data: {
            currentQty: { increment: item.totalQty },
            initialQty: { increment: item.totalQty }
          }
        });
        
        // Link to purchase item
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: { batchId: existingBatch.id }
        });
      } else {
        // Create new batch
        const newBatch = await tx.batch.create({
          data: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            mfgDate: item.mfgDate,
            expiryDate: item.expiryDate,
            mrp: item.mrp,
            purchaseRate: item.purchaseRate,
            sellingRate: item.sellingRate,
            initialQty: item.totalQty,
            currentQty: item.totalQty,
            purchaseId: purchaseId,
            status: 'ACTIVE'
          }
        });
        
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: { batchId: newBatch.id }
        });
      }
      
      // 3. Create stock movement record
      await tx.stockMovement.create({
        data: {
          batchId: newBatch?.id || existingBatch.id,
          medicineId: item.medicineId,
          movementType: 'PURCHASE_IN',
          referenceType: 'PURCHASE',
          referenceId: purchaseId,
          referenceNumber: purchase.invoiceNumber,
          quantityBefore: existingBatch?.currentQty || 0,
          quantityChange: item.totalQty,
          quantityAfter: (existingBatch?.currentQty || 0) + item.totalQty,
          rate: item.purchaseRate,
          movementDate: purchase.invoiceDate
        }
      });
    }
    
    // 4. Create vendor ledger entry
    const previousBalance = purchase.vendor.currentBalance;
    const newBalance = previousBalance + purchase.grandTotal;
    
    await tx.vendorLedger.create({
      data: {
        vendorId: purchase.vendorId,
        transactionDate: purchase.invoiceDate,
        transactionType: 'PURCHASE_INVOICE',
        referenceType: 'PURCHASE',
        referenceId: purchaseId,
        referenceNumber: purchase.invoiceNumber,
        debitAmount: 0,
        creditAmount: purchase.grandTotal,  // Increases payable
        runningBalance: newBalance,
        narration: `Purchase Invoice ${purchase.invoiceNumber}`
      }
    });
    
    // 5. Update vendor balance
    await tx.vendor.update({
      where: { id: purchase.vendorId },
      data: { currentBalance: newBalance }
    });
    
    // 6. Update purchase status
    await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedBy: currentUserId
      }
    });
  });
}
```

---

## 3. SALES FLOW (Customer → Stock Deduction → Receivable)

### 3.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SALES FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: SELECT CUSTOMER
┌─────────────────────────────────────────────────────────────────────────────┐
│  Customer: City Medical Store                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  CREDIT CHECK:                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Credit Limit:     ₹1,00,000                                           │ │
│  │  Current Outstanding: ₹45,000                                          │ │
│  │  Available Credit:    ₹55,000                                          │ │
│  │  Credit Status:       ● ACTIVE                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  If (Outstanding + NewInvoice) > CreditLimit:                               │
│     → Block sale OR Request owner override                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 2: ADD MEDICINES (FIFO BATCH SELECTION)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Search: "Paracetamol"                                                       │
│  Required Qty: 100                                                           │
│                                                                              │
│  FIFO ALLOCATION:                                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Available Batches (sorted by expiry ASC):                             │ │
│  │                                                                         │ │
│  │  Batch      │ Expiry    │ Available │ Allocate │ Rate    │ Amount      │ │
│  │  ──────────────────────────────────────────────────────────────────    │ │
│  │  PAR25001   │ Mar 2026  │    30     │    30    │ ₹28.00  │ ₹840.00     │ │
│  │  PAR25002   │ Jun 2026  │    80     │    70    │ ₹28.00  │ ₹1,960.00   │ │
│  │  ──────────────────────────────────────────────────────────────────    │ │
│  │  TOTAL ALLOCATED: 100                           TOTAL: ₹2,800.00       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Note: Expired batches and near-expiry (<7 days) are excluded               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 3: CALCULATE GST
┌─────────────────────────────────────────────────────────────────────────────┐
│  GST CALCULATION LOGIC:                                                      │
│                                                                              │
│  1. Determine State:                                                         │
│     - Company State Code: 27 (Maharashtra)                                   │
│     - Customer State Code: 27 (Maharashtra)                                  │
│     - Same State → Intra-State → CGST + SGST                                │
│                                                                              │
│  2. Calculate Tax:                                                           │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  Taxable Amount:  ₹2,800.00                                       │   │
│     │  GST Rate:        12%                                              │   │
│     │                                                                    │   │
│     │  CGST (6%):       ₹168.00                                         │   │
│     │  SGST (6%):       ₹168.00                                         │   │
│     │  Total GST:       ₹336.00                                         │   │
│     │                                                                    │   │
│     │  Grand Total:     ₹3,136.00                                       │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  If Inter-State (different state codes):                                     │
│     - Apply IGST (12%) instead of CGST+SGST                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 4: CONFIRM SALE & GENERATE INVOICE
┌─────────────────────────────────────────────────────────────────────────────┐
│  On Confirmation:                                                            │
│                                                                              │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐│
│  │ GENERATE INVOICE #  │   │ DEDUCT STOCK        │   │ UPDATE LEDGER       ││
│  │                     │   │                     │   │                     ││
│  │ MED/2025-26/0126    │   │ - Batch PAR25001    │   │ - Customer Recv.    ││
│  │                     │   │   -30 units         │   │   +₹3,136.00        ││
│  │ (Auto-generated     │   │                     │   │                     ││
│  │  sequential number) │   │ - Batch PAR25002    │   │ - Running Balance   ││
│  │                     │   │   -70 units         │   │   ₹48,136.00        ││
│  └─────────────────────┘   └─────────────────────┘   └─────────────────────┘│
│                                                                              │
│  ┌─────────────────────┐                                                    │
│  │ GENERATE PDF        │                                                    │
│  │                     │                                                    │
│  │ GST Invoice with:   │                                                    │
│  │ - Company details   │                                                    │
│  │ - Customer details  │                                                    │
│  │ - Line items        │                                                    │
│  │ - GST breakup       │                                                    │
│  │ - Terms & signature │                                                    │
│  └─────────────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 FIFO Batch Selection Algorithm

```typescript
interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: Date;
  allocatedQty: number;
  rate: number;
}

async function allocateBatchesFIFO(
  medicineId: string, 
  requiredQty: number
): Promise<BatchAllocation[]> {
  // Get available batches sorted by expiry (FIFO)
  const availableBatches = await prisma.batch.findMany({
    where: {
      medicineId: medicineId,
      status: 'ACTIVE',
      currentQty: { gt: 0 },
      expiryDate: {
        gt: new Date()  // Not expired
      }
    },
    orderBy: {
      expiryDate: 'asc'  // Earliest expiry first (FIFO)
    }
  });
  
  const allocations: BatchAllocation[] = [];
  let remainingQty = requiredQty;
  
  for (const batch of availableBatches) {
    if (remainingQty <= 0) break;
    
    const availableQty = batch.currentQty - batch.reservedQty;
    if (availableQty <= 0) continue;
    
    const allocateQty = Math.min(availableQty, remainingQty);
    
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      allocatedQty: allocateQty,
      rate: batch.sellingRate
    });
    
    remainingQty -= allocateQty;
  }
  
  if (remainingQty > 0) {
    throw new Error(`Insufficient stock. Short by ${remainingQty} units`);
  }
  
  return allocations;
}
```

### 3.3 GST Calculation Logic

```typescript
interface GSTCalculation {
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGST: number;
  grandTotal: number;
}

function calculateGST(
  amount: number,
  gstRate: number,
  companyStateCode: string,
  customerStateCode: string
): GSTCalculation {
  const isIntraState = companyStateCode === customerStateCode;
  
  if (isIntraState) {
    // CGST + SGST (split equally)
    const halfRate = gstRate / 2;
    const cgstAmount = roundToTwo(amount * (halfRate / 100));
    const sgstAmount = roundToTwo(amount * (halfRate / 100));
    
    return {
      taxableAmount: amount,
      cgstRate: halfRate,
      cgstAmount: cgstAmount,
      sgstRate: halfRate,
      sgstAmount: sgstAmount,
      igstRate: 0,
      igstAmount: 0,
      totalGST: cgstAmount + sgstAmount,
      grandTotal: amount + cgstAmount + sgstAmount
    };
  } else {
    // IGST (full rate)
    const igstAmount = roundToTwo(amount * (gstRate / 100));
    
    return {
      taxableAmount: amount,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRate,
      igstAmount: igstAmount,
      totalGST: igstAmount,
      grandTotal: amount + igstAmount
    };
  }
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
```

### 3.4 Sale Confirmation Algorithm

```typescript
async function confirmSale(saleId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Get sale with items
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true, customer: true }
    });
    
    if (sale.status !== 'DRAFT') {
      throw new Error('Only draft sales can be confirmed');
    }
    
    // 2. Credit limit check
    const newOutstanding = sale.customer.currentBalance + sale.grandTotal;
    if (newOutstanding > sale.customer.creditLimit && !sale.creditOverride) {
      throw new Error('Credit limit exceeded');
    }
    
    // 3. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    
    // 4. Deduct stock for each item
    for (const item of sale.items) {
      // Get batch
      const batch = await tx.batch.findUnique({
        where: { id: item.batchId }
      });
      
      if (batch.currentQty < item.quantity) {
        throw new Error(`Insufficient stock for batch ${batch.batchNumber}`);
      }
      
      // Deduct quantity
      await tx.batch.update({
        where: { id: item.batchId },
        data: {
          currentQty: { decrement: item.quantity }
        }
      });
      
      // Update batch status if depleted
      if (batch.currentQty - item.quantity === 0) {
        await tx.batch.update({
          where: { id: item.batchId },
          data: { status: 'DEPLETED' }
        });
      }
      
      // Create stock movement
      await tx.stockMovement.create({
        data: {
          batchId: item.batchId,
          medicineId: item.medicineId,
          movementType: 'SALES_OUT',
          referenceType: 'SALE',
          referenceId: saleId,
          referenceNumber: invoiceNumber,
          quantityBefore: batch.currentQty,
          quantityChange: -item.quantity,
          quantityAfter: batch.currentQty - item.quantity,
          rate: item.rate,
          movementDate: sale.invoiceDate
        }
      });
    }
    
    // 5. Create customer ledger entry
    const previousBalance = sale.customer.currentBalance;
    const newBalance = previousBalance + sale.grandTotal;
    
    await tx.customerLedger.create({
      data: {
        customerId: sale.customerId,
        transactionDate: sale.invoiceDate,
        transactionType: 'SALES_INVOICE',
        referenceType: 'SALE',
        referenceId: saleId,
        referenceNumber: invoiceNumber,
        debitAmount: sale.grandTotal,  // Increases receivable
        creditAmount: 0,
        runningBalance: newBalance,
        narration: `Sales Invoice ${invoiceNumber}`
      }
    });
    
    // 6. Update customer balance
    await tx.customer.update({
      where: { id: sale.customerId },
      data: { currentBalance: newBalance }
    });
    
    // 7. Update sale status
    await tx.sale.update({
      where: { id: saleId },
      data: {
        invoiceNumber: invoiceNumber,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedBy: currentUserId
      }
    });
  });
}
```

---

## 4. PAYMENT FLOWS

### 4.1 Payment Received Flow (From Customer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAYMENT RECEIVED FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: CREATE PAYMENT ENTRY
┌─────────────────────────────────────────────────────────────────────────────┐
│  Customer: City Medical Store                                                │
│  Amount: ₹30,000                                                            │
│  Mode: NEFT                                                                  │
│  Reference: NEFT123456789                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 2: ALLOCATE AGAINST INVOICES
┌─────────────────────────────────────────────────────────────────────────────┐
│  PENDING INVOICES (Oldest First):                                            │
│                                                                              │
│  Invoice         │ Date       │ Amount     │ Pending    │ Allocate         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  MED/25-26/0105  │ 15-Jan-26  │ ₹15,000    │ ₹15,000    │ ₹15,000  ✓       │
│  MED/25-26/0112  │ 20-Jan-26  │ ₹20,000    │ ₹20,000    │ ₹15,000  ✓       │
│  MED/25-26/0118  │ 25-Jan-26  │ ₹13,136    │ ₹13,136    │ ₹0               │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                              Total Allocated: ₹30,000       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 3: UPDATE RECORDS
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Create payment_allocations records                                       │
│  2. Update sales payment_status (PAID / PARTIAL)                            │
│  3. Create customer_ledger entry (Credit ₹30,000)                           │
│  4. Update customer current_balance (-₹30,000)                              │
│  5. Generate receipt                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Payment Made Flow (To Vendor)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYMENT MADE FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: CREATE PAYMENT ENTRY
┌─────────────────────────────────────────────────────────────────────────────┐
│  Vendor: Sun Pharmaceuticals                                                 │
│  Amount: ₹50,000                                                            │
│  Mode: NEFT                                                                  │
│  Reference: NEFT987654321                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 2: ALLOCATE AGAINST PURCHASES
┌─────────────────────────────────────────────────────────────────────────────┐
│  PENDING PURCHASES (Oldest First):                                           │
│                                                                              │
│  Invoice              │ Date       │ Amount     │ Pending    │ Allocate    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  INV/SUN/2026/1200    │ 05-Jan-26  │ ₹35,000    │ ₹35,000    │ ₹35,000  ✓  │
│  INV/SUN/2026/1234    │ 28-Jan-26  │ ₹17,920    │ ₹17,920    │ ₹15,000  ✓  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                              Total Allocated: ₹50,000       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
Step 3: UPDATE RECORDS
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Create vendor_payment_allocations records                                │
│  2. Update purchases payment_status (PAID / PARTIAL)                        │
│  3. Create vendor_ledger entry (Debit ₹50,000)                              │
│  4. Update vendor current_balance (-₹50,000)                                │
│  5. Generate payment voucher                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. RETURN FLOWS

### 5.1 Sales Return Flow

```
SALES RETURN (CREDIT NOTE)
──────────────────────────

1. Select original invoice
2. Select items to return with quantities
3. Optionally return to stock (if saleable)
4. Generate credit note number

UPDATES:
┌─────────────────────────────────────────────────────────────────────────────┐
│  - If returnToStock = true:                                                  │
│      → Add quantity back to batch                                            │
│      → Create stock_movement (SALES_RETURN_IN)                               │
│                                                                              │
│  - Create customer_ledger entry (Credit - reduces receivable)               │
│  - Update customer current_balance                                           │
│  - Generate credit note PDF                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Purchase Return Flow

```
PURCHASE RETURN (DEBIT NOTE)
────────────────────────────

1. Select original purchase invoice
2. Select items to return with quantities
3. Specify reason (damaged, wrong item, etc.)

UPDATES:
┌─────────────────────────────────────────────────────────────────────────────┐
│  - Deduct quantity from batch                                                │
│  - Create stock_movement (PURCHASE_RETURN_OUT)                               │
│  - Create vendor_ledger entry (Debit - reduces payable)                     │
│  - Update vendor current_balance                                             │
│  - Generate debit note PDF                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. INVOICE NUMBER GENERATION

```typescript
// Financial Year: April to March
// Format: PREFIX/YYYY-YY/NNNN
// Example: MED/2025-26/0001

async function generateInvoiceNumber(prefix = 'MED'): Promise<string> {
  const now = new Date();
  const month = now.getMonth() + 1;  // 1-12
  const year = now.getFullYear();
  
  // Financial year
  let fyStart, fyEnd;
  if (month >= 4) {
    // April onwards: current year is start
    fyStart = year;
    fyEnd = (year + 1) % 100;  // Last 2 digits
  } else {
    // Jan-Mar: previous year is start
    fyStart = year - 1;
    fyEnd = year % 100;
  }
  
  const financialYear = `${fyStart}-${fyEnd.toString().padStart(2, '0')}`;
  
  // Get or create sequence
  const sequence = await prisma.invoiceSequence.upsert({
    where: {
      financialYear_prefix: {
        financialYear: financialYear,
        prefix: prefix
      }
    },
    update: {
      lastNumber: { increment: 1 }
    },
    create: {
      financialYear: financialYear,
      prefix: prefix,
      lastNumber: 1
    }
  });
  
  const serialNumber = sequence.lastNumber.toString().padStart(4, '0');
  
  return `${prefix}/${financialYear}/${serialNumber}`;
}
```

---

## 7. LEDGER SUMMARY

### 7.1 Customer Ledger Entry Types

| Entry Type | Debit | Credit | Effect |
|------------|-------|--------|--------|
| OPENING_BALANCE | ✓ | - | Sets initial receivable |
| SALES_INVOICE | ✓ | - | Increases receivable |
| SALES_RETURN | - | ✓ | Decreases receivable |
| PAYMENT_RECEIVED | - | ✓ | Decreases receivable |
| ADJUSTMENT | ✓/✓ | ✓/✓ | Manual correction |

### 7.2 Vendor Ledger Entry Types

| Entry Type | Debit | Credit | Effect |
|------------|-------|--------|--------|
| OPENING_BALANCE | - | ✓ | Sets initial payable |
| PURCHASE_INVOICE | - | ✓ | Increases payable |
| PURCHASE_RETURN | ✓ | - | Decreases payable |
| PAYMENT_MADE | ✓ | - | Decreases payable |
| ADJUSTMENT | ✓/✓ | ✓/✓ | Manual correction |

---

## 8. TRANSACTION SAFETY

All business operations use database transactions to ensure:

1. **Atomicity:** All operations succeed or all fail
2. **Consistency:** Data integrity maintained
3. **Isolation:** Concurrent operations don't conflict
4. **Durability:** Confirmed transactions are permanent

```typescript
// Example: All related operations in single transaction
await prisma.$transaction(async (tx) => {
  // 1. Update stock
  await tx.batch.update(...);
  
  // 2. Create ledger entry
  await tx.customerLedger.create(...);
  
  // 3. Update balance
  await tx.customer.update(...);
  
  // 4. Create movement record
  await tx.stockMovement.create(...);
  
  // If any fails, all roll back
});
```

---

*Billing Flow Version: 1.0*  
*Last Updated: January 2026*
