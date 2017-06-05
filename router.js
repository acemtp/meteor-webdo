
Router.configure({
  loadingTemplate: 'loading',
});

// routes

Router.route('/user/update', {
  name: 'user.update',
  waitOn() {
    return subs.subscribe('user.profile');
  },
  data() {
    return Meteor.users.findOne(Meteor.userId());
  },
});

Router.route('/user/:_id/gift/create', {
  name: 'gift.create',
  waitOn() {
    return subs.subscribe('users');
  },
});

Router.route('/user/:_id/gifts', {
  name: 'user.gifts',
  waitOn() {
    return subs.subscribe('user.gifts', this.params._id);
  },
  data() {
    const archived = this.params.query.archived === '1';
    const ownerId = this.params._id;
    const sort = ownerId === Meteor.userId()
      ? { priority: -1 }
      : { buyerId: 1, lockerId: 1, priority: -1, title: 1 };

    return {
      // used to show link to archived or not archived gifts
      archived,
      // to get the right id for pathFor
      _id: ownerId,
      user: Meteor.users.findOne(ownerId),
      gifts: Gifts.find({ archived, ownerId }, { sort }),
    };
  },
});

Router.route('/gift/:_id', {
  name: 'gift.show',
  waitOn() {
    return [
      subs.subscribe('gift.show', this.params._id),
      subs.subscribe('gift.comments', this.params._id),
    ];
  },
  data() {
    const gift = Gifts.findOne(this.params._id);
    if (gift) gift.comments = Comments.find({giftId: this.params._id});
    return gift;
  },
});

Router.route('/gift/:_id/update', {
  name: 'gift.update',
  waitOn() {
    return subs.subscribe('gift.show', this.params._id);
  },
  data() {
    return Gifts.findOne(this.params._id);
  },
});

Router.route('/users', {
  name: 'users',
});

Router.configure({
  layoutTemplate: 'masterLayout',
});
