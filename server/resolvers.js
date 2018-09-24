// TODO:  use merged schema https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#adding-resolvers
import { Resolvers as Auth } from 'meteor/nicolaslopezj:apollo-accounts';
import { Meteor } from 'meteor/meteor';
import { Gifts, profile, Comments } from '../collections';

const currentUser = (root, args, context) => {
  // if the user is not logged in throw an error
  if (!context.userId) throw new Error('Unknown User (not logged in)');
  // find the user using the userId from the context
  return Meteor.users.findOne(context.userId);
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
  userFriends(root) {
    return Meteor
      .users
      .find({ _id: { $in: root.profile.friends }}, { sort: { createdAt: -1 } })
      .fetch();
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
    return Comments.find({ giftId: parent._id, visible: true }).fetch();
  },
  privateComments(parent, data, { userId }) {
    if (userId === parent.ownerId) return [];

    return Comments.find({ giftId: parent._id, visible: false }).fetch();
  },
  canEdit(parent, data, { userId }) {
    return parent.ownerId === userId || parent.suggested;
  },
  isOwner(parent, data, { userId }) {
    return parent.ownerId === userId;
  },
  actions(parent, data, { userId }) {
    const isOwner = Gift.isOwner(parent, data, { userId });
    const actions = isOwner ? ['edit', 'archive'] : ['lock', 'buy'];
    if (data.suggested) actions.push('edit');

    return actions;
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

  createGift(root, { gift }, context) {
    console.log('createGift called', { root, gift, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    const keys = Object.keys(gift);
    // set default value
    gift.createdAt = new Date();
    gift.archived = false;
    gift.suggested = Meteor.userId() !== gift.ownerId;

    Gifts.simpleSchema().validate(gift);
    const giftId = Gifts.insert(gift);

    return Gifts.findOne(giftId);
  },
  updateGift(root, { _id, gift }, context) {
    console.log('updateGift called', { root, gift, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    const keys = Object.keys(gift);

    const update = keys.filter(key => gift[key] !== undefined);
    const remove = keys.filter(key => gift[key] === undefined);

    // It's a good idea to omit empty modifiers.
    const $set = update.reduce((acc, key) => ({ ...acc, [key]: gift[key] }), {});
    const $unset = remove.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
    const modifier = {};
    if (Object.keys($set).length) modifier.$set = $set;
    if (Object.keys($unset).length) modifier.$unset = $unset;

    console.log('before check', { _id, modifier })
    Gifts.simpleSchema().validate(modifier, { modifier: true });
    Gifts.update(_id, modifier);
    console.log('after update', { _id, modifier })

    const newGift = Gifts.findOne(_id);
    console.log('gift update', { gift, newGift, modifier });
    return newGift;
  },
  giftArchive(root, { _id }, context) {
    console.log('giftArchive called', { root, _id, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    Gifts.update(_id, { $set: { archived: true } });
    return Gifts.findOne(_id);
  },
  giftUnArchive(root, { _id }, context) {
    console.log('giftUnArchive called', { root, _id, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    Gifts.update(_id, { $set: { archived: false } });
    return Gifts.findOne(_id);
  },
  giftLock(root, { _id }, context) {
    console.log('giftLock called', { root, _id, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');
    const gift = Gifts.findOne(_id);
    if (context.userId === gift.ownerId) throw new Error(`You can't lock your own gift`);

    const { lockerId } = gift;
    if (!lockerId) {
      Gifts.update(_id, { $set: { lockerId: context.userId } });
      gift.lockerId = context.userId;
    } else if (lockerId === context.userId) {
      Gifts.update(_id, { $unset: { lockerId: 1 } });
      delete gift.lockerId;
    } else throw new Error('Only the one who locked the gift can unlock it.');

    return gift;
  },
  giftBuy(root, { _id }, context) {
    console.log('giftBuy called', { root, _id, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    const gift = Gifts.findOne(_id);
    if (context.userId === gift.ownerId) throw new Error(`You can't buy your own gift`);

    const { buyerId } = gift;
    if (!buyerId) {
      Gifts.update(_id, { $set: { buyerId: context.userId } });
      gift.buyerId = context.userId;
    } else if (buyerId === context.userId) {
      Gifts.update(_id, { $unset: { buyerId: 1 } });
      delete gift.buyerId;
    } else throw new Error('Only the one who buy the gift can un buy it.');

    return gift;
  },
  commentGift(root, { _id, visible, message }, context) {
    console.log('giftBuy called', { root, _id, context });
    if (!context.userId) throw new Error('Unknown User (not logged in)');

    const gift = Gifts.findOne(_id);
    if (!visible && context.userId === gift.ownerId) throw new Error('You cant make a private comment on your comment');

    const user = Meteor.users.findOne(context.userId);
    const commentId = Comments.insert({
      giftId: _id,
      visible,
      message,
      createdAt: new Date(),
      authorId: context.userId,
      author: user.username,
    });

    return Comments.findOne(commentId);
  },
};

export default {
  Query,
  Mutation,
  Gift,
  User,
};
