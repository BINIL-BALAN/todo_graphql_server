const port = 8000;
const express = require("express");
const cors = require("cors");
const { ApolloServer, gql } = require("apollo-server-express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
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
// const schema = buildSchema(`
//  scalar Upload
// type Result {
//   statusCode:Int,
//   message:String
// }

//   type Task {
//     id:String,
//     task:String,
//     status:Boolean
//   }

//   input TaskInput {
//     id:String,
//     task:String,
//     status:Boolean
//   }

//   input UserInput {
//     id:String
//     name:String
//     email:String
//     file:Upload
//     task:[TaskInput]
//  }

//   type User {
//     id:String
//     name:String
//     email:String
//     task:[Task]
//  }

//  type UserDetails {
//    result : Result
//    details : User
//  }
//  type Query {
//   getTask(email:String!): String
// }

//  input TaskParams {
//     email:String
//     operation:String
//     data:TaskInput
//  }

//   type Mutation {
//     addUser(user: UserInput!): Result
//     getUser(email:String): UserDetails
//     operations(params:TaskParams):UserDetails
//   }
// `);

const root = {
  // getTask,
  addUser,
  getUser,
  operations,
  getFormData,
};

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
  }
`;
const resolvers = {
  Mutation: {
    ...root,
  },
};
const server = new ApolloServer({ typeDefs, resolvers });
(async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
})();

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}/graphql`);
});
