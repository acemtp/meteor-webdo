import React from 'react';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';

import { query } from '../../modules/users/client/me';

const NavBar = () => (
  <Query query={query}>
    {({ data }) => (
      <header className="navigation" role="banner">
        <div className="navigation-wrapper">
          <Link className="logo" to="/home">Webdo</Link>
          {data && data.me ?
            <nav>
              <ul>
                <li className="nav-link"><Link to="/users"><i className="users"></i></Link></li>
                <li className="nav-link"><Link to={`/user/${data.me._id}`}><i className="user"></i></Link></li>
                <li className="nav-link"><Link to={`/user/${data.me._id}/gift/create`}><i className="new-gift"></i></Link></li>
              </ul>
            </nav>
          : ''}
        </div>
      </header>
    )}
  </Query>
);

export { NavBar };
