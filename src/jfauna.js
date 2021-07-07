const collection = require('./collection');
const index = require('./index');
const document = require('./document');

// Hold reference to the client (logged in)
// Hold reference to the current database, should be changeable
// Hold reference to the current collection, should be changeable

// const $ = jfauna(client); return one instance, $ should be a function
// collection doesn't exist -> create! (no failures!)

// $(collection).get().where().equals();
// $(collection).get().between().and();
// $(collection).delete();
// $(collection).update();
// $(collection).insert();

function jFauna(client) {
  this._client = client;
  this._promises = [];
  this._collectionCache = new Set();
  this._indexCache = new Set();
  this.cache = true;
  const instance = (collectionName) => {
    const methods = {
      resolve: async () => {
        await Promise.all(this._promises);
        this._promises.length = 0;
        return methods;
      },
      insert: async (data) => {
        methods.resolve();
        await document.create.call(this, collectionName, data);
      },
      delete: (size = Infinity) => {
        return {
          now: async () => {
            methods.resolve();
            const name = index.name('now', collectionName);
            await index.ensure.call(this, collectionName, name);
            return await document.del.call(this, { index: name, size });
          },
          where: (field) => {
            const name = index.name('where', collectionName, field);
            return {
              equals: async (value) => {
                methods.resolve();
                await index.ensure.call(this, collectionName, name, field);
                return await document.del.call(this, { index: name, value, size });
              }
            }
          }
        }
      },
      get: (size = Infinity) => {
        return {
          now: async () => {
            methods.resolve();
            const name = index.name('now', collectionName);
            await index.ensure.call(this, collectionName, name);
            return await document.get.call(this, { index: name, size });
          },
          where: (field) => {
            const name = index.name('where', collectionName, field);
            return {
              equals: async (value) => {
                methods.resolve();
                await index.ensure.call(this, collectionName, name, field);
                return await document.get.call(this, { index: name, value, size });
              }
            }
          }
        }
      }
    };

    const ensureCollectionPromise = collection.ensure.call(this, collectionName).then(() => methods);
    this._promises.push(ensureCollectionPromise);
    return Object.assign(ensureCollectionPromise, methods);
  };
  return Object.setPrototypeOf(instance, jFauna.prototype);
}

module.exports = jFauna;