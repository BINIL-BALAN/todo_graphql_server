const {IP,port} = require('./constant')
const express = require("express");
const cors = require("cors");
const { createServer } = require('http');
const { ApolloServer, gql } = require("apollo-server-express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute,subscribe } = require('graphql');
const { PubSub } = require("graphql-subscriptions");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const pubSub = new PubSub()
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const {
  addUser,
  getUser,
  getTask,
  operations,
  getFormData,
} = require("./database/services");
app.use("/assets", express.static("assets"));


;

//   app.use('/graphql', graphqlHTTP({
//     schema: schema,
//     rootValue: root,
//     graphiql: true, // Set to true if you want to use GraphiQL for testing
//   }));

const typeDefs = gql`
  scalar Upload
  type Result {
    statusCode: Int
    message: String
  }

  type Task {
    id: String
    task: String
    status: Boolean
  }

  input TaskInput {
    id: String
    task: String
    status: Boolean
  }

  input UserInput {
    id: String
    name: String
    email: String
    file: Upload
    task: [TaskInput]
  }

  type User {
    id: String
    name: String
    email: String
    image: String
    task: [Task]
  }

  type UserDetails {
    result: Result
    details: User
  }
  type Query {
    getTask(email: String!): String
  }

  input TaskParams {
    email: String
    operation: String
    data: TaskInput
  }

  type Mutation {
    addUser(user: UserInput!): Result
    getUser(email: String): UserDetails
    operations(params: TaskParams): UserDetails
    getFormData(formData:Upload):String
    test(msg:String!):String
  }

  type Subscription {
    updations:UserDetails!
  }
`;

const root = {
  // getTask,
  addUser,
  getUser,
  operations:(_,params)=>{
    const updatedData = operations(null,params)
    pubSub.publish('UPDATIONS', { updations:updatedData });
    return updatedData
  },
  getFormData,
  test:(_,{msg})=>{
    pubSub.publish('UPDATIONS', { taskAdded:{} });
    return msg
  }
}

const resolvers = {
  Mutation: {
    ...root,
  },
  Subscription: {
    updations: {
      subscribe:(parent, args,) => { return pubSub.asyncIterator('UPDATIONS')},
    },
  },

};
const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema,context: { pubSub } });

// (async () => {
//   await server.start();
//   server.applyMiddleware({ app, path: "/graphql" });
// })();

// app.listen(port, () => {
//   console.log(`server started at http://localhost:${port}/graphql`);
// });

(async () => {
  await server.start();

  server.applyMiddleware({ app, path: "/graphql" });

  const httpServer = createServer(app);
  httpServer.listen(port, IP, () => {
    console.log(`Server started at http://${IP}:${port}/graphql`);

    // Create the WebSocket server
    new SubscriptionServer({
      execute,
      subscribe,
      schema: schema,
    }, {
      server: httpServer,
      path: "/subscriptions",
    });
  });
})();
