const m = require('./methods');

function jFauna(client) {

  this._client = client;
  this._promises = new Set();
  this._collectionCache = new Set();
  this._indexCache = new Set();
  this.cache = true;
  this.raw = false;

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
    this._promises.add(initCollection);
    return Object.assign(initCollection, methods);
  };
  return Object.setPrototypeOf(instance, jFauna.prototype);
}

module.exports = jFauna;