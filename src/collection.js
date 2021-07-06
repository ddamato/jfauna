const { q } = require('./faunadb');

async function exists(name) {
  return await this._client.query(q.Exists(q.Collection(name)));
}

async function create(name) {
  await this._client.query(q.CreateCollection({ name }));
}

module.exports = { 
  exists,
  create,
};
