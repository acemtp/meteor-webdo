import { subs } from '../../collections';

Template.masterLayout.onCreated(function () {
  this.autorun(() => {
    Meteor.user();
    subs.subscribe('users');
  });
});
