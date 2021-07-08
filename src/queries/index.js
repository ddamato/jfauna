const { query: q } = require('faunadb');

async function exists(name) {
  return Boolean(await this._client.query(q.Exists(q.Index(name))));
}

function ensure(name, field) {
  if (this.cache) {
    if (this._indexCache.has(name)) {
      return Promise.resolve(true);
    }
    this._indexCache.add(name);
  }
  return exists.call(this, name).then((exists) => !exists && create.call(this, name, field));
}

async function create(name, field) {
  let terms;
  if (field) {
    terms = [{ field: ['data', field] }];
  }
  const source = q.Collection(this._currentCollectionName);
  const query = q.CreateIndex({ name, source, terms });
  await this._client.query(query);
}

async function name(type, field) {
  const reference = [type, this._currentCollectionName, field].filter(Boolean).join('-');
  await ensure.call(this, reference, field);
  return reference;
}

module.exports = { name };