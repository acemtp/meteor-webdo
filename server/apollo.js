import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
// for ddp-apollo
import { setup } from 'meteor/swydo:ddp-apollo';
import { loadSchema } from 'graphql-loader';
import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts';

import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import Mutation from './mutation';

import User from '../modules/users/server/User.graphql';
import Query from './Query.graphql';
import Gift from './Gift.graphql';
import Comment from './Comment.graphql';

import GiftInput from '../modules/gifts/GiftInput.graphql';

// Load all accounts related resolvers and type definitions into graphql-loader
initAccounts({
  loginWithFacebook: false,
  loginWithGoogle: false,
  loginWithLinkedIn: false,
  loginWithPassword: true,
});

const typeDefs = [
  'scalar Date',
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
    // ast value is always in string format
    if (ast.kind === Kind.INT) return parseInt(ast.value, 10);
    return null;
  },
});

// Load all your resolvers and type definitions into graphql-loader
loadSchema({ typeDefs, resolvers });

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

setup({
  schema,
});
