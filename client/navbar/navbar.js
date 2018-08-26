import React from 'react';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';

import { query } from '../../modules/users/client/currentUser';

const NavBar = () => (
  <Query query={query}>
    {({ data }) => (
      <header className="navigation" role="banner">
        <div className="navigation-wrapper">
          <Link className="logo" to="/home">Webdo</Link>
          {data && data.currentUser ?
            <nav>
              <ul>
                <li className="nav-link"><Link to="/users"><i className="users" /></Link></li>
                <li className="nav-link"><Link to={`/user/${data.currentUser._id}`}><i className="user" /></Link></li>
                <li className="nav-link"><Link to={`/user/gift/create`}><i className="new-gift" /></Link></li>
              </ul>
            </nav>
          : ''}
        </div>
      </header>
    )}
  </Query>
);

export { NavBar };
