const { q } = require('./faunadb');

async function create(collection, data) {
  await this._client.query(q.Create(q.Collection(collection), { data }));
}

async function get(index, value) {
  return await this._client.query(q.Get(q.Match(q.Index(index), value)))
}

module.exports = { 
  create,
  get,
};
