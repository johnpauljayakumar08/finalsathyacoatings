const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const projectModel = require('../models/projectModel');
const siteInchargeController = require('../controllers/SiteInchargeController');
const authorizeSiteIncharge = require('../middleware/authorizeSiteIncharge');

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

test('site incharge authorization rejects missing credentials and non-site-incharge roles', () => {
  const missingResponse = createResponse();
  authorizeSiteIncharge({ headers: {} }, missingResponse, () => assert.fail('Missing token must not pass'));
  assert.equal(missingResponse.statusCode, 401);

  const adminToken = jwt.sign(
    { user_id: 7, role: 'admin' },
    process.env.JWT_SECRET || 'your_jwt_secret_key'
  );
  const forbiddenResponse = createResponse();
  authorizeSiteIncharge(
    { headers: { authorization: `Bearer ${adminToken}` } },
    forbiddenResponse,
    () => assert.fail('Admin token must not pass')
  );
  assert.equal(forbiddenResponse.statusCode, 403);
});

test('assigned project query is scoped to the authenticated user and current assignment dates', async () => {
  const originalQuery = db.query;
  let captured;
  db.query = async (sql, params) => {
    captured = { sql: sql.replace(/\s+/g, ' ').trim(), params };
    return [[], []];
  };

  try {
    await projectModel.getSiteInchargeProjectsWithSites(21, 'CO001');
  } finally {
    db.query = originalQuery;
  }

  assert.deepEqual(captured.params, [21, 'CO001', 'CO001']);
  assert.match(captured.sql, /u\.user_id = \?/);
  assert.match(captured.sql, /sia\.from_date <= CURRENT_DATE\(\)/);
  assert.match(captured.sql, /sia\.to_date.*CURRENT_DATE\(\)/);
});

test('assigned work descriptions are limited to the authenticated incharge and site', async () => {
  const originalQuery = db.query;
  let captured;
  db.query = async (sql, params) => {
    captured = { sql: sql.replace(/\s+/g, ' ').trim(), params };
    return [[{ desc_id: 4, desc_name: 'Floor Coating' }], []];
  };
  const response = createResponse();

  try {
    await siteInchargeController.getAssignedWorkDescriptions({
      query: { site_id: 'SITE-1' },
      siteInchargeUser: { user_id: 21 }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.data, [{ desc_id: 4, desc_name: 'Floor Coating' }]);
  assert.deepEqual(captured.params, [21, 'SITE-1']);
  assert.match(captured.sql, /sia\.desc_id IS NULL OR sia\.desc_id = pr\.desc_id/);
  assert.match(captured.sql, /sia\.from_date <= CURRENT_DATE\(\)/);
});
