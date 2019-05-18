/* eslint-env jest */
import React from 'react';
import { renderHook } from 'react-hooks-testing-library';
import DataClient from './data-client';
import DataContext from './data-context';
import useData from './use-data';

const createWrapper = client => ({ children }) => {
  return <DataContext.Provider value={client}>{children}</DataContext.Provider>;
};

describe('useData', () => {
  it('should add promise to client for ssr', async () => {
    const client = new DataClient({}, { ssrMode: true });
    const wrapper = createWrapper(client);
    renderHook(() => useData(() => Promise.resolve('test')), {
      wrapper
    });

    expect(client.ssrPromises).toHaveLength(1);
  });
});
