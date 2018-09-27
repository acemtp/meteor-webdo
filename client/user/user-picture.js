import React from 'react';
import { Img } from '/client/util';

function userImage(user) {
  const url = user.profile.avatar || '/photo/anonymous.gif';
  const imageUrl = url.indexOf('http') === 0 ? url : `http://webdo.ploki.info${url}`;
  return imageUrl.indexOf('googleusercontent') === -1 ? `http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${imageUrl}` : imageUrl;
}

const UserPicture = ({ user }) => <Img src={userImage(user)} alt={user.username} fallback="/photo/anonymous.gif" />;
export default UserPicture;
