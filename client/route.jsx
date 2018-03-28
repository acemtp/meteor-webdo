import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route } from 'react-router-dom';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import { App } from './layout';
import client from './apollo';
// import './main.scss';

Meteor.startup(() => render(
<ApolloProvider client={client}>
  <BrowserRouter>
    <div>
      <App />
    </div>
  </BrowserRouter>
</ApolloProvider>, document.getElementById('app')));
