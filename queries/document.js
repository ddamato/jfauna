const { q } = require('./faunadb');

async function create(collection, data) {
  const query = q.Map(
    [].concat(data),
    q.Lambda('data', q.Create(q.Collection(collection), { data: q.Var('data') }))
  );
  await this._client.query(query);
}

async function remove(params) {
  const { index, value, ...pagination } = params;
  let query;

  if (!value) {
    query = q.Map(
      q.Paginate(q.Match(q.Index(index)), pagination),
      q.Lambda(x => q.Delete(x))
    )
  } else {
    query = q.Map(
      q.Paginate(q.Match(q.Index(index), [].concat(value)), pagination),
      q.Lambda(x => q.Delete(x))
    );
  }
  await this._client.query(query);
}

async function get(params) {
  const { index, value, ...pagination } = params;
  let query;

  if (!value) {
    query = q.Map(
      q.Paginate(q.Match(q.Index(index)), pagination),
      q.Lambda(x => q.Get(x))
    )
  } else {
    query = q.Map(
      q.Paginate(q.Match(q.Index(index), [].concat(value)), pagination),
      q.Lambda(x => q.Get(x))
    );
  }
  const response = await this._client.query(query);
  const results = [].concat(response.data).filter(Boolean);

  if (response.before) {
    results.prev = (amt = pagination.size) => get({ ...params, before: response.before, size: amt });
  }

  if (response.after) {
    results.next = (amt = amount) => get({ ...params, after: response.after, amount: amt });
  }

  return results;
}

module.exports = { 
  create,
  get,
  remove,
};
