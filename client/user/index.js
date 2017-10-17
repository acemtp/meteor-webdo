import React from 'react';
import { Router } from 'meteor/iron:router';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';

import { UserPicture } from './user-avatar';
import { SmallGift } from '../gift/small';

var md = new Remarkable();
md.renderer = new RemarkableReactRenderer();
Template.userUpdate.helpers({
  profile() {
    return profile;
  },
});

class User extends React.Component {
  isOwner() {
    return this.props.user._id === Meteor.userId();
  }
  render() {
    console.log('User', { user: this.props.user });
    return (
      <div>
        <div className="user-profile">
          <div className="user-section user-picture">
            <div className="user-image">
              <UserPicture user={this.props.user} />
            </div>
            <h1>{this.props.user.username}{this.isOwner() ? (<a className="edit-profile" href={Router.path('user.update', this.props.user)} />) : ''}</h1>
          </div>
          <div className="user-section user-description">
            <p>{md.render(this.props.user.profile.description)}</p>
            <div className="user-like">
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">J'aime</h3>
                </div>
                <div className="panel-body">{md.render(this.props.user.profile.like)}</div>
              </div>
            </div>
            <div className="user-like">
              <div className="panel panel-danger">
                <div className="panel-heading">
                  <h3 className="panel-title">Je n'aime pas</h3>
                </div>
                <div className="panel-body">{md.render(this.props.user.profile.dislike)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="gift-list">
          {this.props.gifts.map(gift => <SmallGift key={gift._id} gift={gift} />)}
        </div>
        <div>
          {this.props.archived
          ? <a href={Router.path('user', this.props.user)}>Voir les cadeaux</a>
          : <a href={Router.path('user', this.props.user, { query: { archived: 1 } })}>Voir les cadeaux archiv&eacute;s</a>
          }
        </div>
      </div>
    );
  }
}

Template.user.helpers({
  User() { return User; },
  data() { return Template.currentData(); },
});

Template.users.helpers({
  users: Meteor.users.find.bind(Meteor.users, {}, { sort: { username: 1 } }),
});
