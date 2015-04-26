Gifts = new Mongo.Collection('gifts');
Comments = new Mongo.Collection('comments');

Gifts.attachSchema({
  title: {
    type: String,
    label: 'Titre',
    max: 149
  },
  detail: {
    type: String,
    label: 'Détail',
    max: 4096
  },
  link: {
    type: String,
    label: 'Lien',
    max: 1024,
    optional: true
  },
  image: {
    type: String,
    label: 'Image',
    max: 1024,
    optional: true
  },
  priority: {
    type: Number,
    label: 'Priorité',
    min: 1,
    max: 5
  },
  ownerId: {
    type: String,
    label: 'Owner Id',
    autoValue: function () {
      if (this.isInsert)
        return this.userId;
      if (this.isUpsert)
        return { $setOnInsert: this.userId };

      this.unset();
    },
    denyUpdate: true
  },
  createdAt: {
    type: Date,
    label: 'Date de création',
    autoValue: function() {
      if (this.isInsert)
        return new Date();
      if (this.isUpsert)
        return { $setOnInsert: new Date() };

      this.unset();
    },
    denyUpdate: true
  },
  lockerId: {
    type: String,
    optional: true
  },
  buyerId: {
    type: String,
    optional: true
  },
  archived: {
    type: Boolean,
    defaultValue: false
  },
  suggested: {
    type: Boolean,
    defaultValue: false
  }
});

Comments.attachSchema({
  giftId: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  message: {
    type: String,
    max: 1024,
    autoform: {
      afFieldInput: {
        rows: 4
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert)
        return new Date();
      if (this.isUpsert)
        return { $setOnInsert: new Date() };

      this.unset();
    },
    denyUpdate: true
  },
  author: {
    type: String,
    autoValue: function () {
      var username = Meteor.users.findOne(this.userId).username;
      if (this.isInsert)
        return username;
      if (this.isUpsert)
        return { $setOnInsert: username };

      this.unset();
    },
    denyUpdate: true
  },
  authorId: {
    type: String,
    autoValue: function () {
      if (this.isInsert)
        return this.userId;
      if (this.isUpsert)
        return { $setOnInsert: this.userId };

      this.unset();
    },
    denyUpdate: true
  },
  visible: {
    type: Boolean,
    autoform: {
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  removed: {
    type: Boolean,
    defaultValue: false
  }
});

var profile = new SimpleSchema({
  username: {
    type: String,
    label: "Non d'utilisateur",
    max: 50
  },
  description: {
    type: String,
    label: "J'aime",
    max: 1000
  },
  liked: {
    type: String,
    label: "J'aime",
    max: 1000
  },
  disliked: {
    type: String,
    label: "J'aime pas",
    max: 1000
  }
});

if (Meteor.isClient) {
  T9n.language = 'fr';
//  T9n.missingPrefix = ">";
//  T9n.missingPostfix = "<";

  Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/',
    passwordSignupFields: 'USERNAME_ONLY'
  });

	Template.homeGifts.helpers({
    noGiftToBuy: function () {
      return !Gifts.find({ lockerId: Meteor.userId() }).count();
    },
    noGiftBuyed: function () {
      return !Gifts.find({ buyerId: Meteor.userId() }).count();
    }
  });

	Template.userUpdate.helpers({
    profile: function () {
      return profile;
    }
  });

	Template.userGifts.helpers({
    isOwner: function () {
      return this._id === Meteor.userId();
    },
    userGiftsArchived: function () {
      return Router.go('userGifts', { _id: this.ownerId }, { query: 'archived=1' });
    }
  });

	Template.giftAction.helpers({
    ownerIs: function(currentUser) {
      return currentUser && this.ownerId === currentUser._id;
    }
  });

  Template.giftAction.events({
    'click .archive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {archived: true}});
    },
    'click .unarchive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {archived: false}});
    },
    'click .buy': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {buyerId: Meteor.userId()}});
    },
    'click .lock': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {lockerId: Meteor.userId()}});
    }
  });

  AutoForm.addHooks([ 'insertGiftForm', 'updateGiftForm' ], {
    onSuccess: function() {
      Router.go('gift.show', { _id: this.docId });
    }
  });

  Template.gift.helpers({
    prio: function () {
      return _.range(this.priority);
    },
    buyedClass: function () {
      return this.buyerId ? 'buyed' : '';
    }
  });

  Template.users.helpers({
    users: Meteor.users.find.bind(Meteor.users)
  });

  var findUserNameBy = function (field) {
    return function () {
      try {
        return Meteor.users.findOne(this[field]).username;
      } catch (e) {
        console.log('can not find user', this[field], 'with field', field);
        return 'Utilisateur inconnu';
      }
    };
  };

  Template.giftShow.helpers({
    prio: function() {
      return _.range(this.priority);
    },
    lockerName: findUserNameBy('lockerId'),
    buyerName: findUserNameBy('buyerId'),
    ownerName: findUserNameBy('ownerId'),
    ownerIs: function(currentUser) {
      return currentUser && this.ownerId === currentUser._id;
    },
    ownerIsNot: function(currentUser) {
      return currentUser && this.ownerId !== currentUser._id;
    },
    publicComments: function () {
      return Comments.find({ visible: true }).fetch();
    },
    privateComments: function () {
      return Comments.find({ visible: false }).fetch();
    }
  });

  var getUpdateObjet = function (doc, field) {
    var
    update = {},
    userId = Meteor.userId(),
    value = {},
    action;

    if (doc[field] === userId) {
      action = '$unset';
      value[field] = '';
    } else {
      action = '$set';
      value[field] = userId;
    }
    update[action] = value;
    return update;
  };

  Template.giftShow.events({
    'click .archive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, { '$set': { archived: true } });
    },
    'click .unarchive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, { '$set': { archived: false } });
    },
    'click .buy': function (e) {
      e.preventDefault();
      var update = getUpdateObjet(this, 'buyerId');
      Gifts.update(this._id, update);
    },
    'click .lock': function (e) {
      e.preventDefault();
      var update = getUpdateObjet(this, 'lockerId');
      Gifts.update(this._id, update);
    }
  });

  UI.registerHelper('priorities', function() {
    return [
      { label: '5 étoiles - Doit avoir', value: 5 },
      { label: '4 étoiles - Adorerais avoir', value: 4 },
      { label: '3 étoiles - Aimerais avoir', value: 3 },
      { label: "2 étoiles - J'y pense", value: 2 }
    ];
  });

  Template.giftCreate.events({
    'change input[name="link"]': function () {
      if($("input[name='title']").val()) return;
      if($("textarea[name='detail']").val()) return;
      if($("input[name='image']").val()) return;

      Meteor.call('curExtractMeta', $("input[name='link']").val(), function (error, result) {
        console.log('extra', error, result);
        if(!error) {
          if(result.name) $("input[name='title']").val(result.name);
          if(result.description) $("textarea[name='detail']").val(result.description);
          if(result.image) $("input[name='image']").val(result.image);
        }
      });
    }
  });
}
function onStartup () {
  Meteor.publish('users', Meteor.users.find.bind(Meteor.users));

  Meteor.publish('user.profile', function () {
    return Meteor.users.find({ _id: this.userId }, { limit: 1 });
  });

  Meteor.publish('user.gifts', function (userId) {
    check(userId, String);
    var request = { ownerId: userId };
    if (this.userId === userId)
      request.suggested = false;

    return [ Gifts.find(request), Meteor.users.find({ _id: userId }) ];
  });

  Meteor.publish('home.gifts', function () {
    return Gifts.find({
      archived: false,
      $or: [
        { lockerId: this.userId },
        { buyerId: this.userId }
      ]
    });
  });

  Meteor.publish('gift.show', function (giftId) {
    check(giftId, String);
    var gift = Gifts.findOne(giftId);
    // array of user ids needed to show the gift
    var userIds = [ gift.ownerId, gift.buyerId, gift.lockerId, gift.ownerId ];
    var isPersonalGift = gift.ownerId === this.userId;

    var commentSelector = {giftId: giftId, removed: false};
    if (isPersonalGift)
      commentSelector.visible = true;

    return [
      Meteor.users.find({ _id: {$in: userIds}}),
      Gifts.find({ _id: giftId }),
      Comments.find(commentSelector)
    ];
  });

  Accounts.onCreateUser(function(options, user) {

    if (options.profile)
      user.profile = options.profile;
    else
      user.profile = {name: options.username};

    if (user.services && user.services.google && user.services.google.picture)
      user.profile.picture = user.services.google.picture;
    else
      user.profile.picture = '';

    return user;
  });

  // migrate user information
  Meteor.users.find({
    'profile.liked': { '$exists': false },
    'profile.original.aime': { '$exists': true }
  }).forEach(function (user) {
    Meteor.users.update(user._id, {
      '$set': { 'profile.liked': user.profile.original.aime }
    }, function (err) {
      if (err)
        console.log('like, can not update user ', user.username);
      else
        console.log('like, user ', user.username, ' updated');
    });
  });
  Meteor.users.find({
    'profile.disliked': { '$exists': false },
    'profile.original.aimepas': { '$exists': true }
  }).forEach(function (user) {
    Meteor.users.update(user._id, {
      '$set': { 'profile.disliked': user.profile.original.aimepas }
    }, function (err) {
      if (err)
        console.log('disliked, can not update user ', user.username);
      else
        console.log('disliked user ', user.username, ' updated');
    });
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

if (Meteor.isServer) {
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

}


// routes
Router.route('/', {
  name: 'home',
  waitOn: function () {
    return Meteor.subscribe('home.gifts');
  },
  data: function () {
    return {
      toBuyGifts: Gifts.find({ buyerId: null }, {
        sort: { priority: -1 }
      }),
      buyedGifts: Gifts.find({ buyerId: { $not: null }}, {
        sort: { lockerId: 1, priority: -1 }
      })
    };
  }
});

Router.route('/user/update', {
  name: 'user.update',
  waitOn: function () {
    return Meteor.subscribe('user.profile');
  },
  data: function () {
    return Meteor.users.findOne(Meteor.userId());
  }
});
Router.route('/user/:_id/gift/create', { name: 'gift.create' });

Router.route('/user/:_id/gifts', {
  name: 'user.gifts',
  waitOn: function () {
    return Meteor.subscribe('user.gifts', this.params._id);
  },
  data: function () {
    var showArchived = this.params.query.archived === '1';
    return {
      // used to show link to archived or not archived gifts
      archived: showArchived,
      // to get the right id for pathFor
      _id: this.params._id,
      // TODO remove ownerId from tempalte and use _id
      ownerId: this.params._id,
      profile: Meteor.users.findOne(this.params._id).profile,
      gifts: Gifts.find({
        ownerId: this.params._id,
        archived: showArchived
      }, {
        sort: { buyerId: 1, lockerId: 1, priority: -1 }
      })
    };
  }
});

Router.route('/gift/:_id', {
  name: 'gift.show',
  waitOn: function () {
    return Meteor.subscribe('gift.show', this.params._id);
  },
  data: function () {
    var gift = Gifts.findOne(this.params._id);
    if (gift)
      gift.comments = Comments.find({giftId: this.params._id});

    return gift;
  }
});
Router.route('/gift/:_id/update', {
  name: 'gift.update',
  waitOn: function () {
    return Meteor.subscribe('gift.show', this.params._id);
  },
  data: function () {
    return Gifts.findOne(this.params._id);
  }
});

Router.route('/users', {
  waitOn: function () {
    return Meteor.subscribe('users');
  }
});

Router.configure({
  layoutTemplate: 'masterLayout'
});
