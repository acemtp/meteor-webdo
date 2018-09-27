import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Img } from '/client/util';
// import { UserAvatar } from '/client/user/user-avatar';

require('./gift.js');


storiesOf('Img', module)
  .add('with valid src', () => (
    <Img width={200} src="http://www.ambiance-sticker.com/images/Image/sticker-origami-la-licorne-ambiance-sticker-col-RV-0286.jpg" alt="Une licorne!" fallback="/photo/anonymous.gif" />
  ))
  .add('with invalid src', () => (
    <Img width={200} src="" alt="Y a pas src!" fallback="https://static.esea.net/global/images/teams/143379.1475960501.png" />
  ));

// storiesOf('UserAvatar', module)
//   .add('with a user', () => (
//     <UserAvatar />
//   ))
