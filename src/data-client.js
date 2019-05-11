import DataCache from './data-cache';

class DataClient {
  constructor(initialState = {}, opts = {}) {
    this.cache = opts.cache || new DataCache({initialState});
    this.ssrMode = opts.ssrMode;
    this.ssrPromises = [];
  }

  get(promise) {
    return promise
      .then(data => ({
        data,
        error: null,
      }))
      .catch(error => ({
        data: null,
        error,
      }));
  }
}

export default DataClient;
