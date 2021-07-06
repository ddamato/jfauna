const { q } = require('./faunadb');
const collection = require('./collection');
const index = require('./index');
const document = require('./document');

// Hold reference to the client (logged in)
// Hold reference to the current database, should be changeable
// Hold reference to the current collection, should be changeable

// const $ = jfauna(secret, database); return one instance, $ should be a function
// $.create('database_name') returns the key to creating a database
// collection doesn't exist -> create! (no failures!)

// $(collection).get().where().eq();
// $(collection).delete().where().lt();
// $(collection).update().where().gt().or.lt() (same as upsert)
// $(collection).insert();

function jfauna(client) {
  this._client = client;
  this._promises = [];
  const instance = (collectionName) => {
    const collectionPromise = collection.exists.call(this, collectionName).then((exists) => {
      return !exists && collection.create.call(this, collectionName);
    });
    this._promises.push(collectionPromise);
    const methods = {
      resolve: async () => {
        await Promise.all(this._promises);
        this._promises.length = 0;
        return methods;
      },
      insert: async (data) => {
        methods.resolve();
        // TODO: do this as array (q.Map)
        await document.create.call(this, collectionName, data);
      },
      get: (amount) => {
        // TODO: do this as array (q.Map)
        console.log('AMOUNT:', amount);
        return {
          where: (field) => {
            const name = index.generateName(collectionName, field);
            return {
              equals: async (value) => {
                methods.resolve();
                await index.exists.call(this, name).then((exists) => {
                  return !exists && index.create.call(this, collectionName, name, field);
                });
                return await document.get.call(this, name, value);
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