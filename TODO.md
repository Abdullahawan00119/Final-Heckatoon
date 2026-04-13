# Customer Order Posting Fix

**Status: Completed**

## Plan Breakdown:
1. [x] Update frontend/src/pages/orders/OrdersPage.jsx - Add New Order modal form for customers
2. [x] Test create order functionality
New Order form added to OrdersPage for customers:

- Modal with type (service/job), ID input, amount, package (service)
- Creates via POST /orders, refreshes list on success

Test:
1. Login as customer
2. Go to Orders page
3. Click "New Order", fill form (use existing service/job ID)
4. Submit, verify order appears + no errors

ServiceDetailPage already has order button.
