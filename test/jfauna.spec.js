const jFauna = require('../src/jfauna');
const { expect } = require('chai');
const test = require('./utils');

describe('jfauna', function () {

  describe('instantiation', function () {
    it('should create a new instance', function () {
      
      const $ = new jFauna(global.FAUNA_DB_CLIENT);
      
      expect($).to.be.instanceOf(jFauna);
      expect($).to.be.a('function');
    });
  });

  describe('collections', function () {
    let $;

    before(function () {
      $ = new jFauna(global.FAUNA_DB_CLIENT);
    });

    after(async function () {
      await test.deleteCollection('posts');
      delete $;
    });

    it('should create a new collection', async function () {
      await $('posts');
      
      expect(await test.collectionExists('posts')).to.be.true;
    });

    it('should not create a duplicate collection', async function () {
      await $('posts');
      
      const { data } = await test.getAllCollections();
      expect(data.length).to.equal(1);
    });

    it('should have methods returned', async function () {
      
      const result = await $('posts');
      
      expect(result.resolve).to.be.a('function');
      expect(result.insert).to.be.a('function');
      expect(result.get).to.be.a('function');
    });

    describe('create', function () {
      it('should create a single new record', async function () {
        
        await $('posts').insert({ title: 'My first post' });
        
        const { data } = await test.getAllDocuments('posts');
        expect(data.length).to.equal(1);
      });
  
      it('should create multiple records', async function () {
        
        await $('posts').insert([
          { title: 'My second post' },
          { title: 'My third post' }
        ]);
        
        const { data } = await test.getAllDocuments('posts');
        expect(data.length).to.equal(3);
      });
    });

    describe('get', function () {
      it('should get a record', async function () {
        
        const [record] = await $('posts').get(1).now();
        
        expect(record.data.title).to.equal('My first post');
      });

      it('should get all (default: 64) records', async function () {

        const records = await $('posts').get().now();

        const { data } = await test.getAllDocuments('posts');
        expect(records.length).to.equal(data.length);
      });

      it('should get a record by key:value', async function () {
        
        const [record] = await $('posts').get(1).where('title').equals('My second post');
        
        expect(record.data.title).to.equal('My second post');
      });
    });

    describe('delete', function () {
      it('should delete a record', async function () {
        
        await $('posts').remove(1).now();
        
        const { data } = await test.getAllDocuments('posts');
        expect(data.length).to.equal(2);
        const titles = data.map(({ data }) => data.title);
        expect(titles).to.not.include('My first post');
        expect(titles).to.include('My second post');
      });

      it('should delete a record by key:value', async function () {
        
        await $('posts').remove(1).where('title').equals('My second post');
        
        const { data } = await test.getAllDocuments('posts');
        expect(data.length).to.equal(1);
        const titles = data.map(({ data }) => data.title);
        expect(titles).to.not.include('My second post');
        expect(titles).to.include('My third post');
      });
    });
    
  });
});

