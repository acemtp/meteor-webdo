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
    const url = this.profile.avatar || '/photo/anonymous.gif';
    const imageUrl = url.indexOf('http') === 0? url : `http://webdo.ploki.info${url}`;
    return imageUrl.indexOf('googleusercontent') === -1 ? `http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${imageUrl}` : imageUrl;
  },
});
