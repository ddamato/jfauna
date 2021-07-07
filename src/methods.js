const { document, index } = require('../queries/queries');

const methods = {
  resolve: async function () {
    await Promise.all(this._promises);
    this._promises.length = 0;
  },

  insert: async function (data) {
    methods.resolve.call(this);
    document.create.call(this, this._currentCollectionName, data);
  },

  get: function (size = Infinity) {
    return {
      now: async () => {
        methods.resolve.call(this);
        const name = index.name('now', this._currentCollectionName);
        await index.ensure.call(this, this._currentCollectionName, name);
        return await document.get.call(this, { index: name, size });
      },
      where: (field) => {
        const name = index.name('where', this._currentCollectionName, field);
        return {
          equals: async (value) => {
            methods.resolve.call(this);
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
        methods.resolve.call(this);
        const name = index.name('now', this._currentCollectionName);
        await index.ensure.call(this, this._currentCollectionName, name);
        return await document.remove.call(this, { index: name, size });
      },
      where: (field) => {
        const name = index.name('where', this._currentCollectionName, field);
        return {
          equals: async (value) => {
            methods.resolve.call(this);
            await index.ensure.call(this, this._currentCollectionName, name, field);
            return await document.remove.call(this, { index: name, value, size });
          }
        }
      }
    }
  }
};

module.exports = methods;