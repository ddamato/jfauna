const { expect } = require('chai');
const { create, destroy } = require('./utils');
const DATABASE_TEST_NAME = `jfauna-test-${Date.now().toString()}`;
const CLIENT_CLOSED_MESSAGE = 'Did you run "npm run db:start"?\n';

before(function (done) {
  create(DATABASE_TEST_NAME).then(() => done()).catch((err) => {
    if (err.name === 'ClientClosed') {
      console.error(CLIENT_CLOSED_MESSAGE);
    }
    console.error(err);
  })
});

after(function (done) {
  destroy(DATABASE_TEST_NAME).then(() => done());
});

it('should create new interactive client', function () {
  expect(global.FAUNA_DB_CLIENT.stream).to.be.a('function');
});

