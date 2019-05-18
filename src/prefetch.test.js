/* eslint-env jest */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fetch from 'isomorphic-fetch';

import Response from '../test/response';
import DataContext from './data-context';
import DataClient from './data-client';
import useFetch from './use-fetch';
import prefetch from './prefetch';

jest.mock('isomorphic-fetch');

const TestComponent = () => {
  const [data, { loading }] = useFetch.text('test-url');
  if (loading) {
    return 'is-loading';
  }
  return data;
};

const getTestApp = client => {
  return (
    <DataContext.Provider value={client}>
      <TestComponent />
    </DataContext.Provider>
  );
};

describe('prefetch', () => {
  const testResponse = 'test-result';
  fetch.mockResolvedValue(new Response(testResponse));
  it('should wait for data with suspense client', async () => {
    const client = new DataClient({}, { suspense: true });
    const app = getTestApp(client);
    await prefetch(app);
    const result = ReactDOMServer.renderToString(app);
    expect(result).toEqual(testResponse);
  });

  it('should not wait for data without suspense client', async () => {
    const client = new DataClient();
    const app = getTestApp(client);
    await prefetch(app);
    const result = ReactDOMServer.renderToString(app);
    expect(result).toEqual('is-loading');
  });
});
