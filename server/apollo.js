import cors from 'cors';
import { createApolloServer } from 'meteor/orionsoft:apollo';
import {SchemaTypes as Auth} from 'meteor/nicolaslopezj:apollo-accounts';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import Mutation from './mutation';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

import User from './User.graphql';
import Query from './Query.graphql';
import Gift from './Gift.graphql';
import Comment from './Comment.graphql';

const typeDefs = [
  `scalar Date`,
  Auth({
    CreateUserProfileInput: `
      name: String
    `,
  }),
  Gift,
  Comment,
  User,
  Query,
  Mutation,
];

resolvers.Date = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) {
    return value.getTime(); // value sent to the client
  },
  parseLiteral(ast) {
    if(ast.kind === Kind.INT) {
      return parseInt(ast.value, 10); // ast value is always in string format
    }
    return null;
  },
});

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
