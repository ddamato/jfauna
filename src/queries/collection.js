const { query: q } = require('faunadb');

async function exists() {
  return Boolean(await this._client.query(q.Exists(q.Collection(this._currentCollectionName))));
}

async function create() {
  await this._client.query(q.CreateCollection({ name: this._currentCollectionName }));
}

function ensure() {
  if (this.cache) {
    if (this._collectionCache.has(this._currentCollectionName)) {
      return Promise.resolve(true);
    }
    this._collectionCache.add(this._currentCollectionName);
  }
  return exists.call(this).then((exists) => !exists && create.call(this));
}

module.exports = { ensure };
