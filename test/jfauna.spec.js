const jfauna = require('../src/jfauna');
const { expect } = require('chai');
const { collectionExists, getAllDocuments, deleteCollection } = require('./utils');

describe('jfauna', function () {

  describe('instantiation', function () {
    it('should create a new instance', function () {
      const $ = new jfauna(global.FAUNA_DB_CLIENT);
      expect($).to.be.instanceOf(jfauna);
      expect($).to.be.a('function');
    });
  });

  describe('collections', function () {
    let $;

    before(function () {
      $ = new jfauna(global.FAUNA_DB_CLIENT);
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

    it('should create multiple records', async function () {
      await $('posts').insert([
        { title: 'My second post' },
        { title: 'My third post' }
      ]);
      const { data } = await getAllDocuments('posts');
      expect(data.length).to.equal(3);
    });

    it('should get a record immediately', async function () {
      const [record] = await $('posts').get(1).now();
      expect(record.data.title).to.equal('My first post');
    });

    it('should get a record by key:value', async function () {
      const [record] = await $('posts').get(1).where('title').equals('My second post');
      expect(record.data.title).to.equal('My second post');
    });
  });
});

