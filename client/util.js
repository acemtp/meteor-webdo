Template.home.events({
  'click a.logout'() {
    AccountsTemplates.logout();
  },
});

Template.homeGifts.helpers({
  giftToBuy() {
    return !!Gifts.findOne({ lockerId: Meteor.userId(), buyerId: { $exists: false } });
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

Template.users.helpers({
  users: Meteor.users.find.bind(Meteor.users, {}, { sort: { username: 1 } }),
});

Template.giftComment.helpers({
  createdAt() {
    return moment(this.createdAt).fromNow();
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

