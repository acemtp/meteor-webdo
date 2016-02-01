function onStartup() {
  Meteor.publish('users', function publishUsers() {
    const user = Meteor.users.findOne(this.userId, { fields: { 'profile.friends': 1 } });
    if (!user) return this.ready();

    return Meteor.users.find({
      _id: { $in: user.profile.friends || [] },
    });
  });

  Meteor.publish('user.profile', function publishUserProfile() {
    return Meteor.users.find({ _id: this.userId }, { limit: 1 });
  });

  Meteor.publish('user.gifts', function pubishUserGifts(userId) {
    check(userId, String);
    const request = { ownerId: userId };
    const options = {};
    if (this.userId === userId) {
      request.suggested = false;
      options.fields = { lockerId: 0, buyerId: 0 };
    }

    return [Gifts.find(request, options), Meteor.users.find({ _id: userId })];
  });

  Meteor.publish('gifts.tobuy', function publishGiftsTobuy() {
    return Gifts.find({ archived: false, lockerId: this.userId, buyerId: null });
  });

  Meteor.publish('gifts.buyed', function publishGiftsBuyed() {
    return Gifts.find({ archived: false, buyerId: this.userId });
  });

  Meteor.publish('gifts.latest', function publishGiftsLatest() {
    if (!this.userId) return this.ready();

    const friends = Meteor.users.findOne(this.userId).profile.friends || [];
    const userIdx = friends.indexOf(this.userId);
    if (userIdx >= 0) friends.splice(userIdx, 1);

    const selector = { archived: false, ownerId: { $in: friends } };
    const options = { limit: 10, sort: { createdAt: -1 } };

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

  Accounts.onCreateUser((options, user) => {
    const newUser = Object.assign({}, user);

    newUser.profile = options.profile ? options.profile : { name: options.username };

    if (user.services && user.services.google && user.services.google.picture)
      newUser.profile.avatar = user.services.google.picture;
    else
      newUser.profile.avatar = '';

    return newUser;
  });
}

function extractMeta(url) {
  try {
    const result = HTTP.call('GET', url);
    const meta = {};
    let m;

    if (result.statusCode !== 200) {
      console.log('bad status code', result.statusCode);
      return undefined;
    }

    let re = /<meta.*?(?:name|property)=['"](.*?)['"].*?content=['"](.*?)['"].*?>/gmi;
    while ((m = re.exec(result.content)) !== null) {
      if (m.index === re.lastIndex)
        re.lastIndex++;

//        console.log('m', m[1], m[2]);
      if (m[1] === 'description' || m[1] === 'og:description' || m[1] === 'twitter:description') meta.description = m[2];
      if (m[1] === 'og:image' || m[1] === 'twitter:image') meta.image = m[2];
      if (m[1] === 'og:title' || m[1] === 'twitter:title') meta.name = m[2];
    }

    re = /<title>(.*)<\/title>/gmi;
    while ((m = re.exec(result.content)) !== null) {
      if (m.index === re.lastIndex)
        re.lastIndex++;
//        console.log('tit', m[1], m[2]);
      meta.name = m[1];
    }

    console.log('meta', meta);
    return meta;
  } catch (e) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    console.log('err', e);
    return undefined;
  }
}

Meteor.startup(onStartup);

Meteor.methods({
  curExtractMeta(url) {
    check(url, String);
    this.unblock();
    const meta = extractMeta(url);
    if (!meta) throw new Meteor.Error('not meta extracted');
    return meta;
  },
});
