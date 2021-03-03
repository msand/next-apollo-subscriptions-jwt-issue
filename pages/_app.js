import React from "react";
import Head from "next/head";
import { withRouter } from "next/router";
import { ApolloProvider } from "@apollo/client";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import withApolloClient from "../src/with-apollo-client";
import theme from "../src/theme";

function MyApp(props) {
  const { Component, pageProps, apolloClient } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} apolloClient={apolloClient} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default withRouter(withApolloClient(MyApp));
