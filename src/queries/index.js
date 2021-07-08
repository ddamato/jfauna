const { query: q } = require('faunadb');

async function create(name, field) {
  const source = q.Collection(this._currentCollectionName);
  const query = q.CreateIndex({ name, source, terms: terms(field) });
  await this._client.query(query);
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

async function name(type, field) {
  const reference = [type, this._currentCollectionName, field].filter(Boolean).join('-');
  await ensure.call(this, reference, field);
  return reference;
}

async function exists(name) {
  return Boolean(await this._client.query(q.Exists(q.Index(name))));
}

function terms(field) {
  return field ? [{ field: ['data', field] }] : null;
}

module.exports = { name };