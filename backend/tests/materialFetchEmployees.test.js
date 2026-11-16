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
  let capturedQuery = '';
  let capturedParams = [];
  db.query = async (query, params) => {
    capturedQuery = query;
    capturedParams = params;
    return [[
      { emp_id: 'EMP-1', personnel_type: 'Site Incharge' },
      { emp_id: '1', personnel_type: 'Labor' }
    ]];
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
  assert.match(capturedQuery, /FROM employee_master em/);
  assert.match(capturedQuery, /UNION ALL/);
  assert.match(capturedQuery, /FROM labour l/);
  assert.deepEqual(capturedParams, [
    'Site Engineer',
    'Active',
    'Sathya Coatings',
    '%Kumar%',
    '%Kumar%',
    '%Kumar%'
  ]);
});
