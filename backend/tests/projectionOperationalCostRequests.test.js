const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const {
  listOperationalCostChangeRequests,
  createOperationalCostChangeRequest,
  reviewOperationalCostChangeRequest,
} = require('../controllers/projectionOperationalCostController');

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
  },
});

const createToken = role => jwt.sign(
  { user_id: 7, role },
  process.env.JWT_SECRET || 'your_jwt_secret_key',
  { expiresIn: '10m' }
);

test('creates an Operational Cost request with the requester remark', async () => {
  const statements = [];
  let committed = false;
  const connection = {
    async beginTransaction() {},
    async commit() {
      committed = true;
    },
    async rollback() {
      assert.fail('A valid Operational Cost request should commit');
    },
    release() {},
    async query(sql, params = []) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalizedSql, params });
      if (normalizedSql.startsWith('SELECT id, projection_id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, projection_id: 1, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 21 }]];
      }
      if (normalizedSql.startsWith('SELECT pa.id, pa.projection_id, pa.overhead_type_id, pa.total_cost')) {
        return [[{ id: 11, projection_id: 1, overhead_type_id: 10, total_cost: 800 }]];
      }
      if (normalizedSql.startsWith('SELECT COALESCE(SUM(GREATEST')) {
        return [[{ total_spent: 500 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM projection_operational_cost_change_requests')) {
        return [[]];
      }
      if (normalizedSql.startsWith('INSERT INTO projection_operational_cost_change_requests')) {
        return [{ insertId: 31 }, []];
      }
      assert.fail(`Unexpected SQL: ${normalizedSql}`);
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = createResponse();

  try {
    await createOperationalCostChangeRequest({
      headers: { authorization: `Bearer ${createToken('admin')}` },
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        requested_operational_cost: 1200,
        remark: 'Additional cost is required for the revised work scope.',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.id, 31);
  assert.equal(committed, true);
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('INSERT INTO projection_operational_cost_change_requests') &&
    params[5] === 1200 &&
    params[6] === 'Additional cost is required for the revised work scope.' &&
    params[7] === 7
  ));
});

test('rejects an Operational Cost reduction below the existing allocations', async () => {
  const connection = {
    async beginTransaction() {},
    async commit() {
      assert.fail('An infeasible request must not commit');
    },
    async rollback() {},
    release() {},
    async query(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.startsWith('SELECT id, projection_id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, projection_id: 1, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 21 }]];
      }
      if (normalizedSql.startsWith('SELECT pa.id, pa.projection_id, pa.overhead_type_id, pa.total_cost')) {
        return [[{ id: 11, projection_id: 1, overhead_type_id: 10, total_cost: 800 }]];
      }
      if (normalizedSql.startsWith('SELECT COALESCE(SUM(GREATEST')) {
        return [[{ total_spent: 500 }]];
      }
      assert.fail(`Unexpected SQL: ${normalizedSql}`);
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = createResponse();

  try {
    await createOperationalCostChangeRequest({
      headers: { authorization: `Bearer ${createToken('admin')}` },
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        requested_operational_cost: 700,
        remark: 'Reduce cost.',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /Projection 1 would have a negative remaining budget/);
});

test('rejects an Operational Cost request above the PO Value', async () => {
  const connection = {
    async beginTransaction() {},
    async commit() {
      assert.fail('A request above PO Value must not commit');
    },
    async rollback() {},
    release() {},
    async query(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.startsWith('SELECT id, projection_id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, projection_id: 1, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 21 }]];
      }
      assert.fail(`Unexpected SQL: ${normalizedSql}`);
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = createResponse();

  try {
    await createOperationalCostChangeRequest({
      headers: { authorization: `Bearer ${createToken('admin')}` },
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        requested_operational_cost: 1600,
        remark: 'Increase cost.',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /cannot exceed the PO Value/);
});

test('only an MD token can approve and apply a pending Operational Cost request', async () => {
  const statements = [];
  let committed = false;
  const connection = {
    async beginTransaction() {},
    async commit() {
      committed = true;
    },
    async rollback() {
      assert.fail('A valid MD approval should commit');
    },
    release() {},
    async query(sql, params = []) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalizedSql, params });
      if (normalizedSql.startsWith('SELECT id, site_id, desc_id, projection_id, po_budget_id')) {
        return [[{
          id: 31,
          site_id: 'SITE-1',
          desc_id: 7,
          projection_id: 1,
          po_budget_id: 5,
          previous_operational_cost: 1000,
          requested_operational_cost: 1200,
          status: 'pending',
        }]];
      }
      if (normalizedSql.startsWith('SELECT id, projection_id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, projection_id: 1, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 21 }]];
      }
      if (normalizedSql.startsWith('SELECT pa.id, pa.projection_id, pa.overhead_type_id, pa.total_cost')) {
        return [[{ id: 11, projection_id: 1, overhead_type_id: 10, total_cost: 800 }]];
      }
      if (normalizedSql.startsWith('SELECT COALESCE(SUM(GREATEST')) {
        return [[{ total_spent: 500 }]];
      }
      if (normalizedSql.startsWith('SELECT id, status FROM projection_operational_cost_change_requests')) {
        return [[{ id: 31, status: 'pending' }]];
      }
      if (normalizedSql.startsWith('SELECT id, projection_id FROM projection_remaining')) {
        return [[{ id: 8, projection_id: 1 }]];
      }
      return [{ affectedRows: 1 }, []];
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = createResponse();

  try {
    await reviewOperationalCostChangeRequest({
      headers: { authorization: `Bearer ${createToken('md')}` },
      params: { requestId: '31' },
      body: { decision: 'approved', review_remark: 'Approved for the revised work scope.' },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(committed, true);
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('UPDATE po_budget SET total_budget_value = ?') &&
    params[0] === 1200 &&
    params[1] === 5
  ));
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('UPDATE projection_remaining SET remaining_budget = ?') &&
    params[0] === 400 &&
    params[2] === 8
  ));
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('UPDATE projection_operational_cost_change_requests SET status = ?') &&
    params[0] === 'approved' &&
    params[1] === 7
  ));
});

test('rejects an admin token attempting to approve an Operational Cost request', async () => {
  const response = createResponse();
  await reviewOperationalCostChangeRequest({
    headers: { authorization: `Bearer ${createToken('admin')}` },
    params: { requestId: '31' },
    body: { decision: 'approved' },
  }, response);

  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /Only a Managing Director/);
});

test('marks requests as reviewable only for an MD session', async () => {
  const originalQuery = db.query;
  db.query = async () => [[{ id: 31, status: 'pending' }]];
  const adminResponse = createResponse();
  const mdResponse = createResponse();

  try {
    await listOperationalCostChangeRequests({
      headers: { authorization: `Bearer ${createToken('admin')}` },
      query: { site_id: 'SITE-1', desc_id: '7', projection_id: '1' },
    }, adminResponse);
    await listOperationalCostChangeRequests({
      headers: { authorization: `Bearer ${createToken('md')}` },
      query: { site_id: 'SITE-1', desc_id: '7', projection_id: '1' },
    }, mdResponse);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(adminResponse.body.can_review, false);
  assert.equal(mdResponse.body.can_review, true);
});
