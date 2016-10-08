Template.userPicture.onRendered(function userPictureOnRendered() {
  this.find('img').onerror = function imgError() {
    this.onerror = null;
    this.src = '/photo/anonymous.gif';
  };
});

Template.userPicture.onDestroyed(function userPictureOnDestroy() {
  this.find('img').onerror = null;
});

Template.userPicture.helpers({
  image() {
    return this.profile.avatar || '/photo/anonymous.gif';
  },
});
