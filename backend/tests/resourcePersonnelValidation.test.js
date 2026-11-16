const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../config/db');
const adminController = require('../controllers/adminController');
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

test('labor creation requires a team and guardian details', async () => {
  const originalQuery = db.query;
  let queryCount = 0;
  db.query = async () => {
    queryCount += 1;
    throw new Error('Database should not be queried for invalid labor input');
  };
  const response = createResponse();

  try {
    await adminController.addLabour({
      body: {
        full_name: 'Example Labor',
        date_of_birth: '1990-01-01',
        date_of_joining: '2026-01-01',
        mobile: '9000000000',
        company_email: 'labor@example.invalid',
        current_address: 'Current address',
        permanent_address: 'Permanent address',
        gender_id: 1,
        emp_type_id: 4,
        designation_id: 1,
        status_id: 1,
        approved_salary: '1000',
        created_by: '1',
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /team and father\/guardian details/i);
  assert.equal(queryCount, 0);
});

test('non-labor employee creation requires Aadhaar, ESIC/PF, and bank details', async () => {
  const originalQuery = db.query;
  let queryCount = 0;
  db.query = async () => {
    queryCount += 1;
    throw new Error('Database should not be queried for invalid employee input');
  };
  const response = createResponse();

  try {
    await materialController.addEmployee({
      body: {
        emp_id: 'EMP-TEST-1',
        full_name: 'Example Employee',
        gender_id: 1,
        date_of_birth: '1990-01-01',
        date_of_joining: '2026-01-01',
        status_id: 1,
        dept_id: 1,
        emp_type_id: 5,
        designation_id: 1,
        mobile: '9000000000',
        company_email: 'employee@example.invalid',
        current_address: 'Current address',
        permanent_address: 'Permanent address',
        user_password: 'password123',
        approved_salary: '25000',
        created_by: '1',
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /employee and bank fields/i);
  assert.equal(queryCount, 0);
});

test('employee detail updates reject incomplete bank details before opening a transaction', async () => {
  const originalGetConnection = db.getConnection;
  let connectionCount = 0;
  db.getConnection = async () => {
    connectionCount += 1;
    throw new Error('Database should not be queried for invalid employee input');
  };
  const response = createResponse();

  try {
    await materialController.updateEmployeeDetails({
      params: { empId: 'EMP-TEST-1' },
      body: {
        full_name: 'Example Employee',
        gender_id: 1,
        date_of_birth: '1990-01-01',
        date_of_joining: '2026-01-01',
        status_id: 1,
        emp_type_id: 5,
        designation_id: 1,
        mobile: '9000000000',
        company_email: 'employee@example.invalid',
        current_address: 'Current address',
        permanent_address: 'Permanent address',
        aadhaar_number: '123456789012',
        esic_number: '12345678901234567',
        pf_number: 'PF-123',
        approved_salary: '25000',
      }
    }, response);
  } finally {
    db.getConnection = originalGetConnection;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /bank fields/i);
  assert.equal(connectionCount, 0);
});

test('labor detail updates require team and guardian information', async () => {
  const originalQuery = db.query;
  let queryCount = 0;
  db.query = async () => {
    queryCount += 1;
    throw new Error('Database should not be queried for invalid labor input');
  };
  const response = createResponse();

  try {
    await adminController.updateLabour({
      params: { id: '1' },
      body: {
        full_name: 'Example Labor',
        date_of_birth: '1990-01-01',
        date_of_joining: '2026-01-01',
        mobile: '9000000000',
        company_email: 'labor@example.invalid',
        current_address: 'Current address',
        permanent_address: 'Permanent address',
        gender_id: 1,
        emp_type_id: 4,
        designation_id: 1,
        status_id: 1,
        approved_salary: '1000',
      }
    }, response);
  } finally {
    db.query = originalQuery;
  }

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /team and guardian/i);
  assert.equal(queryCount, 0);
});
