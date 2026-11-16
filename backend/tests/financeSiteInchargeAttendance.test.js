const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { upsertSiteInchargeAttendance } = require('../controllers/financeController');

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

test('finance site-incharge attendance stores fractional shifts as numbers', async () => {
  const originalQuery = db.query;
  let insertedParams;
  db.query = async (sql, params = []) => {
    if (sql.includes('SELECT id FROM finance_siteincharge_attendance')) return [[]];
    if (sql.includes('INSERT INTO finance_siteincharge_attendance')) {
      insertedParams = params;
      return [{ insertId: 1 }];
    }
    assert.fail(`Unexpected database query: ${sql}`);
  };

  const response = createResponse();
  try {
    await upsertSiteInchargeAttendance({
      body: {
        attendances: [{
          siteincharge_assign_id: 17,
          shift: '0.5',
          entry_date: new Date().toISOString().split('T')[0],
          remarks: 'Half shift'
        }],
        created_by: 7
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 201);
  assert.equal(insertedParams[1], 0.5);
});

test('finance site-incharge attendance rejects invalid shift quantities', async () => {
  const response = createResponse();
  await upsertSiteInchargeAttendance({
    body: {
      attendances: [{
        siteincharge_assign_id: 17,
        shift: 'half',
        entry_date: new Date().toISOString().split('T')[0],
        remarks: 'Invalid shift'
      }],
      created_by: 7
    }
  }, response);

  assert.equal(response.statusCode, 400);
});
