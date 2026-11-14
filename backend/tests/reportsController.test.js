const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const reportsController = require('../controllers/reportsController');

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

test('site operations reports apply parameterized site, description, and date range filters', async () => {
  const statements = [];
  const originalQuery = db.query;
  db.query = async (sql, params = []) => {
    statements.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    return [[], []];
  };
  const response = createResponse();

  try {
    await reportsController.getSiteOperationsReports({
      query: {
        site_id: 'SITE-1',
        desc_id: '69',
        start_date: '2026-11-01',
        end_date: '2026-11-13'
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.deepEqual(Object.keys(response.body.data), [
    'completion',
    'labour',
    'materials',
    'expenses',
    'budgetSummary'
  ]);
  assert.equal(statements.length, 5);
  assert.deepEqual(statements[0].params, ['SITE-1', '69', '2026-11-01', '2026-11-13']);
  assert.deepEqual(statements[4].params, ['2026-11-01', '2026-11-13', 'SITE-1', '69']);
  assert.ok(statements.every(({ sql }) => sql.includes('?')));
});

test('reports reject invalid date ranges without querying the database', async () => {
  const originalQuery = db.query;
  db.query = async () => assert.fail('Invalid date ranges must not query the database');
  const response = createResponse();

  try {
    await reportsController.getSiteOperationsReports({
      query: {
        start_date: '2026-11-14',
        end_date: '2026-11-13'
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'start_date cannot be later than end_date');
});

test('report filters return sites and distinct work descriptions', async () => {
  const originalQuery = db.query;
  const statements = [];
  db.query = async (sql, params = []) => {
    statements.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    return [statements.length === 1
      ? [{ site_id: 'SITE-1', site_name: 'Site One' }]
      : [{ desc_id: 69, desc_name: 'Floor Coating' }], []];
  };
  const response = createResponse();

  try {
    await reportsController.getReportFilters({ query: { site_id: 'SITE-1' } }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.sites[0].site_id, 'SITE-1');
  assert.equal(response.body.data.descriptions[0].desc_name, 'Floor Coating');
  assert.deepEqual(statements[1].params, ['SITE-1', 'SITE-1']);
});
