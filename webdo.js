Gifts = new Meteor.Collection("gifts");

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
      if (this.isInsert) {
        return this.userId;
      } else if (this.isUpsert) {
        return { $setOnInsert: this.userId };
      } else {
        this.unset();
      }
    },
    denyUpdate: true
  },
  createdAt: {
    type: Date,
    label: 'Date de création',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
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
  archiverId: {
    type: String,
    optional: true
  }
});

if (Meteor.isClient) {
  T9n.language = "fr";
//  T9n.missingPrefix = ">";
//  T9n.missingPostfix = "<";

  Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/',
    passwordSignupFields: 'USERNAME_ONLY'
  });

  Router.map(function() {
    this.route('home', {path: '/'});
    this.route('createGift');
    this.route('listGift', {
      path: '/listGift/:_id',
      data: function () {
				var showArchived = this.params.query.archived === '1';
        return {
          // used to show link to archived or not archived gifts
          archived: showArchived,
          // to get the right id for pathFor
          _id: this.params._id,
          ownerId: this.params._id,
					gifts: Gifts.find({
            ownerId: this.params._id,
            archiverId: { $exists: showArchived }
          }, {
            sort: { buyerId: 1, lockerId: 1, priority: -1 }
          })
        };
      },
    });

    this.route('displayGift', {
      path: '/displayGift/:_id',
      data: function () {
        return Gifts.findOne(this.params._id);
      },
    });
    this.route('updateGift', {
      path: '/updateGift/:_id',
      data: function () {
        return Gifts.findOne(this.params._id);
      },
    });

    this.route('listUser');
  });

  Router.configure({
    layoutTemplate: "masterLayout"
  });

  Template.home.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

	Template.listGift.helpers({
    listGiftArchived: function () {
      console.log('list gift archive', this);
      return ('listGift', { _id: this.ownerId }, { query: 'archived=1' });
    }
  });

	Template.giftAction.helpers({
    iconAction: function (action) {
      return action + ' fa fa-2x fa-' +action;
    },
    ownerIs: function(currentUser) {
      return currentUser && this.ownerId === currentUser._id;
    }
  });


  Template.giftAction.events({
    'click .archive': function (e) {
      e.preventDefault();
      Gifts.update(this._id, {$set: {archiverId: Meteor.userId()}});
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
      Gifts.update(this._id, {$unset: {archiverId: "", lockerId: "", byerId: ""}});
    }
  });

  AutoForm.hooks({
    insertGiftForm: {
       onSuccess: function(operation, result, template) {
        window.history.back();
      }
    },
    updateGiftForm: {
      onSuccess: function(operation, result, template) {
        window.history.back();
      }
    }
  });

  Template.gift.helpers({
      prio: function() {
      return _.range(this.priority);
    },
    buyedClass: function() {
      return this.buyerId ? 'buyed' : '';
    }
  });

  Template.listUser.helpers({
    users: function() {
      return Meteor.users.find();
    }
  });

  var findUserNameBy = function (field) {
    return function () {
      try {
        return Meteor.users.findOne(this[field]).profile.name;
      } catch (e) {
        console.log('can not find user ', this[field]);
        return 'Utilisateur inconnue';
      }
    };
  };

  Template.displayGift.helpers({
    prio: function() {
      return _.range(this.priority);
    },
    lockerName: findUserNameBy('lockerId'),
    buyerName: findUserNameBy('buyerId')
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

  Template.displayGift.events({
    'click .archive': function (e) {
      e.preventDefault();
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
        {label: "5 étoiles - Doit avoir", value: 5},
        {label: "4 étoiles - Adorerais avoir", value: 4},
        {label: "3 étoiles - Aimerais avoir", value: 3},
        {label: "2 étoiles - J'y pense", value: 2}
    ];
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {

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

  });
}
