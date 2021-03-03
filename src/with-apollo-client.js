import React from "react";
import App from "next/app";
import Head from "next/head";
import initApollo from "./init-apollo";
import { getToken } from "./cookieParsers";
import { getDataFromTree } from "@apollo/client/react/ssr";

const WithApolloClient = (PageComponent) => {
  return class Apollo extends React.Component {
    static displayName = "withApollo(App)";
    static async getInitialProps(context) {
      const inAppContext = Boolean(context.ctx);
      const { Component, router } = context;

      const apollo = initApollo(
        {},
        {
          context,
          getToken: () => getToken(context),
        }
      );

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(context, apollo);
      } else if (inAppContext) {
        pageProps = await App.getInitialProps(context, apollo);
      }

      const { res } = context;
      if (!process.browser && res && res.finished) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        return { serverState: {}, ...pageProps };
      }
      if (!process.browser) {
        try {
          // Since AppComponents and PageComponents have different context types
          // we need to modify their props a little.
          let props;
          if (inAppContext) {
            props = { pageProps: { ...pageProps, apolloClient: apollo } };
          } else {
            props = { ...pageProps, apolloClient: apollo };
          }
          // Run all GraphQL queries
          await getDataFromTree(
            <PageComponent
              {...props}
              Component={Component}
              router={router}
              apolloClient={apollo}
            />
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
          console.error("Error while running `getDataFromTree`", error);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apollo.cache.extract();

      return {
        ...pageProps,
        apolloState,
      };
    }

    render() {
      const { apolloClient, apolloState, ...pageProps } = this.props;
      let client;
      if (apolloClient) {
        // Happens on: getDataFromTree & next.js ssr
        client = apolloClient;
      } else {
        // Happens on: next.js csr
        client = initApollo(apolloState, {
          getToken: () => getToken(this.props.ctx),
          context: this.props,
        });
      }
      return <PageComponent {...pageProps} apolloClient={client} />;
    }
  };
};
export default WithApolloClient;
