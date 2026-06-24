# Backend Changes Log

## Overview
This document lists all modifications made to the backend codebase for the Eat & Park POS system.

---

## 1. Authentication Controller (`controllers/authController.js`)

### Changes Made:

#### Added `getAllUsers()` Function
- **Purpose**: Fetch all users in the system for staff management
- **Endpoint**: `/auth/all-users`
- **Access**: Protected (Admin only)
- **Response**: Returns all users with PIN field excluded
- **Code Added**:
```javascript
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-pin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

#### Modified `getPendingUsers()` Function
- **Original Behavior**: Filtered users with `status === 'pending'`
- **New Behavior**: Returns ALL users regardless of pending status
- **Reason**: Staff management UI needs to display both approved and pending staff
- **Impact**: Now used to load complete staff list, not just pending accounts

#### Function Exported
- Added `getAllUsers` to module.exports: `{ registerUser, login, validateUser, getPendingUsers, getAllUsers, updateUser, deleteUser, changePassword }`

---

## 2. Authentication Routes (`routes/authRoutes.js`)

### Changes Made:

#### Added New Route
- **Route**: `GET /api/auth/all-users`
- **Middleware**: `protect`, `authorizeRole('admin')`
- **Controller**: `getAllUsers()`
- **Purpose**: Allows admin to fetch all user accounts for staff management
- **Code Added**:
```javascript
router.get('/all-users', protect, authorizeRole('admin'), getAllUsers);
```

#### Updated Imports
- Imported `getAllUsers` function from authController

---

## 3. Transaction Model (`models/Transactions.js`)

### Changes Made (Removed Tax/Service Charge):

#### Removed Fields
- **Field 1**: `tax` (type: Number)
  - Was: Required field with mandatory value
  - Reason: Removed to simplify billing (inclusive pricing)

- **Field 2**: `serviceCharge` (type: Number)
  - Was: Optional field with default value of 0
  - Reason: No longer charging service fees

#### Updated Schema Structure
**Before**:
```javascript
subtotal: { type: Number, required: true },
tax: { type: Number, required: true },
serviceCharge: { type: Number, default: 0 },
total: { type: Number, required: true },
```

**After**:
```javascript
subtotal: { type: Number, required: true },
total: { type: Number, required: true },
```

---

## 4. Table Controller (`controllers/tableController.js`)

### Changes Made (Removed Tax/Service Charge Calculations):

#### Removed Constants
```javascript
// REMOVED:
const TAX_RATE = 0.05; // 5% GST
const SERVICE_CHARGE_RATE = 0.00; // 0% Service Charge
```

#### Modified `generateRunningBill()` Function
- **Change**: Removed all tax and service charge calculations
- **Old Calculation**:
```javascript
const tax = subtotal * TAX_RATE;
const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
const total = subtotal + tax + serviceCharge;
```

- **New Calculation**:
```javascript
const total = subtotal; // Direct subtotal as total
```

#### Updated Response
**Before**:
```javascript
res.json({
  tableId: table.tableId,
  items: itemizedBill,
  subtotal: Math.round(subtotal),
  tax: Math.round(tax),
  serviceCharge: Math.round(serviceCharge),
  total: Math.round(total)
});
```

**After**:
```javascript
res.json({
  tableId: table.tableId,
  items: itemizedBill,
  subtotal: Math.round(subtotal),
  total: Math.round(total)
});
```

---

## 5. Transaction Controller (`controllers/transactionController.js`)

### Changes Made (Removed Tax/Service Charge):

#### Removed Constants
```javascript
// REMOVED:
const TAX_RATE = 0.05;
const SERVICE_CHARGE_RATE = 0.00;
```

#### Modified `createTransaction()` Function
- **Change**: Removed all tax and service charge calculations

- **Old Calculation**:
```javascript
const tax = subtotal * TAX_RATE;
const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
const total = subtotal + tax + serviceCharge;
```

- **New Calculation**:
```javascript
const total = subtotal; // Direct subtotal as total
```

#### Updated Transaction Creation
**Before**:
```javascript
const transaction = await Transaction.create({
  receiptId,
  tableId,
  items: validItems,
  subtotal: Math.round(subtotal),
  tax: Math.round(tax),
  serviceCharge: Math.round(serviceCharge),
  total: Math.round(total),
  paymentMethod,
  processedBy: req.user._id
});
```

**After**:
```javascript
const transaction = await Transaction.create({
  receiptId,
  tableId,
  items: validItems,
  subtotal: Math.round(subtotal),
  total: Math.round(total),
  paymentMethod,
  processedBy: req.user._id
});
```

---

## Summary of Changes by Category

### Staff Management Enhancements
- ✅ Added `getAllUsers()` function to fetch complete staff list
- ✅ Added `/auth/all-users` API endpoint
- ✅ Modified `getPendingUsers()` to return all users for admin view

### Billing Simplification (Tax & Service Charge Removal)
- ✅ Removed `tax` field from Transaction schema
- ✅ Removed `serviceCharge` field from Transaction schema
- ✅ Removed TAX_RATE and SERVICE_CHARGE_RATE constants
- ✅ Updated bill generation to use subtotal as total
- ✅ Updated transaction creation to exclude tax/service charge calculations
- ✅ Simplified response payloads (smaller data objects)

---

## Files Modified
1. `controllers/authController.js` - Auth logic
2. `routes/authRoutes.js` - Auth API routes
3. `models/Transactions.js` - Transaction schema
4. `controllers/tableController.js` - Bill calculations
5. `controllers/transactionController.js` - Transaction creation

---

## Impact on Frontend
These backend changes require corresponding frontend updates:
- API responses no longer include `tax` and `serviceCharge` fields
- Frontend must be updated to not expect these fields in responses
- Staff management now loads all users (approved + pending)

---

## Testing Recommendations
1. Test `/auth/all-users` endpoint returns complete staff list
2. Test transaction creation with new schema (without tax/serviceCharge)
3. Test bill generation shows correct totals
4. Verify staff management UI displays pending and approved staff separately
5. Confirm existing transactions in DB are not affected (old data with tax fields)

---

## Rollback Information
If needed to revert changes:
- Restore TAX_RATE and SERVICE_CHARGE_RATE constants if pricing changes needed
- Re-add `tax` and `serviceCharge` fields to Transaction schema
- Update calculation logic in tableController and transactionController
- Restore old response payloads

---

**Last Updated**: April 10, 2026  
**Modified By**: AI Assistant  
**Status**: Complete
