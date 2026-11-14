const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const authorizeReports = require('../middleware/authorizeReports');

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

test('reports allow admin and managing director roles', () => {
  for (const role of ['admin', 'MD', 'managing_director']) {
    const req = {
      headers: {
        authorization: `Bearer ${jwt.sign({ role }, process.env.JWT_SECRET || 'your_jwt_secret_key')}`
      }
    };
    const response = createResponse();
    let nextCalled = false;

    authorizeReports(req, response, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, `${role} should be authorized`);
    assert.equal(req.reportUser.role, role);
  }
});

test('reports reject other roles', () => {
  const req = {
    headers: {
      authorization: `Bearer ${jwt.sign({ role: 'site_incharge' }, process.env.JWT_SECRET || 'your_jwt_secret_key')}`
    }
  };
  const response = createResponse();
  let nextCalled = false;

  authorizeReports(req, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 403);
});

test('reports require a valid bearer token', () => {
  const response = createResponse();
  authorizeReports({ headers: {} }, response, () => assert.fail('Missing token must not pass'));
  assert.equal(response.statusCode, 401);
});
