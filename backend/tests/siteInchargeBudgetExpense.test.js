const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const {
  saveBudgetExpense,
  updateBudgetExpenseEntry,
  adminUpdateBudgetExpenseEntry
} = require('../controllers/SiteInchargeController');

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

const createConnection = query => ({
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => assert.fail('A valid budget expense should commit'),
  release: () => {},
  query
});

const installDatabaseMocks = connection => {
  const originalQuery = db.query;
  const originalGetConnection = db.getConnection;
  db.query = async sql => {
    if (sql.includes('SELECT user_id FROM users')) return [[{ user_id: 7 }]];
    assert.fail(`Unexpected database query: ${sql}`);
  };
  db.getConnection = async () => connection;
  return () => {
    db.query = originalQuery;
    db.getConnection = originalGetConnection;
  };
};

test('saving an over-budget expense preserves the allocation and reports the overage', async () => {
  const statements = [];
  let actualBudgetUpdate;
  const connection = createConnection(async (sql, params = []) => {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    statements.push(normalizedSql);

    if (normalizedSql.startsWith('SELECT id, splitted_budget FROM actual_budget')) {
      return [[{ id: 15, splitted_budget: 100 }]];
    }
    if (normalizedSql.startsWith('SELECT COALESCE(SUM(actual_value), 0) AS actual_value')) {
      return [[{ actual_value: 80 }]];
    }
    if (normalizedSql.startsWith('INSERT INTO actual_budget_history')) {
      return [{ insertId: 41 }, []];
    }
    if (normalizedSql.startsWith('UPDATE actual_budget SET')) {
      actualBudgetUpdate = { sql: normalizedSql, params };
      return [{ affectedRows: 1 }, []];
    }
    assert.fail(`Unexpected connection query: ${normalizedSql}`);
  });
  const restoreDatabase = installDatabaseMocks(connection);
  const response = createResponse();

  try {
    await saveBudgetExpense({
      body: {
        actual_budget_id: 15,
        entry_date: '2026-11-13',
        item_description: 'Local travel',
        uom: 'Nos',
        quantity: 1,
        rate: 30,
        actual_value: 30,
        created_by: 7
      }
    }, response);
  } finally {
    restoreDatabase();
  }

  assert.equal(response.statusCode, 201);
  assert.match(response.body.message, /over budget by ₹10\.00/);
  assert.equal(response.body.data.adjusted_amount, 0);
  assert.deepEqual(response.body.data.allocation_changes, []);
  assert.deepEqual(actualBudgetUpdate.params, [110, -10, 7, 15]);
  assert.equal(statements.some(sql => sql.includes('actual_budget_adjustment_history')), false);
  assert.equal(statements.some(sql => /UPDATE actual_budget SET .*splitted_budget/.test(sql)), false);
});

test('editing an over-budget expense preserves the allocation and reports the overage', async () => {
  const statements = [];
  let actualBudgetUpdate;
  const connection = createConnection(async (sql, params = []) => {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    statements.push(normalizedSql);

    if (normalizedSql.startsWith('SELECT id, actual_budget_id, entry_date, actual_value')) {
      return [[{
        id: 41,
        actual_budget_id: 15,
        entry_date: '2026-11-13',
        actual_value: 20,
        remarks: null,
        item_description: 'Local travel',
        uom: 'Nos',
        quantity: 1,
        rate: 20,
        created_at: new Date(),
        updated_at: null,
        created_by: 7,
        updated_by: null
      }]];
    }
    if (normalizedSql.startsWith('SELECT id, splitted_budget FROM actual_budget')) {
      return [[{ id: 15, splitted_budget: 100 }]];
    }
    if (normalizedSql.startsWith('SELECT COALESCE(SUM(actual_value), 0) AS total_expense')) {
      return [[{ total_expense: 80 }]];
    }
    if (normalizedSql.startsWith('INSERT INTO actual_budget_edit_history')) {
      return [{ insertId: 51 }, []];
    }
    if (normalizedSql.startsWith('UPDATE actual_budget_history')) {
      return [{ affectedRows: 1 }, []];
    }
    if (normalizedSql.startsWith('UPDATE actual_budget SET')) {
      actualBudgetUpdate = { sql: normalizedSql, params };
      return [{ affectedRows: 1 }, []];
    }
    assert.fail(`Unexpected connection query: ${normalizedSql}`);
  });
  const restoreDatabase = installDatabaseMocks(connection);
  const response = createResponse();

  try {
    await updateBudgetExpenseEntry({
      body: {
        entry_id: 41,
        item_description: 'Local travel',
        uom: 'Nos',
        quantity: 1,
        rate: 30,
        actual_value: 30,
        updated_by: 7
      }
    }, response);
  } finally {
    restoreDatabase();
  }

  assert.equal(response.statusCode, 200);
  assert.match(response.body.message, /over budget by ₹10\.00/);
  assert.equal(response.body.data.adjusted_amount, 0);
  assert.deepEqual(response.body.data.allocation_changes, []);
  assert.deepEqual(actualBudgetUpdate.params, [110, -10, 7, 15]);
  assert.equal(statements.some(sql => sql.includes('actual_budget_adjustment_history')), false);
  assert.equal(statements.some(sql => /UPDATE actual_budget SET .*splitted_budget/.test(sql)), false);
});

test('admin edits can exceed the allocation without changing it', async () => {
  const statements = [];
  let actualBudgetUpdate;
  const originalQuery = db.query;
  db.query = async (sql, params = []) => {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    statements.push(normalizedSql);

    if (normalizedSql.startsWith('SELECT user_id FROM users')) return [[{ user_id: 7 }]];
    if (normalizedSql.startsWith('SELECT id, actual_budget_id, entry_date, actual_value')) {
      return [[{
        id: 41,
        actual_budget_id: 15,
        entry_date: '2026-11-13',
        actual_value: 20,
        remarks: null,
        item_description: 'Local travel',
        uom: 'Nos',
        quantity: 1,
        rate: 20,
        created_at: new Date(),
        updated_at: null,
        created_by: 7,
        updated_by: null
      }]];
    }
    if (normalizedSql.startsWith('SELECT splitted_budget FROM actual_budget')) {
      return [[{ splitted_budget: 100 }]];
    }
    if (normalizedSql.startsWith('SELECT COALESCE(SUM(actual_value), 0) AS total_expense')) {
      return [[{ total_expense: 80 }]];
    }
    if (normalizedSql.startsWith('INSERT INTO actual_budget_edit_history')) {
      return [{ insertId: 51 }, []];
    }
    if (normalizedSql.startsWith('UPDATE actual_budget_history')) {
      return [{ affectedRows: 1 }, []];
    }
    if (normalizedSql.startsWith('SELECT COALESCE(SUM(actual_value), 0) AS new_total')) {
      return [[{ new_total: 110 }]];
    }
    if (normalizedSql.startsWith('UPDATE actual_budget SET')) {
      actualBudgetUpdate = { sql: normalizedSql, params };
      return [{ affectedRows: 1 }, []];
    }
    assert.fail(`Unexpected database query: ${normalizedSql}`);
  };
  const response = createResponse();

  try {
    await adminUpdateBudgetExpenseEntry({
      body: {
        entry_id: 41,
        item_description: 'Local travel',
        uom: 'Nos',
        quantity: 1,
        rate: 30,
        actual_value: 30,
        updated_by: 7
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.match(response.body.message, /over budget by ₹10\.00/);
  assert.deepEqual(actualBudgetUpdate.params, [110, -10, 7, 15]);
  assert.equal(statements.some(sql => /UPDATE actual_budget SET .*splitted_budget/.test(sql)), false);
});
