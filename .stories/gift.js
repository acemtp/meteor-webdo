import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { storiesOf } from '@storybook/react';

import SmallGift from '/client/gift/small';

const gift = {
  _id: 'fakeGift',
  priority: 5,
  title: 'A fucking incredible gift',
  owner: { username: 'Francois' },
};

storiesOf('SmallGift', module)
  .add('SmallGift', () => (
    <BrowserRouter>
      <SmallGift gift={gift} />
    </BrowserRouter>
  ))
