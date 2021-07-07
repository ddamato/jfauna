const { q } = require('./faunadb');

async function exists(name) {
  return await this._client.query(q.Exists(q.Index(name)));
}

function ensure(collectionName, name, field) {
  if (this.cache) {
    if (this._indexCache.has(name)) {
      return Promise.resolve();
    }
    this._indexCache.add(name);
  }
  return exists.call(this, name).then((exists) => {
    return !exists && create.call(this, collectionName, name, field);
  });
}

async function create(collectionName, name, field) {
  let terms;
  if (field) {
    terms = [{ field: ['data', field] }];
  }
  await this._client.query(
    q.CreateIndex({
      name,
      source: q.Collection(collectionName),
      terms,
    })
  )
}

function name(...parts) {
  return parts.join('-');
}

module.exports = { 
  exists,
  create,
  name,
  ensure,
};