const { q } = require('./faunadb');

async function create(collection, data) {
  const query = q.Map(
    [].concat(data),
    q.Lambda('data', q.Create(q.Collection(collection), { data: q.Var('data') }))
  );
  await this._client.query(query);
}

function remove(params) {
  return commonQuery.call(this, params, x => q.Delete(x))
}

function getOperations({ index, value, compare }) {
  const Match = value
    ? q.Match(q.Index(index), [].concat(value))
    : q.Match(q.Index(index));

  const Difference = q.Difference(
    q.Match(q.Index(compare)),
    q.Match(q.Index(index), [].concat(value))
  );

  return compare ? Difference : Match;
}

function getPagination(params) {
  return {
    size: params.size,
    before: params.before,
    after: params.after
  }
}

async function commonQuery(params, lambda) {
  const query = q.Map(
    q.Paginate(getOperations(params), getPagination(params)),
    q.Lambda(lambda)
  )
  const response = await this._client.query(query);
  return handlePaginatedResponse(response, params, lambda);
}

function get(params) {
  return commonQuery.call(this, params, x => q.Get(x))
}

function handlePaginatedResponse(response, params, lambda) {
  const results = [].concat(response.data).filter(Boolean);
  if (response.before) {
    results.prev = (amt = params.size) => {
      const updated = { ...params, before: response.before, size: amt };
      return commonQuery.call(this, updated, lambda);
    };
  }

  if (response.after) {
    results.next = (amt = params.size) => {
      const updated = { ...params, after: response.after, size: amt };
      return commonQuery.call(this, updated, lambda);
    };
  }
  return results;
}

module.exports = { 
  create,
  get,
  remove,
};
