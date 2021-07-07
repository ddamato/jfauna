const { document, index } = require('../queries/queries');

const methods = {
  init: async function () {
    await methods.resolve(this._promises);
  },

  resolve: async (promises) => {
    await Promise.all(promises);
    promises.length = 0;
  },

  insert: async function () {
    await methods.resolve(this._promises);
    document.create.call(this, this._currentCollectionName, data);
  },

  get: function (size = Infinity) {
    return {
      now: async () => {
        await methods.resolve(this._promises);
        const name = index.name('now', this._currentCollectionName);
        await index.ensure.call(this, this._currentCollectionName, name);
        return await document.get.call(this, { index: name, size });
      },
      where: (field) => {
        const name = index.name('where', this._currentCollectionName, field);
        return {
          equals: async (value) => {
            await methods.resolve(this._promises);
            await index.ensure.call(this, this._currentCollectionName, name, field);
            return await document.get.call(this, { index: name, value, size });
          }
        }
      }
    }
  },

  remove: function (size = Infinity) {
    return {
      now: async () => {
        await methods.resolve(this._promises);
        const name = index.name('now', this._currentCollectionName);
        await index.ensure.call(this, this._currentCollectionName, name);
        return await document.remove.call(this, { index: name, size });
      },
      where: (field) => {
        const name = index.name('where', this._currentCollectionName, field);
        return {
          equals: async (value) => {
            await methods.resolve(this._promises);
            await index.ensure.call(this, this._currentCollectionName, name, field);
            return await document.remove.call(this, { index: name, value, size });
          }
        }
      }
    }
  }
};

module.exports = methods;