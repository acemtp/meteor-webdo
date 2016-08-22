Router.route('/', {
  name: 'home',
  waitOn() {
    return [
      Meteor.subscribe('users'),
      Meteor.subscribe('gifts.tobuy'),
      Meteor.subscribe('gifts.buyed'),
      Meteor.subscribe('gifts.latest'),
    ];
  },
  data() {
    return {
      toBuyGifts: Gifts.find(
        { lockerId: Meteor.userId(), buyerId: null },
        { sort: { priority: -1 } }
      ),
      buyedGifts: Gifts.find(
        { buyerId: Meteor.userId() },
        { sort: { lockerId: 1, priority: -1 } }
      ),
      latestGifts: Gifts.find(
        { ownerId: { $ne: Meteor.userId() } },
        { sort: { createdAt: -1 }, limit: 10 }
      ),
    };
  },
});
