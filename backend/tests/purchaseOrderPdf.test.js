const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePurchaseOrderText } = require('../controllers/purchaseRegisterController');

test('extracts vendor as supplier and purchase order values from the provided PO layout', () => {
  const parsed = parsePurchaseOrderText(`
Purchase Order #: 
PO-103
Purchase Order Date: 
29 Sep 2026
Vendor Details:
chellam indus
CHELLAM INDUSTRIES
GSTIN: 34AAPPN0312B1ZB
#ItemHSN/SACRate / ItemQtyTaxable ValueTax AmountAmount
1CNSL Resin 3208909088.00400 KGS35,200.006,336.00 (18%)41,536.00
IGST 18.0%₹6,336.00
Total
₹41,536.00
`);

  assert.equal(parsed.supplier_name, 'CHELLAM INDUSTRIES');
  assert.equal(parsed.po_number, 'PO-103');
  assert.equal(parsed.transaction_date, '2026-09-29');
  assert.deepEqual(parsed.items, [{
    description: 'CNSL Resin',
    rate: 88,
    quantity: 400,
    uom: 'KGS'
  }]);
  assert.equal(parsed.gst, 6336);
  assert.equal(parsed.grand_total, 41536);
});

test('extracts multiple line items and reports zero GST when a PO has no tax lines', () => {
  const parsed = parsePurchaseOrderText(`
Purchase Order #:
PO-104
Purchase Order Date:
30 Sep 2026
Vendor Details:
Sample Vendor
GSTIN: 00
1Primer 32089090100.002 NOS200.000.00300.00
2Brush 3208909050.004 NOS200.000.00200.00
Total
₹500.00
`);

  assert.equal(parsed.supplier_name, 'Sample Vendor');
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.gst, 0);
  assert.equal(parsed.grand_total, 500);
});
