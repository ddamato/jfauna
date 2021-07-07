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

function jfauna(client) {
  this._client = client;
  this._promises = [];
  const instance = (collectionName) => {
    this._promises.push(collection.ensure.call(this, collectionName));
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
      get: (size = Infinity) => {
        return {
          now: async () => {
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

    return methods;
  };
  return Object.setPrototypeOf(instance, jfauna.prototype);
}

module.exports = jfauna;