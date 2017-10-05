import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { UserAvatar, Img } from '../client/user/user-avatar';
import { Button, Welcome } from '@storybook/react/demo';

const jeanUrl = 'http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/http://webdo.ploki.info/photo/27_1583081014.jpg';
const marionUrl = 'http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/http://webdo.ploki.info/photo/6.jpg';

// import '../webdo.scss'

storiesOf('Welcome', module)
.add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')}/>
));

storiesOf('UserAvatar', module)
.add('Img', () => (
  <Img src={jeanUrl} />
))
.add('Img with fallback', () => (
  <Img src="do not exists url" fallback={marionUrl} />
))
.add('UserAvatar', () => (
  <UserAvatar user={({ _id: '12345', name: 'Jean Claud Duss', profile: { avatar: jeanUrl } })} />
))


storiesOf('Button', module)
.add('with text', () => (
  <Button onClick={action('clicked')}>Hello Button</Button>
))
.add('with some emoji', () => (
  <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
));
