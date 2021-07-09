const { Client, query: q } = require('faunadb');

const LOCAL_DEV_SECRET = 'secret';
const config = {
  domain: 'localhost',
  scheme: 'http',
  port:   8443,
  secret: LOCAL_DEV_SECRET,
};

function create(name) {
  global.FAUNA_DB_CLIENT = new Client(config);
  return global.FAUNA_DB_CLIENT.query(q.CreateDatabase({ name }));
}

function destroy(name) {
  return global.FAUNA_DB_CLIENT.query(q.Delete(q.Database(name)))
    .then(() => delete global.FAUNA_DB_CLIENT);
}

function isCollection(name) {
  return global.FAUNA_DB_CLIENT.query(q.Exists(q.Collection(name)));
}

function getAllDocuments(name) {
  return global.FAUNA_DB_CLIENT.query(q.Map(
    q.Paginate(q.Documents(q.Collection(name))),
    q.Lambda(x => q.Get(x))
  ));
}

function getAllCollections() {
  return global.FAUNA_DB_CLIENT.query(q.Map(
    q.Paginate(q.Collections()),
    q.Lambda(x => q.Get(x))
  ));
}

function getTitlesFromData(d) {
  return d.map(({ data }) => data.title);
}

function deleteCollection(name) {
  return global.FAUNA_DB_CLIENT.query(q.Delete(q.Collection(name)));
}

module.exports = {
  create,
  destroy,
  isCollection,
  getAllDocuments,
  getAllCollections,
  getTitlesFromData,
  deleteCollection
};