/* eslint-env jest */
import React from 'react';
import { renderHook } from 'react-hooks-testing-library';
import fetch from 'isomorphic-fetch';

import Response from '../test/response';
import DataContext from './data-context';
import DataClient from './data-client';
import useFetch from './use-fetch';

jest.mock('isomorphic-fetch');

const createWrapper = client => ({ children }) => {
  return <DataContext.Provider value={client}>{children}</DataContext.Provider>;
};

describe('useFetch.json', () => {
  it('should initially be loading', async () => {
    fetch.mockResolvedValueOnce(new Response({ test: true }));
    const wrapper = createWrapper(new DataClient());
    const { result } = renderHook(() => useFetch.json('test'), { wrapper });
    const [data, meta] = result.current;
    expect(data).not.toBeDefined();
    expect(meta.loading).toBeTruthy();
    expect(meta.error).not.toBeDefined();
  });

  it('should return data when promise resolves', async () => {
    fetch.mockResolvedValueOnce(new Response({ test: true }));
    const wrapper = createWrapper(new DataClient());
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch.json('test'),
      { wrapper }
    );
    await waitForNextUpdate();
    const [data, meta] = result.current;
    expect(meta.error).not.toBeDefined();
    expect(data).toEqual({ test: true });
    expect(meta.loading).toBeFalsy();
  });

  it('should return error when fetch fails', async () => {
    const errorText = 'Internal Server Error';
    fetch.mockResolvedValueOnce(
      new Response(
        { test: true },
        { status: 500, statusText: errorText, ok: false }
      )
    );
    const wrapper = createWrapper(new DataClient());
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch.json('test'),
      { wrapper }
    );
    await waitForNextUpdate();
    const [data, meta] = result.current;
    expect(data).not.toBeDefined();
    expect(meta.loading).toBeFalsy();
    expect(meta.error).toEqual(new Error(errorText));
  });
});

describe('useFetch.text', () => {
  it('should initially be loading', async () => {
    fetch.mockResolvedValue(new Response('test'));
    const wrapper = createWrapper(new DataClient());
    const { result } = renderHook(() => useFetch.text('test'), { wrapper });
    const [data, meta] = result.current;
    expect(data).not.toBeDefined();
    expect(meta.loading).toBeTruthy();
    expect(meta.error).not.toBeDefined();
  });

  it('should return data when promise resolves', async () => {
    fetch.mockResolvedValue(new Response('test'));
    const wrapper = createWrapper(new DataClient());
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch.text('test'),
      { wrapper }
    );
    await waitForNextUpdate();
    const [data, meta] = result.current;
    expect(data).toEqual('test');
    expect(meta.loading).toBeFalsy();
    expect(meta.error).not.toBeDefined();
  });

  it('should return error when fetch fails', async () => {
    const errorText = 'Internal Server Error';
    fetch.mockResolvedValueOnce(
      new Response(
        'test',
        { status: 500, statusText: errorText, ok: false }
      )
    );
    const wrapper = createWrapper(new DataClient());
    const { result, waitForNextUpdate } = renderHook(
      () => useFetch.text('test'),
      { wrapper }
    );
    await waitForNextUpdate();
    const [data, meta] = result.current;
    expect(data).not.toBeDefined();
    expect(meta.loading).toBeFalsy();
    expect(meta.error).toEqual(new Error(errorText));
  });
});
