const collection = require('./queries/collection');
const document = require('./queries/document');
const index = require('./queries/index');

const FAUNA_PAGINATION_SIZE = 64;

const methods = {

  // Ensures the collection exists, returns the bound methods for the jFauna instance
  init: async function (m) {
    await collection.ensure.call(this);
    return m;
  },

  // Resolves the group of promises before proceeding
  resolve: async function () {
    await Promise.all(Array.from(this._promises));
    this._promises.clear();
  },

  // Inserts record(s) in the current collection
  insert: async function (data) {
    await methods.resolve.call(this);
    await document.create.call(this, data);
  },

  // Gets record(s) in the current collection
  get: function (size = FAUNA_PAGINATION_SIZE) {
    return chain.call(this, document.get, { size });
  },

  // Deletes record(s) in the current collection
  remove: function (size = FAUNA_PAGINATION_SIZE) {
    return chain.call(this, document.remove, { size });
  },

  // Updates record(s) in the current collection
  update: function(data) {
    return chain.call(this, document.update, { data });
  }
};

/**
 * Creates the chainable method
 * 
 * @param {Function} operation - The function to run based on the method selected
 * @param {Object} params - Additional parameters to inform later functions
 * @param {Number} [params.size] - The amount of records to affect with the query
 * @param {Object} [params.data] - Data to update each of the records
 * @returns {Object} - Chainable methods
 */
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