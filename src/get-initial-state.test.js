/* eslint-env jest */
import React from 'react';
import fetch from 'isomorphic-fetch';

import Response from '../test/response';
import DataContext from './data-context';
import DataClient from './data-client';
import useFetch from './use-fetch';
import getInitialState from './get-initial-state';

jest.mock('isomorphic-fetch');

const TestComponent = ({ hash }) => {
  const [data, { loading }] = useFetch.text('test-url', {}, { hash: hash });
  if (loading) {
    return 'is-loading';
  }
  return data;
};

const getTestApp = (client, hash) => {
  return (
    <DataContext.Provider value={client}>
      <TestComponent hash={hash} />
    </DataContext.Provider>
  );
};

describe('get-initial-state', () => {
  const testResponse = 'test-result';
  fetch.mockResolvedValue(new Response(testResponse));

  it('should return initial state', async () => {
    const dataHash = 'hash';
    const client = new DataClient();
    const app = getTestApp(client, dataHash);
    const initialState = await getInitialState({ app, client });
    expect(initialState).toHaveProperty(dataHash, { data: testResponse });
  });
});
