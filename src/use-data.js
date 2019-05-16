import React from 'react';
import DataContext from './data-context';

const actions = {
  reset: 'reset',
  loading: 'loading',
  cacheHit: 'cacheHit',
  error: 'error',
  data: 'data',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actions.reset:
      return action.initialState;
    case actions.loading:
      if (state.loading) {
        return state;
      }
      return {
        ...state,
        loading: true,
      };
    case actions.cacheHit:
      if (state.cacheHit) {
        return state;
      }
      return {
        ...action.result,
        cacheHit: true,
        loading: false,
      };
    case actions.error:
      return {
        error: action.error,
        cacheHit: false,
        loading: false,
      };
    case actions.data:
      return {
        data: action.data,
        cacheHit: false,
        loading: false,
      };
    default:
      return state;
  }
};

const getKey = (client, hasher, props) => {
  if (typeof hasher === 'function') {
    return hasher(props);
  }
  if (!hasher) {
    return client.cache.getKey(props);
  }
  if (typeof hasher === 'object') {
    return JSON.stringify(hasher);
  }
  return hasher;
};

function useRequest(getPromise, props, opts) {
  const client = React.useContext(DataContext);

  const currentCacheKey = React.useRef(null);
  const isMounted = React.useRef(true);

  const cacheKey = getKey(client, opts.hash, props);

  const initialCacheHit = !opts.skipCache ? client.cache.get(cacheKey) : null;
  const isDeferred = !!opts.defer;

  const initialState = {
    ...initialCacheHit,
    cacheHit: !!initialCacheHit,
    loading: isDeferred ? false : !initialCacheHit,
  };
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    dispatch({type: actions.reset, initialState});
  }, [cacheKey]);

  const fetchData = (fetchProps = props, newOpts = opts) => {
    if (!isMounted.current) return Promise.resolve();
    const revisedCacheKey = getKey(client, newOpts.hash, fetchProps);

    currentCacheKey.current = revisedCacheKey;
    const cacheHit = !newOpts.skipCache
      ? client.cache.get(revisedCacheKey)
      : null;

    if (cacheHit) {
      dispatch({
        type: actions.cacheHit,
        result: cacheHit,
      });
      return Promise.resolve(cacheHit);
    }

    dispatch({
      type: actions.loading,
    });

    return new Promise(resolve => {
      getPromise(...fetchProps)
        .then(data => {
          client.cache.set(revisedCacheKey, {data});
          dispatch({type: actions.data, data});
          resolve(data);
        })
        .catch(error => {
          client.cache.set(revisedCacheKey, {error});
          dispatch({type: actions.error, error});
          resolve(error);
        });
    });
  };
  return [fetchData, state];
}

function useData(getPromise, props = [], opts = {}) {
  console.log(props);
  const actualProps = typeof props === 'object' ? [] : props;
  const actualOpts = typeof props === 'object' ? props : opts;
  if (!getPromise || typeof getPromise !== 'function') {
    throw new Error('A promise getter is required for useData');
  }

  const client = React.useContext(DataContext);

  if (!client) {
    throw new Error(
      'A client is required for useData. Did you forget to set a client on DataContext?'
    );
  }

  if (!client.cache) {
    throw new Error('A data client must have a cache');
  }

  const [ssrRequest, setSsrRequest] = React.useState(false);
  const [fetch, state] = useRequest(getPromise, actualProps, actualOpts);

  if (client.ssrMode && opts.ssr !== false && !ssrRequest) {
    setSsrRequest(true);
    if (!state.data && !state.error) {
      const promise = fetch();
      client.ssrPromises.push(promise);
    }
  }

  const key = getKey(client, opts.hash, props);
  const stringifiedProps = JSON.stringify(props);
  React.useEffect(() => {
    fetch();
  }, [key]);

  return [
    state.data,
    {
      loading: state.loading,
      error: state.error,
    },
    (newProps = props) => {
      fetch(newProps, {
        skipCache: true,
      });
    },
  ];
}

export default useData;
