const port  = 8000
const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const app = express()
app.use(cors())
const { addUser,getUser ,getTask,operations} = require('./database/services')
const schema = buildSchema(`
 
type Result {
  statusCode:Int,
  message:String
}

  type Task {
    id:String,
    task:String,
    status:Boolean
  }

  input TaskInput {
    id:String,
    task:String,
    status:Boolean
  }

  input UserInput {
    id:String
    name:String
    email:String
    task:[TaskInput]
 }

  type User {
    id:String
    name:String
    email:String
    task:[Task]
 }

 type UserDetails {
   result : Result
   details : User
 }
 type Query {
  getTask(email:String!): String
}


 input TaskParams {
    email:String
    operation:String
    data:TaskInput
 }

  type Mutation {
    addUser(user: UserInput!): Result
    getUser(email:String): UserDetails
    operations(params:TaskParams):UserDetails
  }
`);

const root = {
    getTask,
    addUser,
    getUser,
    operations,
  };

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Set to true if you want to use GraphiQL for testing
  }));

app.listen(port,()=>{
    console.log(`server started at http://localhost:${port}/graphql`);
})


