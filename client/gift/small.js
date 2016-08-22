Template.gift.onRendered(function giftOnRendered() {
  this.find('img').onerror = function imgError() {
    this.onerror = null;
    this.src = '/photo/gift-default.png';
  };
});

Template.gift.onDestroyed(function giftOnDestroy() {
  this.find('img').onerror = null;
});

Template.gift.helpers({
  image() {
    return this.image || '/photo/gift-default.png';
  },
});
