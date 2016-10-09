Meteor.publish('users', function publishUsers() {
  const user = Meteor.users.findOne(this.userId, { fields: { 'profile.friends': 1 } });
  if (!user) return this.ready();

  return Meteor.users.find({
    _id: { $in: user.profile.friends || [] },
  }, {
    // fields: { 'profile.avatar': 1, username: 1 },
  });
});

Meteor.publish('user.profile', function publishUserProfile() {
  return Meteor.users.find({ _id: this.userId }, { limit: 1 });
});

const giftFields = { title: 1, image: 1, priority: 1, archived: 1, priority: -1, buyerId: 1, lockerId: 1, priority: -1, title: 1, ownerId: 1 };
Meteor.publish('user.gifts', function pubishUserGifts(userId) {
  check(userId, String);
  const request = { ownerId: userId };
  const options = {
    fields: giftFields,
  };
  if (this.userId === userId) {
    request.suggested = false;
    delete options.fields.lockerId;
    delete options.fields.buyerId;
  }

  return [Gifts.find(request, options), Meteor.users.find({ _id: userId })];
});

Meteor.publish('gifts.tobuy', function publishGiftsTobuy() {
  return Gifts.find({ archived: false, lockerId: this.userId, buyerId: null }, { fields: giftFields });
});

Meteor.publish('gifts.buyed', function publishGiftsBuyed() {
  return Gifts.find({ archived: false, buyerId: this.userId }, { fields: giftFields });
});

Meteor.publish('gifts.latest', function publishGiftsLatest() {
  if (!this.userId) return this.ready();

  const friends = Meteor.users.findOne(this.userId).profile.friends || [];
  const userIdx = friends.indexOf(this.userId);
  if (userIdx >= 0) friends.splice(userIdx, 1);

  const selector = { archived: false, ownerId: { $in: friends } };
  const options = { limit: 10, sort: { createdAt: -1 }, fields: giftFields };

  return Gifts.find(selector, options);
});

Meteor.publish('gift.show', function publishGiftShow(giftId) {
  check(giftId, String);
  const gift = Gifts.findOne({ _id: giftId });
  const options = { limit: 1 };

  if (gift.ownerId === this.userId) {
    if (gift.suggested) return this.ready();
    options.fields = { lockerId: 0, buyerId: 0 };
  }
  return Gifts.find({ _id: giftId }, options);
});

Meteor.publish('gift.comments', function publishGiftComments(giftId) {
  check(giftId, String);
  const isPersonalGift = !!Gifts.findOne({ _id: giftId, ownerId: this.userId });

  const commentSelector = { giftId, removed: false };
  if (isPersonalGift) commentSelector.visible = true;

  return Comments.find(commentSelector);
});
