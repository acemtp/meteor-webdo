import { UserPicture } from './user-avatar';

Template.userUpdate.helpers({
  profile() {
    return profile;
  },
});

Template.user.helpers({
  isOwner() {
    return this._id === Meteor.userId();
  },
  userGiftsArchived() {
    return Router.go('user', { _id: this._id }, { query: 'archived=1' });
  },
  userPicture() {
    return UserPicture;
  },
});

Template.users.helpers({
  users: Meteor.users.find.bind(Meteor.users, {}, { sort: { username: 1 } }),
});
