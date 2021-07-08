const { collection, document, index } = require('./queries/queries');

const FAUNA_PAGINATION_SIZE = 64;

const methods = {
  init: async function (m) {
    await collection.ensure.call(this, this._currentCollectionName);
    return m;
  },

  resolve: async function () {
    await Promise.all(this._promises);
    this._promises.length = 0;
  },

  insert: async function (data) {
    await methods.resolve.call(this);
    await document.create.call(this, data);
  },

  get: function (size = FAUNA_PAGINATION_SIZE) {
    return chain.call(this, document.get, { size });
  },

  remove: function (size = FAUNA_PAGINATION_SIZE) {
    return chain.call(this, document.remove, { size });
  },

  update: function(data) {
    return chain.call(this, document.update, { data });
  }
};

function chain(operation, params) {
  return {
    now: async () => now.call(this, operation, { ...params }),
    where: (field) => {
      return {
        is: async (value) => equals.call(this, operation, { ...params, field, value }),
        isnt: async (value) => equals.call(this, operation, { ...params, field, value, compare: index.name.call(this, 'all') })
      }
    }
  }
}

async function now(operation, params) {
  await methods.resolve.call(this);
  const name = index.name.call(this, 'all');
  await index.ensure.call(this, name);
  return await operation.call(this, { ...params, index: name });
}

async function equals(operation, params) {
  await methods.resolve.call(this);
  const name = index.name.call(this, 'equals', params.field);
  await index.ensure.call(this, name, params.field);

  if (params.compare) {
    await index.ensure.call(this, params.compare);
  }

  return await operation.call(this, { ...params, index: name });
}

module.exports = methods;