const { query: q } = require('faunadb');

async function create(data) {
  const lambda = (data) => q.Create(q.Collection(this._currentCollectionName), { data });
  const query = q.Map([].concat(data), q.Lambda(lambda));
  await this._client.query(query);
}

function get(params) {
  return commonQuery.call(this, params, (ref) => q.Get(ref));
}

async function update(params) {
  return commonQuery.call(this, params, (ref) => q.Update(ref, { data: params.data }));
}

function remove(params) {
  return commonQuery.call(this, params, (ref) => q.Delete(ref));
}

async function commonQuery(params, lambda) {
  const query = q.Map(
    q.Paginate(getOperations(params), getPagination(params)),
    q.Lambda(lambda)
  )
  const response = await this._client.query(query);
  return handlePaginatedResponse.call(this, response, params, lambda);
}

function getOperations({ index, value, compare }) {
  // TODO: Casefold each value for case-insensitive comparison
  const group = [].concat(value);

  const Match = value
    ? q.Match(q.Index(index), group)
    : q.Match(q.Index(index));

  const Difference = q.Difference(
    q.Match(q.Index(compare)),
    q.Match(q.Index(index), group)
  );

  return compare ? Difference : Match;
}

function getPagination({ size, before, after }) {
  return { size, before, after };
}

function handlePaginatedResponse(response, params, lambda) {
  const results = []
    .concat(response.data)
    .map((result) => !this.raw && result.data ? result.data : result)
    .filter(Boolean);

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
  update,
  remove,
};
