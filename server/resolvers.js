// TODO  use merged schema https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#adding-resolvers
import { Resolvers as Auth } from 'meteor/nicolaslopezj:apollo-accounts';
import { Meteor } from 'meteor/meteor';
import { Gifts } from '../collections';

const me = (root, args, context) => {
  // if the user is not logged in throw an error
  if (!context.userId) throw new Error('Unknown User (not logged in)');
  // find the user using the userId from the context
  return Meteor.users.findOne(context.userId);
};

const Query = {
  me,
  gift(root, { id }, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    return Gifts.findOne(id);
  },
  gifts(root, { userId, filter, sortBy, limit }, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    const user = Meteor.users.findOne(context.userId);
    if (!user) return [];

    const filters = {
      friends: { ownerId: { $in: user.profile.friends }},
      ownerId: { ownerId: userId || context.userId },
      createdByCurrentUser: { createdBy: context.userId },
      latest: { archived: false },
    };

    const selector = Object.assign({ $or: [filters.friends, filters.createdByCurrentUser] }, filters[filter]);

    return Gifts.find(selector, { sort: { [sortBy]: -1 }, limit }).fetch();
  },
  latestGifts(root, args, context) {console.log('args', arguments);
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    return Gifts.find(
      { archived: false, ownerId: { $ne: Meteor.userId() } },
      { sort: { createdAt: -1 }, limit: 10 }).map(g => Object.assign({ detail: ''}, g));
  },
};
const Gift = {
  owner(parent) {
    return Meteor.users.findOne(parent.ownerId);
  },
  buyer(parent) {
    return parent.buyerId ? Meteor.users.findOne(parent.buyerId) : null;
  },
  locker(parent) {
    return parent.lockerId ? Meteor.users.findOne(parent.lockerId) : null;
  },
  comments(parent) {
    return Gifts.find({ giftId: parent._id }).fetch();
  },
};

const Mutation = { ...Auth() };

export default {
  Query,
  Mutation,
  Gift,
};
