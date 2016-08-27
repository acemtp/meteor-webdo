Template.home.events({
  'click a.logout'() {
    AccountsTemplates.logout();
  },
});

Template.homeGifts.helpers({
  giftToBuy() {
    return !!Gifts.findOne({ lockerId: Meteor.userId(), buyerId: null });
  },
  giftBuyed() {
    return !!Gifts.findOne({ buyerId: Meteor.userId() });
  },
});

Template.userUpdate.helpers({
  profile() {
    return profile;
  },
});

Template.userGifts.helpers({
  isOwner() {
    return this._id === Meteor.userId();
  },
  userGiftsArchived() {
    return Router.go('userGifts', { _id: this._id }, { query: 'archived=1' });
  },
});

Template.giftAction.helpers({
  ownerIs(currentUser) {
    return currentUser && this.ownerId === currentUser._id;
  },
});

Template.giftFieldset.helpers({
  giftOwnerId() {
    return Meteor.userId();
  },
});

const doAction = (_id, _do, undo) => {
  Gifts.update(_id, _do, error => {
    if (error) return toastr.error(error);
    const toastrEl = toastr.info('Action réussi. <a href="#">Annuler</a>');
    toastrEl.on('click', () => {
      toastrEl.hide();
      console.log('undo action', _id, undo);
      Gifts.update(_id, undo, undoError => {
        if (error) return toastr.error(undoError);
        toastr.success('Action Annulée');
      });
    });
  });
};

const getAction = (doc, field) => {
  const action = {
    go: {
      $set: {},
    },
    undo: {
      $unset: {},
    },
  };
  const userId = Meteor.userId();

  action.go.$set[field] = userId;
  action.undo.$unset[field] = '';
  if (doc[field] === userId)
    // swap go <=> undo
    return { go: action.undo, undo: action.go };

  return action;
};

Template.giftAction.events({
  'click .archive'(e) {
    e.preventDefault();
    doAction(this._id, {$set: {archived: true}}, {$set: {archived: false}});
  },
  'click .unarchive'(e) {
    e.preventDefault();
    doAction(this._id, {$set: {archived: false}}, {$set: {archived: true}});
  },
  'click .buy'(e) {
    e.preventDefault();
    const action = getAction(this, 'buyerId');
    doAction(this._id, action.go, action.undo);
  },
  'click .lock'(e) {
    e.preventDefault();
    const action = getAction(this, 'lockerId');
    doAction(this._id, action.go, action.undo);
  },
});

const findUserNameBy = (field) =>
  function findUserNameByField() {
    try {
      return Meteor.users.findOne(this[field]).username;
    } catch (e) {
      console.log('can not find user', this[field], 'with field', field);
      return 'Utilisateur inconnu';
    }
  };

Template.users.helpers({
  users: Meteor.users.find.bind(Meteor.users, {}, { sort: { username: 1 } }),
});

Template.giftComment.helpers({
  createdAt() {
    return moment(this.createdAt).fromNow();
  },
});

Template.giftShow.helpers({
  prio() {
    return _.range(this.priority);
  },
  lockerName: findUserNameBy('lockerId'),
  buyerName: findUserNameBy('buyerId'),
  ownerName: findUserNameBy('ownerId'),
  ownerIs(currentUser) {
    return currentUser && this.ownerId === currentUser._id;
  },
  ownerIsNot(currentUser) {
    return currentUser && this.ownerId !== currentUser._id;
  },
  isEditableBy(currentUser) {
    const edit = currentUser && (this.ownerId === currentUser._id || this.suggested);
    console.log('isEditableBy', edit, this);
    return edit;
  },
  publicComments() {
    return Comments.find({ visible: true }).fetch();
  },
  privateComments() {
    return Comments.find({ visible: false }).fetch();
  },
  createdAt() {
    return moment(this.createdAt).format('LLLL');
  },
});


Template.giftShow.events({
  'click .archive'(e) {
    e.preventDefault();
    Gifts.update(this._id, { $set: { archived: true } });
  },
  'click .unarchive'(e) {
    e.preventDefault();
    Gifts.update(this._id, { $set: { archived: false } });
  },
  'click .buy'(e) {
    e.preventDefault();
    const action = getAction(this, 'buyerId');
    Gifts.update(this._id, action.go);
  },
  'click .lock'(e) {
    e.preventDefault();
    const action = getAction(this, 'lockerId');
    Gifts.update(this._id, action.go);
  },
});

UI.registerHelper('priorities', () => [
  { label: '5 étoiles - Doit avoir', value: 5 },
  { label: '4 étoiles - Adorerais avoir', value: 4 },
  { label: '3 étoiles - Aimerais avoir', value: 3 },
  { label: "2 étoiles - J'y pense", value: 2 },
]);

UI.registerHelper('friends', () => Meteor
  .users
  .find(
    { _id: { $in: Meteor.user().profile.friends } },
    {fields: { username: 1 } })
  .map(user => ({
    label: user.username,
    value: user._id,
  })
));

Template.giftCreate.events({
  'change input[name="link"]'() {
    if ($("input[name='title']").val()) return;
    if ($("textarea[name='detail']").val()) return;
    if ($("input[name='image']").val()) return;

    Meteor.call('curExtractMeta', $("input[name='link']").val(), (error, result) => {
      console.log('extra', error, result);
      if (!error) {
        if (result.name) $("input[name='title']").val(result.name);
        if (result.description) $("textarea[name='detail']").val(result.description);
        if (result.image) $("input[name='image']").val(result.image);
      }
    });
  },
});
