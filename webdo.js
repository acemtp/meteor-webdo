Gifts = new Mongo.Collection('gifts');
Comments = new Mongo.Collection('comments');

Gifts.attachSchema({
  title: {
    type: String,
    label: 'Titre',
    max: 149
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
  detail: {
    type: String,
    label: 'Détail',
    max: 4096
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


  Template.home.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log('You pressed the button');
    }
  });

	Template.userGifts.helpers({
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
    'click .buy': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {buyerId: Meteor.userId()}});
    },
    'click .lock': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {lockerId: Meteor.userId()}});
    },
    'click .unarchive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$unset: {archived: false, lockerId: '', buyerId: ''}});
    }
  });

  AutoForm.hooks({
    insertGiftForm: {
      onSuccess: function() {
        window.history.back();
      }
    },
    updateGiftForm: {
      onSuccess: function() {
        window.history.back();
      }
    },
    insertPrivateComment: {
      before: {
        insert: function (doc) {
          console.log('before insert', arguments);
          return doc;
        }
      },
      after: {
        insert: function (doc) {
          console.log('After insert', arguments);
          return doc;
        }
      },
      onSubmit: function() {
        console.log('on submit', arguments);
        this.done();
      }
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
      // TODO rework archiverId => archived
      var update = getUpdateObjet(this, 'archiverId');
      Gifts.update(this._id, update);
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
}
function onStartup () {
  Meteor.publish('users', Meteor.users.find.bind(Meteor.users));

  Meteor.publish('user.gifts', function (userId) {
    check(userId, String);
    return Gifts.find({ ownerId: userId });
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

}
if (Meteor.isServer)
  Meteor.startup(onStartup);


// routes
Router.route('/', {name: 'home'});
Router.route('/user/:_id/gift/create', {name: 'gift.create'});
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
