import React from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { subs } from '../../collections';
import { Users, User, UserUpdate } from '../user/user-avatar';
import { withTracker } from 'meteor/react-meteor-data';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import { Home } from '../home';
import { NavBar } from '../navbar/navbar';
import { Gift } from '../gift';
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

const LayoutLoggedOut = () => (
  <div>
    <Route path="/" component={Accounts.ui.LoginForm} />
    <Route path="/signUp" component={Accounts.ui.LoginForm} formState={STATES.SIGN_UP} />
  </div>
);

const LayoutLoggedInContainer = props => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/users" exact render={() => <Users {...props} />} />
    <Route path="/user/update" render={() => <UserUpdate />} />
    <Route path="/user/:id/:archived?" render={data => (console.log({data }),<User userId={data.match.params.id} archived={!!data.match.params.archived}/>)} />
    <Route path="/gift/:id" render={data => <Gift giftId={data.match.params.id} />} />
    <Redirect to="/" />
  </Switch>
);

const LayoutLoggedIn = withRouter(withTracker(() => {
  const handle = subs.subscribe('users');
  return {
    currentUser: Meteor.user(),
    usersLoading: !handle.ready(),
    users: Meteor.users.find().fetch(),
  };
})(LayoutLoggedInContainer));

const LayoutContainer = ({ currentUser }) => (
  <div>
    <NavBar currentUser={currentUser} />
    {currentUser
    ? <LayoutLoggedIn />
    : <LayoutLoggedOut />
    }
  </div>
);
const App = withRouter(withTracker(props => Object.assign({ currentUser: Meteor.user() }, props))(LayoutContainer));
export { App };
