import { getAction, doAction } from '/imports/client/lib/action';

Template.giftAction.helpers({
  ownerIs(currentUser) {
    return currentUser && this.ownerId === currentUser._id;
  },
});

Template.giftAction.events({
  'click .archive'(e) {
    e.preventDefault();
    doAction(this._id, { $set: {archived: true} }, { $set: {archived: false} });
  },
  'click .unarchive'(e) {
    e.preventDefault();
    doAction(this._id, { $set: {archived: false} }, { $set: {archived: true} });
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
