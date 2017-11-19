import cors from 'cors';
import { createApolloServer } from 'meteor/orionsoft:apollo';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

import User from './User.graphql';
import Query from './Query.graphql';
import Gift from './Gift.graphql';
import {SchemaTypes as Auth} from 'meteor/nicolaslopezj:apollo-accounts';
import Mutation from './mutation';

const typeDefs = [
  Auth({
    CreateUserProfileInput: `
      name: String
    `,
  }),
  Gift,
  User,
  Query,
  Mutation,
];


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

createApolloServer({
  schema,
}, {
  configServer(graphQLServer) {
    graphQLServer.use(cors());
  },
  graphiql: true,
});
