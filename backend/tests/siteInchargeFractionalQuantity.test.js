const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { saveCompletionStatus } = require('../controllers/SiteInchargeController');

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

test('completion entries preserve fractional area values', async () => {
  const originalQuery = db.query;
  const insertedHistoryParams = [];
  db.query = async (sql, params = []) => {
    if (sql.includes('SELECT rec_id FROM po_reckoner')) return [[{ rec_id: 8 }]];
    if (sql.includes('SELECT user_id FROM users')) return [[{ user_id: 7 }]];
    if (sql.includes('SELECT completion_id, area_completed')) return [[]];
    if (sql.includes('INSERT INTO completion_entries_history')) {
      insertedHistoryParams.push(params);
      return [{ insertId: 31 }];
    }
    if (sql.includes('SELECT COALESCE(SUM(area_added), 0) as current_area')) {
      return [[{ current_area: 1.375 }]];
    }
    if (sql.includes('INSERT INTO completion_status')) return [{ insertId: 12 }];
    assert.fail(`Unexpected database query: ${sql}`);
  };

  const response = createResponse();
  try {
    await saveCompletionStatus({
      body: {
        rec_id: 8,
        area_added: 1.25,
        rate: 2.5,
        value: 3.125,
        created_by: 7,
        entry_date: new Date().toISOString().split('T')[0],
        remarks: 'Fractional area'
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 201);
  assert.equal(insertedHistoryParams[0][2], 1.25);
  assert.equal(response.body.data.area_completed, 1.375);
});
