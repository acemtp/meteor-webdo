import React from 'react';
import { Route, Switch, Link, Redirect, withRouter } from 'react-router-dom';
import { subs } from '../../collections';
import { Users, User } from '../user/user-avatar';
import { withTracker } from 'meteor/react-meteor-data';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import { Home } from '../home';

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
    <Route path="/" component={() => <Accounts.ui.LoginForm />} />
    <Route path="/signUp" component={() => <Accounts.ui.LoginForm formState={STATES.SIGN_UP} />} />
  </div>
);

const NavBar = ({ currentUser }) => (
  <header className="navigation" role="banner">
    <div className="navigation-wrapper">
      <a className="logo" href="/">Webdo</a>
      {currentUser ?
        <nav>
          <ul>
            <li className="nav-link"><Link to="/users"><i className="users"></i></Link></li>
            <li className="nav-link"><Link to={`/user/${currentUser._id}`}><i className="user"></i></Link></li>
            <li className="nav-link"><Link to={`/user/${currentUser._id}/gift/create`}><i className="new-gift"></i></Link></li>
          </ul>
        </nav>
      : ''}
    </div>
  </header>
);

const LayoutLoggedInContainer = props => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/users" exact component={() => <Users {...props} />} />
    <Route path="/user/:id" component={data => <User user={Meteor.users.findOne(data.match.params.id)} />} />
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
