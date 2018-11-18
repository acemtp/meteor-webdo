import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';

import styled from 'styled-components';

import { SmallGift } from '../gift';
import UserPicture from './user-picture';

const md = new Remarkable();
md.renderer = new RemarkableReactRenderer();

const UserSmallImage = styled.div`
  background: blue;
  color: red;
`;

export const UserAvatar = ({ user }) => (
  <Link className="user-small" to={`/user/${user._id}`}>
    <UserSmallImage className="user-small-Image">
      <UserPicture user={user} />
    </UserSmallImage>
    <div className="user-small-title">{user.username}</div>
  </Link>
);

export class UserComponent extends Component {
  isOwner() {
    const { user: _id } = this.props;
    return _id === Meteor.userId();
  }

  render() {
    const {
      loading,
      user,
      archived,
    } = this.props;
    console.log('render user', { props: this.props, this: this });
    if (loading) return <div>Loading...</div>;

    return (
      <div>
        <div className="user-profile">
          <div className="user-section user-picture">
            <div className="user-image">
              <UserPicture user={user} />
            </div>
            <h1>
              {user.username}
              {this.isOwner() ? (<Link className="edit-profile" to="/user/update" />) : ''}
            </h1>
          </div>
          <div className="user-section user-description">
            <div>{md.render(user.profile.description)}</div>
            <div className="user-like">
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">J'aime</h3>
                </div>
                <div className="panel-body">{md.render(user.profile.like)}</div>
              </div>
            </div>
            <div className="user-like">
              <div className="panel panel-danger">
                <div className="panel-heading">
                  <h3 className="panel-title">Je n'aime pas</h3>
                </div>
                <div className="panel-body">{md.render(user.profile.dislike)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="gift-list">
          {archived && (<h2>Cadeaux archiver</h2>)}
          {loading
            ? <div>Loading...</div>
            : user.gifts.map(gift => <SmallGift key={gift._id} gift={gift} />)
          }
        </div>
        <div>
          {archived
            ? <Link to={`/user/${user._id}`}>Voir les cadeaux</Link>
            : <Link to={`/user/${user._id}/archived`}>Voir les cadeaux archiv&eacute;s</Link>
          }
        </div>
      </div>
    );
  }
}
