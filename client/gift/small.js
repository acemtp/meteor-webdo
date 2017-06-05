Template.giftImage.onRendered(function giftImageOnRendered() {
  this.find('img').onerror = function imgError() {
    this.onerror = null;
    this.src = '/photo/gift-default.png';
  };
});

Template.giftImage.onDestroyed(function giftImageOnDestroy() {
  this.find('img').onerror = null;
});

Template.giftImage.helpers({
  image() {
    return this.image || 'http://webdo.ploki.info/photo/gift-default.png';
  },
});

Template.giftImage.events({
  'error img'(e) {
    const { currentTarget } = e;
    const fallback = '/photo/gift-default.png';
    if (currentTarget.getAttribute('src') !== fallback)
      currentTarget.src = fallback;
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

Template.giftSmall.helpers({
  prio() {
    return _.range(this.priority);
  },
  buyedClass() {
    return this.buyerId ? 'buyed' : '';
  },
  isOwner() {
    return this.ownerId === Meteor.userId();
  },
  userName: findUserNameBy('ownerId'),
  buyerName: findUserNameBy('buyerId'),
  lockerName: findUserNameBy('lockerId'),
});

Template.giftShow.helpers({
  prio() {
    return _.range(this.priority);
  },
  buyedClass() {
    return this.buyerId ? 'buyed' : '';
  },
  userName: findUserNameBy('ownerId'),
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
    // console.log('isEditableBy', edit, this);
    return edit;
  },
  publicComments() {
    return Comments.find({ giftId: this._id, visible: true });
  },
  privateComments() {
    return Comments.find({ giftId: this._id, visible: false });
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