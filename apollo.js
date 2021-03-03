const { ApolloServer } = require("apollo-server-micro");

const UserAPI = require("./data/datasource");
const typeDefs = require("./data/schema");
const resolvers = require("./data/resolvers");

const apolloServer = new ApolloServer({
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      console.log("Connected!");
    },
    onDisconnect: (webSocket, context) => {
      console.log("Disconnected!");
    },
  },
  typeDefs,
  resolvers,
  dataSources: () => ({ usersAPI: new UserAPI() }),
});

module.exports = apolloServer;
