const jfauna = require('../src/jfauna');
const { expect } = require('chai');
const { create, destroy, collectionExists, getAllDocuments, deleteCollection } = require('./utils');

describe('jfauna', function () {
  let client, dbTestName;

  before(async function () {
    dbTestName = `jfauna-test-${Date.now().toString()}`;
    try {
      client = await create(dbTestName);
    } catch (err) {
      if (err.name === 'ClientClosed') {
        console.error('Did you run "npm run db:start"?');
      }
      console.error(err);
    }
  });

  after(async function () {
    await destroy(dbTestName);
  });

  it('should create new client', function () {
    expect(client.stream).to.be.a('function');
  });

  describe('instantiation', function () {
    it('should create a new instance', function () {
      const $ = new jfauna(client);
      expect($).to.be.instanceOf(jfauna);
      expect($).to.be.a('function');
    });
  });

  describe('collections', function () {
    let $;

    before(function () {
      $ = new jfauna(client);
    });

    after(async function () {
      await deleteCollection('posts');
      delete $;
    });

    it('should have methods returned', async function () {
      const result = await $('posts').resolve();
      expect(result.resolve).to.be.a('function');
      expect(result.insert).to.be.a('function');
      expect(result.get).to.be.a('function');
    });

    it('should create a new collection', async function () {
      await $('posts').resolve();
      expect(await collectionExists('posts')).to.be.true;
    });

    it('should create a single new record', async function () {
      await $('posts').insert({ title: 'My first post' });
      const { data } = await getAllDocuments('posts');
      expect(data.length).to.equal(1);
    });

    it('should get a record by key:value', async function () {
      const { data } = await $('posts').get(1).where('title').equals('My first post');
      expect(data.title).to.equal('My first post');
    });
  });
});

