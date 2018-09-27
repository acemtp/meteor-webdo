import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import {SchemaTypes as Auth} from 'meteor/nicolaslopezj:apollo-accounts';
// for ddp-apollo
import { setup } from 'meteor/swydo:ddp-apollo';

import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import Mutation from './mutation';

import User from '../modules/users/server/User.graphql';
import Query from './Query.graphql';
import Gift from './Gift.graphql';
import Comment from './Comment.graphql';

import GiftInput from '../modules/gifts/GiftInput.graphql';


const typeDefs = [
  `scalar Date`,
  Auth({
    CreateUserProfileInput: `
      name: String
    `,
  }),
  Gift,
  GiftInput,
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
    if (ast.kind === Kind.INT) return parseInt(ast.value, 10); // ast value is always in string format
    return null;
  },
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

setup({
  schema,
});
