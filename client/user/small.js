Template.userSmall.onRendered(function userSmallOnRendered() {
  this.find('img').onerror = function imgError() {
    this.onerror = null;
    this.src = '/photo/anonymous.gif';
  };
});

Template.userSmall.onDestroyed(function userSmallOnDestroy() {
  this.find('img').onerror = null;
});

Template.userSmall.helpers({
  image() {
    return this.profile.avatar || '/photo/anonymous.gif';
  },
});
