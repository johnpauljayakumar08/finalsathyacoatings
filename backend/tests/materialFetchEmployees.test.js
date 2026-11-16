const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const materialController = require('../controllers/materialController');

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

test('resource personnel fetch includes employees and labor and applies parameterized filters', async () => {
  const originalQuery = db.query;
  const calls = [];
  db.query = async (query, params) => {
    calls.push({ query, params });
    return query.includes('FROM employee_master em')
      ? [[{ emp_id: 'EMP-1', personnel_type: 'Site Incharge', created_at: '2026-11-16' }]]
      : [[{ emp_id: '1', personnel_type: 'Labor', created_at: '2026-11-15' }]];
  };
  const response = createResponse();

  try {
    await materialController.fetchEmployees({
      query: {
        designation: 'Site Engineer',
        status: 'Active',
        company: 'Sathya Coatings',
        search: 'Kumar'
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.length, 2);
  assert.equal(calls.length, 2);
  assert.match(calls[0].query, /FROM employee_master em/);
  assert.match(calls[1].query, /FROM labour l/);
  assert.match(calls[0].query, /em\.bank_account_number/);
  assert.match(calls[1].query, /l\.team_name/);
  assert.ok(calls.every(({ query }) => !query.includes('UNION')));
  const expectedParams = [
    'Site Engineer',
    'Active',
    'Sathya Coatings',
    '%Kumar%',
    '%Kumar%',
    '%Kumar%'
  ];
  assert.deepEqual(calls[0].params, expectedParams);
  assert.deepEqual(calls[1].params, expectedParams);
  assert.equal(response.body.data[0].personnel_type, 'Site Incharge');
  assert.equal(response.body.data[1].personnel_type, 'Labor');
});
