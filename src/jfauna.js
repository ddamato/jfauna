const m = require('./methods');

// Hold reference to the client (logged in)
// Hold reference to the current database, should be changeable
// Hold reference to the current collection, should be changeable

// const $ = jfauna(client); return one instance, $ should be a function
// collection doesn't exist -> create! (no failures!)

// $(collection).get(amount).where(field).is(value);
// $(collection).get().where().isnt();
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
      resolve: m.resolve.bind(this),
      insert: m.insert.bind(this),
      remove: m.remove.bind(this),
      get: m.get.bind(this),
      update: m.update.bind(this),
    };

    this._currentCollectionName = collectionName;
    const initCollection = m.init.call(this, methods);
    this._promises.push(initCollection);
    return Object.assign(initCollection, methods);
  };
  return Object.setPrototypeOf(instance, jFauna.prototype);
}

module.exports = jFauna;