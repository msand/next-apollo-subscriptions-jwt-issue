import fetch from "isomorphic-unfetch";
import cookie from "cookie";
import debounce from "debounce";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import redirect from "./redirect";

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
const isBrowser = process.browser;
if (!isBrowser) {
  global.fetch = fetch;
}

const origin = "http://localhost:3000";

function create(initialState, { getToken, context }) {
  const httpLink = new HttpLink({
    uri: `${origin}/graphql`, // Server URL (must be absolute)
    credentials: "same-origin",
  });

  const token = getToken && getToken();
  const wsClient =
    isBrowser &&
    token &&
    new SubscriptionClient(`${origin.replace(/^(http)/, "ws")}/graphql`, {
      reconnect: true,
      connectionParams: () => {
        const token = getToken && getToken();
        if (!token) {
          return {};
        }
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    });
  const wsLink = wsClient && new WebSocketLink(wsClient);

  const middlewareLink = setContext((req) => {
    const token = getToken && getToken();
    if (req.operationName === "authenticate" || !token) {
      return {};
    }
    return {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
  });

  const redirectToSignIn = debounce(
    () => redirect(context, `/signin`),
    300,
    true
  );

  function logout() {
    if (isBrowser) {
      apolloClient = null;
      client.clearStore().catch(console.log);
      wsClient && wsClient.close(true, true);
      document.cookie = cookie.serialize("token", "", {
        maxAge: -1, // Expire the cookie immediately
      });
    }
    const pathname =
      (context && (context.router || context.ctx || context).pathname) ||
      (isBrowser && window.location.pathname);
    if (pathname !== "/signin") {
      redirectToSignIn();
    }
  }

  const errorLink = onError(function ({
    response,
    networkError,
    graphQLErrors,
  }) {
    console.log("Unhandled error", arguments);
  });

  const cache = new InMemoryCache({
    addTypename: true,
  });

  // The split function takes three parameters:
  //
  // * A function that's called for each operation to execute
  // * The Link to use for an operation if the function returns a "truthy" value
  // * The Link to use for an operation if the function returns a "falsy" value
  const splitLink =
    wsLink &&
    split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );

  const client = new ApolloClient({
    link: from([errorLink, middlewareLink, splitLink || httpLink]),
    cache: cache.restore(initialState || {}),
    ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
    connectToDevTools: isBrowser,
  });
  client.logout = logout;

  return client;
}

export default function initApollo(initialState, options) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!isBrowser) {
    return create(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, options);
  }

  return apolloClient;
}
