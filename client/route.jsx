import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import { App } from './layout';

// import './main.scss';

Meteor.startup(() => render((
<BrowserRouter>
  <div>
    <App />
  </div>
</BrowserRouter>), document.getElementById('app')));
