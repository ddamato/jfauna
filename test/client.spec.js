const { expect } = require('chai');
const { create, destroy } = require('./utils');
const DATABASE_TEST_NAME = `jfauna-test-${Date.now().toString()}`;

before(async function () {
  try {
    global.FAUNA_DB_CLIENT = await create(DATABASE_TEST_NAME);
  } catch (err) {
    if (err.name === 'ClientClosed') {
      console.error('Did you run "npm run db:start"?');
    }
    console.error(err);
  }
});

after(async function () {
  delete global.FAUNA_DB_CLIENT;
  await destroy(DATABASE_TEST_NAME);
});

it('should create new interactive client', function () {
  expect(global.FAUNA_DB_CLIENT.stream).to.be.a('function');
});

