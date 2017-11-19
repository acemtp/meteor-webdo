import React from 'react';
import { Link } from 'react-router-dom';

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

export { NavBar };
