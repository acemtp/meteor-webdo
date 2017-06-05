import { findUserNameBy } from '/imports/client/lib/user';

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
