import fetch from 'isomorphic-fetch';
import useData from './use-data';

const fetchResponse = (opts = {}) => {
  return fetch(opts.url, opts).then(response => {
    if (!response.ok || response >= 400) {
      throw new Error(response.statusText);
    }
    return response;
  });
};

const useFetch = {
  json: function (url, opts, dataOpts) {
    return useData(
      (...args) => fetchResponse(...args).then(resp => resp.json()),
      [{ url, ...opts }],
      dataOpts
    );
  },
  text: function (url, opts, dataOpts) {
    return useData(
      (...args) => fetchResponse(...args).then(resp => resp.text()),
      [{ url, ...opts }],
      dataOpts
    );
  }
};

export default useFetch;
