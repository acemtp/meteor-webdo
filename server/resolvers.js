import { Resolvers as Auth } from 'meteor/nicolaslopezj:apollo-accounts';
import { Meteor } from 'meteor/meteor';
import { Gifts } from '../collections';

const me = (root, args, context) => {
  // if the user is not logged in throw an error
  if (!context.userId) throw new Error('Unknown User (not logged in)');
  // find the user using the userId from the context
  return Meteor.users.findOne(context.userId);
};

const Query = { me, gift(id) { return Gifts.findOne(id) }, gifts(user) { return Gifts.find({ ownerId: user._id }); } };
const Mutation = { ...Auth() };

export default {
  Query,
  Mutation,
};
