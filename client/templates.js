Template.home.events({
  'click a.logout': function () {
    AccountsTemplates.logout();
  },
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

Template.giftFieldset.helpers({
  giftOwnerId: function () {
    return Meteor.userId();
  },
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

Template.giftComment.helpers({
  createdAt: function() {
    return moment(this.createdAt).fromNow();
  },
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
  },
  createdAt: function() {
    return moment(this.createdAt).format('LLLL');
  },
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
  return Meteor.users
    .find(
      { _id: { '$in': Meteor.user().profile.friends } },
      {fields: { username: 1 } })
    .map(function (user) {
      var value = {
        label: user.username,
        value: user._id
      };

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
