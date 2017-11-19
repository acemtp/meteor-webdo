import React from 'react';

import { Img } from '../user/user-avatar';

// Template.giftImage.onRendered(function giftImageOnRendered() {
//   this.find('img').onerror = function imgError() {
//     this.onerror = null;
//     this.src = '/photo/gift-default.png';
//   };
// });

// Template.giftImage.onDestroyed(function giftImageOnDestroy() {
//   this.find('img').onerror = null;
// });

// Template.giftImage.helpers({
//   image() {
//     return this.image || 'http://webdo.ploki.info/photo/gift-default.png';
//   },
// });

// Template.giftImage.events({
//   'error img'(e) {
//     const { currentTarget } = e;
//     const fallback = '/photo/gift-default.png';
//     if (currentTarget.getAttribute('src') !== fallback)
//       currentTarget.src = fallback;
//   },
// });

export class GiftImage extends React.Component {
  render() {
    return (
      <Img src={`http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${this.props.image}`} alt={this.props.title} fallback="/photo/gift-default.png" />
    );
  }
}
