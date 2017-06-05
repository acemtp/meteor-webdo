import { getAction } from '/imports/client/lib/action.js';
import { findUserNameBy } from '/imports/client/lib/user';

Template.giftShow.helpers({
  prio() {
    return _.range(this.priority);
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