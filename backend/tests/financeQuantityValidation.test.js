const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { createCreditors } = require('../controllers/financeController');

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

test('creditor creation persists a fractional quantity as a number', async () => {
  const originalQuery = db.query;
  let insertedParams;
  db.query = async (_sql, params) => {
    insertedParams = params;
    return [{ insertId: 21 }];
  };

  const response = createResponse();
  try {
    await createCreditors({
      body: { client_id: 3, created_by: 7, qty: '0.375', remarks: 'Invoice quantity' }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 201);
  assert.equal(insertedParams[8], 0.375);
});

test('creditor creation rejects non-numeric quantities', async () => {
  const response = createResponse();
  await createCreditors({
    body: { client_id: 3, created_by: 7, qty: 'several', remarks: 'Invoice quantity' }
  }, response);

  assert.equal(response.statusCode, 400);
});
