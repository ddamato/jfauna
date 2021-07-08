const { q } = require('./faunadb');

async function exists(name) {
  return await this._client.query(q.Exists(q.Index(name)));
}

function ensure(name, field) {
  if (this.cache) {
    if (this._indexCache.has(name)) {
      return Promise.resolve();
    }
    this._indexCache.add(name);
  }
  return exists.call(this, name).then((exists) => {
    return !exists && create.call(this, name, field);
  });
}

async function create(name, field) {
  let terms;
  if (field) {
    terms = [{ field: ['data', field] }];
  }
  await this._client.query(
    q.CreateIndex({
      name,
      source: q.Collection(this._currentCollectionName),
      terms,
    })
  )
}

function name(...parts) {
  return [this._currentCollectionName].concat(parts).join('-');
}

module.exports = { 
  exists,
  create,
  name,
  ensure,
};