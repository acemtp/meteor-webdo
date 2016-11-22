Router.route('/', {
  name: 'home',
  waitOn() {
    return [
      subs.subscribe('users'),
      subs.subscribe('gifts.tobuy'),
      subs.subscribe('gifts.buyed'),
      subs.subscribe('gifts.latest'),
    ];
  },
  data() {
    return {
      toBuyGifts: Gifts.find(
        { archived: false, lockerId: Meteor.userId(), buyerId: { $exists: false } },
        { sort: { priority: -1 } }
      ),
      buyedGifts: Gifts.find(
        { archived: false, buyerId: Meteor.userId() },
        { sort: { lockerId: 1, priority: -1 } }
      ),
      latestGifts: Gifts.find(
        { archived: false, ownerId: { $ne: Meteor.userId() } },
        { sort: { createdAt: -1 }, limit: 10 }
      ),
    };
  },
});
