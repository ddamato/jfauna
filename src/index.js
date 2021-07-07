const { q } = require('./faunadb');

async function exists(name) {
  return await this._client.query(q.Exists(q.Index(name)));
}

async function create(collectionName, name, field) {
  await this._client.query(
    q.CreateIndex({
      name,
      source: q.Collection(collectionName),
      terms: [{ field: ['data', field] }],
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
};