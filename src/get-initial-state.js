import ReactDOMServer from 'react-dom/server';

const getInitialState = async (opts = {}) => {
  const { client, app, render = ReactDOMServer.renderToStaticMarkup } = opts;
  if (!client) {
    throw new Error('A client is required for @iso-react/data getInitialState');
  }

  if (!app) {
    throw new Error('An app is required for @iso-react/data getInitialState');
  }

  if (!client.cache) {
    throw new Error('A cache is required for @iso-react/data clients');
  }

  client.ssrMode = true;
  render(app);

  if (client.ssrPromises.length > 0) {
    await Promise.all(client.ssrPromises);
    client.ssrPromises = [];
    return getInitialState(opts);
  }

  return client.cache.getInitialState();
};

export default getInitialState;
