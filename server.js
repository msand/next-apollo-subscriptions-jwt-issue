const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const apolloServer = require("./apollo");
const apolloHandler = apolloServer.createHandler({ path: "/graphql" });

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname === "/graphql") {
      await apolloHandler(req, res);
    } else {
      await handle(req, res, parsedUrl);
    }
  });

  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
    console.log(
      `🚀 Server ready at http://localhost:3000${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:3000${apolloServer.subscriptionsPath}`
    );
  });
});
