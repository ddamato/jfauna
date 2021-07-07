const { collection, document, index } = require('../queries/queries');

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
    await document.create.call(this, this._currentCollectionName, data);
  },

  get: function (size = Infinity) {
    return chain.call(this, document.get, { size });
  },

  remove: function (size = Infinity) {
    return chain.call(this, document.remove, { size });
  }
};

function chain(operation, { size }) {
  return {
    now: async () => now.call(this, operation, { size }),
    where: (field) => {
      return {
        equals: async (value) => equals.call(this, operation, { size, field, value })
      }
    }
  }
}

async function now(operation, { size }) {
  await methods.resolve.call(this);
  const name = index.name('now', this._currentCollectionName);
  await index.ensure.call(this, this._currentCollectionName, name);
  return await operation.call(this, { index: name, size });
}

async function equals(operation, { field, value, size }) {
  await methods.resolve.call(this);
  const name = index.name('equals', this._currentCollectionName, field);
  await index.ensure.call(this, this._currentCollectionName, name, field);
  return await operation.call(this, { index: name, value, size });
}

module.exports = methods;