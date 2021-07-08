const { Client, query: q } = require('faunadb');

const LOCAL_DEV_SECRET = 'secret';
const config = {
  domain: 'localhost',
  scheme: 'http',
  port:   8443,
  secret: LOCAL_DEV_SECRET,
};

function createLocalClient() {
  return new Client(config);
}

async function create(name) {
  const client = createLocalClient();
  await client.query(q.CreateDatabase({ name }));
  return client;
}

async function destroy(name) {
  const client = createLocalClient();
  await client.query(q.Delete(q.Database(name)));
}

async function collectionExists(name) {
  const client = createLocalClient();
  return Boolean(await client.query(q.Exists(q.Collection(name))));
}

async function getAllCollections() {
  const client = createLocalClient();
  return await client.query(q.Map(
    q.Paginate(q.Collections()),
    q.Lambda(x => q.Get(x))
  ));
}

async function deleteCollection(name) {
  const client = createLocalClient();
  await client.query(q.Delete(q.Collection(name)));
}

async function getAllDocuments(name) {
  const client = createLocalClient();
  return await client.query(q.Map(
    q.Paginate(q.Documents(q.Collection(name))),
    q.Lambda(x => q.Get(x))
  ));
}

module.exports = {
  create,
  destroy,
  collectionExists,
  getAllDocuments,
  deleteCollection,
  getAllCollections
};