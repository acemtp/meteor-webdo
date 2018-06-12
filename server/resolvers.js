// TODO:  use merged schema https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#adding-resolvers
import { Resolvers as Auth } from 'meteor/nicolaslopezj:apollo-accounts';
import { Meteor } from 'meteor/meteor';
import { Gifts, profile } from '../collections';

const currentUser = (root, args, context) => {
  // if the user is not logged in throw an error
  if (!context.userId) throw new Error('Unknown User (not logged in)');
  // find the user using the userId from the context
  const user = Meteor.users.findOne(context.userId);
  console.log({ user });
  return user;
};

const Query = {
  currentUser,
  user(route, { id }, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    // const $in = [id, context.userId];
    // TODO: filter user result to only friends
    // if (Meteor.users.find({_id: { $in }, 'profile.friends': { $in } }) !== 2) throw new Error('No mutual friendship');

    return Meteor.users.findOne(id);
  },
  gift(root, { id }, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    return Gifts.findOne(id);
  },
  gifts(root, {
    userId, filter, sortBy, limit,
  }, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    const user = Meteor.users.findOne(context.userId);
    if (!user) return [];

    const filters = {
      friends: { ownerId: { $in: user.profile.friends }},
      createdByCurrentUser: { createdBy: context.userId },
      latest: { archived: false },
      ownerId: { ownerId: userId || context.userId },
      lockerId: { lockerId: userId || context.userId },
      buyerId: { buyerId: userId || context.userId },
    };

    const selector = Object.assign({
      $or: [
        filters.friends,
        filters.createdByCurrentUser,
      ],
    }, filters[filter]);

    return Gifts.find(selector, { sort: { [sortBy]: -1 }, limit }).fetch();
  },
  latestGifts(root, args, context) {
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    return Gifts.find(
      { archived: false, ownerId: { $ne: Meteor.userId() } },
      { sort: { createdAt: -1 }, limit: 10 },
    ).map(g => Object.assign({ detail: ''}, g));
  },
};

const User = {
  gifts(root, { archived }, { userId }) {
    const selector = { ownerId: root._id, archived };

    if (root._id === userId) selector.suggested = false;
    return Gifts.find(selector, { sort: { createdAt: -1 } }).fetch();
  },
  userFriends(root) {console.log('userFriends *** *** ***', { root });
    return Meteor.users.find({ _id: { $in: root.profile.friends }}, { sort: { createdAt: -1 } }).fetch();
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
  canEdit(parent, data, { userId }) {
    return parent.ownerId === userId || parent.suggested;
  },
  isOwner(parent, data, { userId }) {
    return parent.ownerId === userId;
  },
};

const Mutation = {
  ...Auth(),
  updateUserProfile(root, { userProfile }, context) {
    console.log('updateUserProfile called', { root, userProfile, context});
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    const keys = Object.keys(userProfile);

    const update = keys.filter(key => userProfile[key] !== undefined);
    const remove = keys.filter(key => userProfile[key] === undefined);

    // It's a good idea to omit empty modifiers.
    const $set = update.reduce((acc, key) => ({...acc, [`profile.${key}`]: userProfile[key]}), {});
    const $unset = remove.reduce((acc, key) => ({...acc, [`profile.${key}`]: ''}), {});

    const modifier = {};
    if (Object.keys($set).length) modifier.$set = $set;
    if (Object.keys($unset).length) modifier.$unset = $unset;

    profile.validate(modifier, { modifier: true });
    Meteor.users.update(context.userId, modifier);
    return Meteor.users.findOne(context.userId);
  },
};

export default {
  Query,
  Mutation,
  Gift,
  User,
};
