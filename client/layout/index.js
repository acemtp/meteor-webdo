import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';

import { Accounts } from 'meteor/std:accounts-ui';

import { User, UserUpdate } from '../user/user-avatar';
import { query } from '../../modules/users/client/currentUser';
import Friends from '../../modules/users/client/list';
import { Home } from '../home';
import { NavBar } from '../navbar/navbar';
import { Gift, GiftCreate } from '../gift';
// import styles from '../webdo.scss';
// Template.masterLayout.onCreated(function () {
//   this.autorun(() => {
//     Meteor.user();
//     subs.subscribe('users');
//   });
// });

export const Loading = () => (
  <div>
    <h1>Loading ...</h1>
  </div>
);


const LayoutLoggedInContainer = () => (
  <Switch>
    <Route path="/home" component={Home} />
    <Route path="/users" exact render={() => <Friends />} />
    <Route path="/user/update" render={() => <UserUpdate />} />
    <Route path="/user/:id/gift/create" render={() => <GiftCreate />} />
    <Route path="/user/:id/:archived?" render={data => (console.log({data }), <User userId={data.match.params.id} archived={!!data.match.params.archived}/>)} />
    <Route path="/gift/:id" render={data => <Gift giftId={data.match.params.id} />} />
    <Redirect to="/home" />
  </Switch>
);

const EnsureLoggedInContainer = () => (
  <Query query={query}>
    {({ loading, error }) => {
      if (loading) return <h1>loading...</h1>;
      if (error) {
        const { graphQLErrors } = error;
        if (graphQLErrors.find(err => err.message === 'Unknown User (not logged in)')) {
          console.log('err', { error });
          return <Redirect to="/login" />;
        }
      }
      return <LayoutLoggedInContainer />;
    }}
  </Query>
);


// TODO: manage login logout and see if they are an other way to do it
// class RootApp extends React.Component {
//   componentDidUpdate(prevProps) {
//     const { dispatch, redirectUrl } = this.props;
//     const isLoggingOut = prevProps.isLoggedIn && !this.props.isLoggedIn;
//     const isLoggingIn = !prevProps.isLoggedIn && this.props.isLoggedIn;

//     if (isLoggingIn) {
//       dispatch(navigateTo(redirectUrl));
//     } else if (isLoggingOut) {
//       // do any kind of cleanup or post-logout redirection here
//     }
//   }

//   render() {
//     return this.props.children;
//   }
// }

const App = () => (
  <React.Fragment>
    <NavBar />
    <Route path="/">
      <div>
        <Switch>
          <Route path="/login" component={Accounts.ui.LoginForm} />
          <Route component={EnsureLoggedInContainer} />
        </Switch>
      </div>
    </Route>
  </React.Fragment>
);

export { App };
