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
    return this.image || '/photo/gift-default.png';
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
});
