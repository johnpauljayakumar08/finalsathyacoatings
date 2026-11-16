const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const resourceController = require('../controllers/resourceController');

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

test('consumable creation requires part number, unit, quantity, rate, and site', async () => {
  const originalQuery = db.query;
  let queryCount = 0;
  db.query = async () => {
    queryCount += 1;
    throw new Error('Database should not be queried for incomplete consumables');
  };
  const response = createResponse();

  try {
    await resourceController.createConsumable({
      body: { consumable_name: 'Primer' }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /part number, unit, and site/i);
  assert.equal(queryCount, 0);
});

test('consumable creation stores decimal quantity and calculated value', async () => {
  const originalQuery = db.query;
  const calls = [];
  db.query = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('INSERT INTO resource_consumables')) {
      return [{ insertId: 17 }, []];
    }
    return [[{
      id: 17,
      name: 'Primer',
      item_description: 'Primer',
      part_no: 'PR-01',
      unit: 'Litre',
      quantity: '1.250',
      rate: '2.40',
      value: '3.00',
      site: 'Factory A',
      is_multi_use: 0,
      createdAt: '2026-11-16 10:00:00',
    }], []];
  };
  const response = createResponse();

  try {
    await resourceController.createConsumable({
      body: {
        consumable_name: 'Primer',
        part_no: 'PR-01',
        unit: 'Litre',
        quantity: '1.25',
        rate: '2.40',
        site: 'Factory A',
        is_multi_use: 0,
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 201);
  assert.equal(calls[0].params[3], 1.25);
  assert.equal(calls[0].params[5], 3);
  assert.equal(response.body.data.quantity, '1.250');
  assert.equal(response.body.data.value, '3.00');
});

test('consumable creation rejects quantities with more than three decimal places', async () => {
  const originalQuery = db.query;
  let queryCount = 0;
  db.query = async () => {
    queryCount += 1;
    throw new Error('Database should not be queried for invalid quantities');
  };
  const response = createResponse();

  try {
    await resourceController.createConsumable({
      body: {
        consumable_name: 'Primer',
        part_no: 'PR-01',
        unit: 'Litre',
        quantity: '1.2345',
        rate: '2.40',
        site: 'Factory A',
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /quantity must be positive/i);
  assert.equal(queryCount, 0);
});
