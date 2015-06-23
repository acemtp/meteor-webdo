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
    max: 5,
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: 'A quel point souhaite tu ce cadeau?'
      }
    }
  },
  ownerId: {
    type: String,
    label: 'Pour',
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: ''
      }
    }
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
    autoValue: function() {
      var value = Meteor.userId() !== this.field('ownerId').value;
      if (this.isInsert)
        return value;
      if (this.isUpsert)
        return { $setOnInsert: value };

      this.unset();
    },
    denyUpdate: true
  }
});
Gifts.allow({
  insert: Meteor.userId,
  update: Meteor.userId
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

Comments.allow({
  insert: Meteor.userId,
  update: Meteor.userId
});

var profile = new SimpleSchema({
  profile: {
    type: Object
  },
  'profile.description': {
    type: String,
    label: 'Votre Description',
    autoform: {
      rows: 10
    },
    max: 1000
  },
  'profile.like': {
    type: String,
    label: "J'aime",
    autoform: {
      rows: 10
    },
    max: 1000
  },
  'profile.dislike': {
    type: String,
    label: "J'aime pas",
    autoform: {
      rows: 10
    },
    max: 1000
  },
  'profile.avatar': {
    type: String,
    label: 'Le lien vers votre photo',
    max: 1000
  }
});

if (Meteor.isClient) {
  T9n.language = 'fr';
//  T9n.missingPrefix = ">";
//  T9n.missingPostfix = "<";

  AutoForm.setDefaultTemplate('materialize');

  Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/',
    passwordSignupFields: 'USERNAME_ONLY'
  });

	Template.homeGifts.helpers({
    giftToBuy: function () {
      return !!Gifts.findOne({ lockerId: Meteor.userId(), buyerId: null });
    },
    giftBuyed: function () {
      return !!Gifts.findOne({ buyerId: Meteor.userId() });
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
      return Router.go('userGifts', { _id: this._id }, { query: 'archived=1' });
    }
  });

	Template.giftAction.helpers({
    ownerIs: function(currentUser) {
      return currentUser && this.ownerId === currentUser._id;
    }
  });


  var doAction = function (_id, _do, undo) {
    Gifts.update(_id, _do, function (error) {
      if (error) return toastr.error(error);
      var toastrEl = toastr.info('Action réussi. <a href="#">Annuler</a>');
      toastrEl.on('click', function () {
        toastrEl.hide();
        console.log('undo action', _id, undo);
        Gifts.update(_id, undo, function (undoError) {
          if (error) return toastr.error(undoError);
          toastr.success('Action Annulée');
        });
      });
    });
  };

  var getAction = function (doc, field) {
    var
    action = {
      go: {
        $set: {}
      },
      undo: {
        $unset: {}
      }
    },
    userId = Meteor.userId();

    action.go.$set[field] = userId;
    action.undo.$unset[field] = '';
    if (doc[field] === userId)
      // swap go <=> undo
      action = { go: action.undo, undo: action.go };

    return action;
  };

  Template.giftAction.events({
    'click .archive': function (e) {
      e.preventDefault();
      doAction(this._id, {$set: {archived: true}}, {$set: {archived: false}});
    },
    'click .unarchive': function (e) {
      e.preventDefault();
      doAction(this._id, {$set: {archived: false}}, {$set: {archived: true}});
    },
    'click .buy': function (e) {
      e.preventDefault();
      var action = getAction(this, 'buyerId');
      doAction(this._id, action.go, action.undo);
    },
    'click .lock': function (e) {
      e.preventDefault();
      var action = getAction(this, 'lockerId');
      doAction(this._id, action.go, action.undo);
    }
  });

  AutoForm.addHooks([ 'insertPublicComment', 'insertPrivateComment' ], {
    onSuccess: function() {
      toastr.success('commentaire ajoute');
    },
    onError: function (formType, error) {
      toastr.error(error);
      console.log('updateUserForm, onError:', formType, error);
    }
  });

  AutoForm.hooks({
    updateUserForm: {
      onSubmit: function (doc, update) {
        Meteor.users.update(this.docId, update);
        this.done();
        return false;
      },
      onSuccess: function() {
        Router.go('user.gifts', { _id: this.docId });
      },
      onError: function (formType, error) {
        console.log('updateUserForm, onError:', formType, error);
      }
    }
  });

  AutoForm.addHooks([ 'insertGiftForm', 'updateGiftForm' ], {
    onSuccess: function() {
      toastr.success('Sauvegarde reussi');
      Router.go('gift.show', { _id: this.docId });
    }
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

  Template.gift.helpers({
    prio: function () {
      return _.range(this.priority);
    },
    buyedClass: function () {
      return this.buyerId ? 'buyed' : '';
    },
    userName: findUserNameBy('ownerId')
  });

  Template.gift.events({
    'error img': function (e) {
      var fallback = '/photo/gift-default.png';
      if (e.currentTarget.getAttribute('src') !== fallback)
        e.currentTarget.src = fallback;
    }
  });

  Template.users.helpers({
    users: Meteor.users.find.bind(Meteor.users, {}, { sort: { username: 1 } })
  });


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
    isEditableBy: function(currentUser) {
      var edit = currentUser && (this.ownerId === currentUser._id || this.suggested);
      console.log('isEditableBy', edit, this);
      return edit;
    },
    publicComments: function () {
      return Comments.find({ visible: true }).fetch();
    },
    privateComments: function () {
      return Comments.find({ visible: false }).fetch();
    }
  });


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
      var action = getAction(this, 'buyerId');
      Gifts.update(this._id, action.go);
    },
    'click .lock': function (e) {
      e.preventDefault();
      var action = getAction(this, 'lockerId');
      Gifts.update(this._id, action.go);

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

  UI.registerHelper('friends', function() {
    var userId = Meteor.userId();
    return Meteor.users
      .find(
        { _id: { '$in': Meteor.user().profile.friends } },
        {fields: { username: 1 } })
      .map(function (user) {
        var value = {
          label: user.username,
          value: user._id
        };

        if (user._id === userId) value.selected = true;
        return value;
      });
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
    if (this.userId === userId)
      request.suggested = false;

    return [ Gifts.find(request), Meteor.users.find({ _id: userId }) ];
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
    return Gifts.find({ _id: giftId }, { limit: 1 });
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

Router.configure({
   loadingTemplate: 'loading'
});
// routes
Router.route('/', {
  name: 'home',
  waitOn: function () {
    return [
      Meteor.subscribe('users'),
      Meteor.subscribe('gifts.tobuy'),
      Meteor.subscribe('gifts.buyed'),
      Meteor.subscribe('gifts.latest')
    ];
  },
  data: function () {
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
      )
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

Router.route('/user/:_id/gift/create', {
  name: 'gift.create',
  waitOn: function () {
    return Meteor.subscribe('users');
  }
});

Router.route('/user/:_id/gifts', {
  name: 'user.gifts',
  waitOn: function () {
    return Meteor.subscribe('user.gifts', this.params._id);
  },
  data: function () {
    var showArchived = this.params.query.archived === '1';
    var sort = this.params._id === Meteor.userId() ? { priority: -1 } : { buyerId: 1, lockerId: 1, priority: -1, title: 1 };
    return {
      // used to show link to archived or not archived gifts
      archived: showArchived,
      // to get the right id for pathFor
      _id: this.params._id,
      user: Meteor.users.findOne(this.params._id),
      gifts: Gifts.find({
        ownerId: this.params._id,
        archived: showArchived
      }, { sort: sort })
    };
  }
});

Router.route('/gift/:_id', {
  name: 'gift.show',
  waitOn: function () {
    return [
      Meteor.subscribe('gift.show', this.params._id),
      Meteor.subscribe('gift.comments', this.params._id),
      Meteor.subscribe('users')
    ];
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
    return [ Meteor.subscribe('gift.show', this.params._id), Meteor.subscribe('users') ];
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
