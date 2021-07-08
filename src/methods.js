const { collection, document, index } = require('./queries/queries');

const FAUNA_PAGINATION_SIZE = 64;

const methods = {
  init: async function (m) {
    await collection.ensure.call(this);
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
    now: async () => {
      await methods.resolve.call(this);
      const ref = await index.name.call(this, 'all');
      return await operation.call(this, { ...params, index: ref })
    },
    where: (field) => {
      return {
        is: async (value) => {
          await methods.resolve.call(this);
          const ref = await index.name.call(this, 'equals', field);
          return await operation.call(this, { ...params, index: ref, field, value })
        },
        isnt: async (value) => {
          await methods.resolve.call(this);
          const [ref, compare] = await Promise.all([
            index.name.call(this, 'equals', field),
            index.name.call(this, 'all')
          ]);
          return await operation.call(this, { ...params, index: ref, field, value, compare })
        }
      }
    }
  }
}

module.exports = methods;