
function onStartup () {
  Meteor.publish('users', function () {
    var userProfile = (Meteor.users.findOne(this.userId, { fields: { 'profile.friends': 1 } }) || {}).profile || {};
    return Meteor.users.find({
      _id: { '$in': userProfile.friends || [] }
    });
  });

  Meteor.publish('user.profile', function () {
    return Meteor.users.find({ _id: this.userId }, { limit: 1 });
  });

  Meteor.publish('user.gifts', function (userId) {
    check(userId, String);
    var request = { ownerId: userId };
    var options = {};
    if (this.userId === userId) {
      request.suggested = false;
      options.fields = { 'lockerId': 0, 'buyerId': 0 };
    }

    return [ Gifts.find(request, options), Meteor.users.find({ _id: userId }) ];
  });

  Meteor.publish('gifts.tobuy', function () {
    return Gifts.find({ archived: false, lockerId: this.userId, buyerId: null });
  });

  Meteor.publish('gifts.buyed', function () {
    return Gifts.find({ archived: false, buyerId: this.userId });
  });

  Meteor.publish('gifts.latest', function () {
    if (!this.userId) return this.ready();

    var friends = Meteor.users.findOne(this.userId).profile.friends || [];
    var userIdx = friends.indexOf(this.userId);
    if (userIdx >= 0)
      friends.splice(userIdx, 1);
    return Gifts.find({ archived: false, ownerId: { $in: friends } }, { limit: 10, sort: { createdAt: -1 } });
  });

  Meteor.publish('gift.show', function (giftId) {
    check(giftId, String);
    var gift = Gifts.findOne({ _id: giftId });
    var options = { limit: 1 };

    if (gift.ownerId === this.userId) {
      if (gift.suggested) return this.ready();
      options.fields = { 'lockerId': 0, 'buyerId': 0 };
    }
    return Gifts.find({ _id: giftId }, options);
  });

  Meteor.publish('gift.comments', function (giftId) {
    check(giftId, String);
    var isPersonalGift = !!Gifts.findOne({ _id: giftId, ownerId: this.userId });

    var commentSelector = { giftId: giftId, removed: false };
    if (isPersonalGift)
      commentSelector.visible = true;

    return Comments.find(commentSelector);
  });

  Accounts.onCreateUser(function(options, user) {

    if (options.profile)
      user.profile = options.profile;
    else
      user.profile = {name: options.username};

    if (user.services && user.services.google && user.services.google.picture)
      user.profile.avatar = user.services.google.picture;
    else
      user.profile.avatar = '';

    return user;
  });

}

function extractMeta (url) {
  try {
    var result = HTTP.call('GET', url);
    var m;
    var meta = {};

    if(result.statusCode !== 200) {
      console.log('bad status code', result.statusCode);
      return undefined;
    }

    var re = /<meta.*?(?:name|property)=['"](.*?)['"].*?content=['"](.*?)['"].*?>/gmi;
    while ((m = re.exec(result.content)) !== null) {
      if (m.index === re.lastIndex)
        re.lastIndex++;

//        console.log('m', m[1], m[2]);
      if(m[1] === 'description' || m[1] === 'og:description' || m[1] === 'twitter:description') meta.description = m[2];
      if(m[1] === 'og:image' || m[1] === 'twitter:image') meta.image = m[2];
      if(m[1] === 'og:title' || m[1] === 'twitter:title') meta.name = m[2];
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
  curExtractMeta: function(url) {
    check(url, String);
    this.unblock();
    var meta = extractMeta(url);
    if(!meta) throw new Meteor.Error('not meta extracted');
    return meta;
  }
});
