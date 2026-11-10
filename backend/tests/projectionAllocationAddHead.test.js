const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const { updateProjectionAllocation } = require('../controllers/projectionController');

test('adds a new budget head to a submitted projection and records it in the ledger and history', async () => {
  const statements = [];
  const connection = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query(sql, params = []) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalizedSql, params });

      if (normalizedSql.startsWith('SELECT id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id, overhead_type_id, total_cost, budget_percentage FROM projection_allocated')) {
        return [[{ id: 11, overhead_type_id: 10, total_cost: 500, budget_percentage: 50 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM overhead WHERE id = ?')) {
        return [[{ id: 20 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 1 }]];
      }
      if (normalizedSql.startsWith('SELECT pb.id FROM po_budget pb JOIN actual_budget ab')) {
        return [[{ id: 5 }]];
      }
      if (normalizedSql.startsWith('SELECT ab.id, ab.overhead_id, ab.splitted_budget')) {
        return [[{
          id: 1,
          overhead_id: 10,
          splitted_budget: 500,
          actual_value: 0,
          history_spent: 0,
        }]];
      }
      if (normalizedSql.startsWith('SELECT id, projection_id, total_budget_value FROM po_budget')) {
        return [[{ id: 5, projection_id: 1, total_budget_value: 1000 }]];
      }
      if (normalizedSql.startsWith('SELECT pa.projection_id, pa.overhead_type_id, pa.total_cost')) {
        return [[
          { projection_id: 1, overhead_type_id: 10, total_cost: 500 },
          { projection_id: 1, overhead_type_id: 20, total_cost: 100 },
        ]];
      }
      if (normalizedSql.startsWith('SELECT id, projection_id FROM projection_remaining')) {
        return [[{ id: 4, projection_id: 1 }]];
      }
      return [{ affectedRows: 1, insertId: statements.length }];
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;

  const response = {
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
  };

  try {
    await updateProjectionAllocation({
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        overhead_type_id: 20,
        total_cost: 100,
        changed_by: '4',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.remaining_budget, 400);
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('INSERT INTO projection_allocated') &&
    params[2] === 20 &&
    params[4] === 100
  ));
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('INSERT INTO actual_budget') &&
    params[1] === 20 &&
    params[2] === 100
  ));
  assert.ok(statements.some(({ sql, params }) =>
    sql.startsWith('INSERT INTO projection_allocation_edit_history') &&
    params[3] === 20 &&
    params[4] === 0 &&
    params[5] === 100
  ));
});

test('requires a separate Operational Cost request when allocation exceeds the approved cost', async () => {
  let rolledBack = false;
  const connection = {
    async beginTransaction() {},
    async commit() {
      assert.fail('Over-budget allocation must not commit');
    },
    async rollback() {
      rolledBack = true;
    },
    release() {},
    async query(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.startsWith('SELECT id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id, overhead_type_id, total_cost, budget_percentage FROM projection_allocated')) {
        return [[{ id: 11, overhead_type_id: 10, total_cost: 500, budget_percentage: 50 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM overhead WHERE id = ?')) {
        return [[{ id: 20 }]];
      }
      return [[], []];
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = {
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
  };

  try {
    await updateProjectionAllocation({
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        overhead_type_id: 20,
        total_cost: 501,
        changed_by: '4',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.success, false);
  assert.equal(response.body.code, 'OPERATIONAL_COST_REQUEST_REQUIRED');
  assert.match(response.body.message, /change request with a remark/);
  assert.equal(rolledBack, true);
});

test('does not allow reducing a submitted head below the amount already spent', async () => {
  let rolledBack = false;
  const connection = {
    async beginTransaction() {},
    async commit() {
      assert.fail('An allocation below the spent amount must not commit');
    },
    async rollback() {
      rolledBack = true;
    },
    release() {},
    async query(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.startsWith('SELECT id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id, overhead_type_id, total_cost, budget_percentage FROM projection_allocated')) {
        return [[{ id: 11, overhead_type_id: 10, total_cost: 500, budget_percentage: 50 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM actual_budget WHERE po_budget_id = ?')) {
        return [[{ id: 1 }]];
      }
      if (normalizedSql.startsWith('SELECT pb.id FROM po_budget pb JOIN actual_budget ab')) {
        return [[{ id: 5 }]];
      }
      if (normalizedSql.startsWith('SELECT ab.id, ab.overhead_id, ab.splitted_budget')) {
        return [[{
          id: 1,
          overhead_id: 10,
          splitted_budget: 500,
          actual_value: 200,
          history_spent: 0,
        }]];
      }
      return [[], []];
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = {
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
  };

  try {
    await updateProjectionAllocation({
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        overhead_type_id: 10,
        total_cost: 100,
        changed_by: '4',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /already spent \(₹200\.00\)/);
  assert.equal(rolledBack, true);
});

test('requires a remarked Operational Cost request before allocating against reserved funds', async () => {
  let rolledBack = false;
  const connection = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {
      rolledBack = true;
    },
    release() {},
    async query(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      if (normalizedSql.startsWith('SELECT id, total_budget_value, total_po_value FROM po_budget')) {
        return [[{ id: 5, total_budget_value: 1000, total_po_value: 1500 }]];
      }
      if (normalizedSql.startsWith('SELECT id, overhead_type_id, total_cost, budget_percentage FROM projection_allocated')) {
        return [[{ id: 11, overhead_type_id: 10, total_cost: 500, budget_percentage: 50 }]];
      }
      if (normalizedSql.startsWith('SELECT id FROM overhead WHERE id = ?')) {
        return [[{ id: 20 }]];
      }
      return [[], []];
    },
  };
  const originalGetConnection = db.getConnection;
  db.getConnection = async () => connection;
  const response = {
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
  };

  try {
    await updateProjectionAllocation({
      body: {
        site_id: 'SITE-1',
        desc_id: 7,
        projection_id: 1,
        overhead_type_id: 20,
        total_cost: 600,
        changed_by: '4',
      },
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.code, 'OPERATIONAL_COST_REQUEST_REQUIRED');
  assert.match(response.body.message, /change request with a remark/);
  assert.equal(rolledBack, true);
});
