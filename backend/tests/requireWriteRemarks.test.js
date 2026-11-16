const test = require('node:test');
const assert = require('node:assert/strict');
const requireWriteRemarks = require('../middleware/requireWriteRemarks');

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const runMiddleware = (method, path, body) => {
  const req = { method, path, body };
  const res = createResponse();
  let continued = false;
  requireWriteRemarks(req, res, () => { continued = true; });
  return { res, continued };
};

test('rejects missing and whitespace-only remarks on finance write routes', () => {
  for (const body of [{}, { remarks: ' \t ' }]) {
    const { res, continued } = runMiddleware('POST', '/finance/create-creditors', body);
    assert.equal(res.statusCode, 400);
    assert.equal(continued, false);
  }
});

test('accepts a trimmed non-empty remark and checks dynamic write paths', () => {
  const { res, continued } = runMiddleware('PUT', '/finance/update-custom-payment/42', { remarks: 'Updated' });
  assert.equal(res.statusCode, null);
  assert.equal(continued, true);
});

test('requires a remark for each nested attendance entry', () => {
  const { res, continued } = runMiddleware('POST', '/finance/siteincharge-attendance', {
    attendances: [{ siteincharge_assign_id: 7, shift: 0.5, remarks: ' ' }]
  });
  assert.equal(res.statusCode, 400);
  assert.equal(continued, false);
});

test('requires operational cost review remarks', () => {
  const { res, continued } = runMiddleware('PUT', '/projection/operational-cost-requests/12/review', {
    decision: 'approved',
    review_remark: ''
  });
  assert.equal(res.statusCode, 400);
  assert.equal(continued, false);
});
