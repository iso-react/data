import fetch from 'isomorphic-fetch';
import useData from './use-data';

const improvedFetch = (url, opts = {}) => {
  return fetch(url, opts).then(response => {
    if (!response.ok || response >= 400) {
      throw new Error(response.statusText);
    }
    return response;
  });
};

const fetchJSON = ({url, ...opts}) => {
  return improvedFetch(url, opts).then(response => response.json());
};

export function useFetchJson(url, opts = {}, dataOpts = {}) {
  return useData(fetchJSON, [{url, ...opts}], dataOpts);
}
