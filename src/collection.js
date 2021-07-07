const { q } = require('./faunadb');

async function exists(name) {
  return await this._client.query(q.Exists(q.Collection(name)));
}

async function create(name) {
  await this._client.query(q.CreateCollection({ name }));
}

function ensure(collectionName) {
  return exists.call(this, collectionName).then((exists) => {
    return !exists && create.call(this, collectionName);
  });
}

module.exports = { 
  exists,
  create,
  ensure,
};
