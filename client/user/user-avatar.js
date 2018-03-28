import React, { Component } from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Link, withRouter } from 'react-router-dom';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';
import AutoForm from 'uniforms-unstyled/AutoForm';

import { SmallGift } from '../gift';
import { profile } from '../../collections';

const md = new Remarkable();
md.renderer = new RemarkableReactRenderer();

function userImage(user) {
  const url = user.profile.avatar || '/photo/anonymous.gif';
  const imageUrl = url.indexOf('http') === 0 ? url : `http://webdo.ploki.info${url}`;
  return imageUrl.indexOf('googleusercontent') === -1 ? `http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${imageUrl}` : imageUrl;
}

export class Img extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: this.props.src,
    };
  }
  errorHandler() {
    if (this.state.src === this.props.fallback) return;
    this.setState({ src: this.props.fallback });
  }
  render() {
    return (<img src={this.state.src} alt={this.props.alt} onError={this.errorHandler.bind(this)} />);
  }
}

export class UserPicture extends Component {
  render() {
    return (
      <Img src={userImage(this.props.user)} alt={this.props.user.username} fallback='/photo/anonymous.gif' />
    );
  }
}


export class UserAvatar extends Component {
  render() {
    return (
      <Link className="user-small" to={this.props.user.href}>
        <div className="user-small-Image">
          <UserPicture user={this.props.user} />
        </div>
        <div className="user-small-title">{this.props.user.username}</div>
      </Link>
    );
  }
}

export class Users extends Component {
  render() {
    return (
      this.props.usersLoading ? <div>loading ...</div> :
      <div className=".user-list">{this.props.users.map(user => <UserAvatar key={user._id} user={Object.assign(user, { href: `/user/${user._id}` })} />)}</div>
    );
  }
}


// export const Users = withTracker(() => {
//   const handle = subs.subscribe('users');
//   return {
//     usersLoading: !handle.ready(),
//     users: Meteor.users.find(),
//   };
// })(UsersComponent);

class UserComponent extends Component {
  isOwner() {
    return this.props.user._id === Meteor.userId();
  }
  render() {
    console.log('render user', { props: this.props, this: this });
    if (this.props.loading) return <div>Loading...</div>;
    return (
      <div>
        <div className="user-profile">
          <div className="user-section user-picture">
            <div className="user-image">
              <UserPicture user={this.props.user} />
            </div>
            <h1>{this.props.user.username}{this.isOwner() ? (<a className="edit-profile" href="/user/update" />) : ''}</h1>
          </div>
          <div className="user-section user-description">
            <div>{md.render(this.props.user.profile.description)}</div>
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
          {this.props.loading
            ? <div>Loading...</div>
            : this.props.user.gifts.map(gift => <SmallGift key={gift._id} gift={gift} />)
          }
        </div>
        <div>
          {this.props.archived
          ? <a href={`Router.path('user', this.props.user)`}>Voir les cadeaux</a>
          : <a href={`Router.path('user', this.props.user, { query: { archived: 1 } })`}>Voir les cadeaux archiv&eacute;s</a>
          }
        </div>
      </div>
    );
  }
}

const UserGraphQL = graphql(gql`
query userGifts($userId: String) {
  user(id: $userId) {
    username
    profile {
      description
      like
      dislike
    }
    gifts {
      _id
      title
      detail
      priority
      image
      owner {
        username
      }
    }
  }
}
`, {
  options(props) { console.log('UserGraphQL', { props }); return { variables: { userId: props.match.params.id } }; },
  props({ data }) { const { user, loading } = data; console.log('props', { loading, user }); return { user, loading }; },
});

export const User = withApollo(withRouter(UserGraphQL(UserComponent)));

export const UserUpdate = () => (
  <AutoForm schema={profile} onSubmit={doc => console.log('TODO save doc', doc)} model={Meteor.user()} />
);
