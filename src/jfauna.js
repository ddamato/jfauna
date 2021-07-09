const { init, assign } = require('./methods');

/**
 * Creates a new instance of jFauna
 * 
 * @param {FaunaDBClient} client - A FaunaDB client prepared to make requests on behalf of the server
 * @returns {Object} - New instance of jFauna
 */
function jFauna(client) {

  // Storing the client on the instance
  this._client = client;

  // Turns on caching for collections/indexes
  this.cache = true;

  // Returns the complete response from the DB, when false we return just the data field.
  this.raw = false;

  // Allows the promise for ensuring the collection exists to resolve later
  this._promises = new Set();

  // The cache for collections/indexes so we don't need to ensure they exist each time
  this._collectionCache = new Set();
  this._indexCache = new Set();

  const instance = (collectionName) => {
    
    // All of the primary methods from the collection
    const methods = assign.call(this);

    // Storing the collection name to be referenced while preparing queries
    this._currentCollectionName = collectionName;

    // Ensure the collection exists before proceeding, return the methods when resolved.
    const initCollection = init.call(this).then(() => methods);

    // Allows this to be awaited later in the chain
    this._promises.add(initCollection);

    // Return the promise overloaded with the methods. The promise resolves to the methods also.
    return Object.assign(initCollection, methods);

  };

  // Allow an instance to be created
  return Object.setPrototypeOf(instance, jFauna.prototype);
}

module.exports = jFauna;