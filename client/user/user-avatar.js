import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';
import AutoForm from 'uniforms-unstyled/AutoForm'; // replace with react-final-form?
import SubmitField from 'uniforms-unstyled/SubmitField'; // replace with react-final-form?

import { SmallGift } from '../gift';
import { gift } from '../gift/show';
import { profile } from '../../collections';
import { queryProfile } from '../../modules/users/client/currentUser';

const md = new Remarkable();
md.renderer = new RemarkableReactRenderer();

function userImage(user) {
  const url = user.profile.avatar || '/photo/anonymous.gif';
  const imageUrl = url.indexOf('http') === 0 ? url : `http://webdo.ploki.info${url}`;
  return imageUrl.indexOf('googleusercontent') === -1 ? `http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${imageUrl}` : imageUrl;
}


// export class Img extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       src: this.props.src,
//     };
//   }
//   errorHandler() {
//     if (this.state.src === this.props.fallback) return;
//     this.setState({ src: this.props.fallback });
//   }
//   render() {
//     return (<img src={this.state.src} alt={this.props.alt} onError={() => this.errorHandler()} />);
//   }
// }

const errorHandler = ({ target }) => {
  const { fallback } = target.dataset;
  if (!fallback || target.src === fallback) return;
  target.setAttribute('src', fallback);
};

export const Img = ({ src, alt, fallback }) => (<img src={src} alt={alt} onError={errorHandler} data-fallback={fallback} />);

export const UserPicture = ({ user }) => <Img src={userImage(user)} alt={user.username} fallback="/photo/anonymous.gif" />;

export const UserAvatar = ({ user }) => (
  <Link className="user-small" to={`/user/${user._id}`}>
    <div className="user-small-Image">
      <UserPicture user={user} />
    </div>
    <div className="user-small-title">{user.username}</div>
  </Link>
);

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
          {this.props.archived && (<h2>Cadeaux archiver</h2>)}
          {this.props.loading
            ? <div>Loading...</div>
            : this.props.user.gifts.map(gift => <SmallGift key={gift._id} gift={gift} />)
          }
        </div>
        <div>
          {this.props.archived
          ? <Link to={`/user/${this.props.user._id}`}>Voir les cadeaux</Link>
          : <Link to={`/user/${this.props.user._id}/archived`}>Voir les cadeaux archiv&eacute;s</Link>
          }
        </div>
      </div>
    );
  }
}

const UserGraphQL = gql`
query userGifts($userId: String, $archived: Boolean) {
  user(id: $userId) {
    _id
    username
    profile {
      avatar
      description
      like
      dislike
    }
    gifts(archived: $archived) {
      ...GiftSmall
    }
  }
}
${gift.fragments.GiftSmall}
`;

export const User = ({ userId, archived }) => (
  <Query query={UserGraphQL} variables={{ userId, archived: !!archived }}>
    {({ loading, error, data }) => {
      if (error) return <div>{error.toString()}</div>;
      if (loading) return <div>Loading...</div>;

     return <UserComponent user={data.user} archived={archived} />;
    }}
  </Query>
);

const userProfileMutation = gql`
mutation updateUserProfile($userProfile: UserProfileInput!) {
  updateUserProfile(userProfile: $userProfile) {
    id
    profile
  }
}
`;

const MySubmitField = props => <SubmitField value="Mettre à jour mon profile" {...props} />; // It's <input type="submit" />;

export const UserUpdate = () => (
  <Query query={queryProfile}>
    {({ client, data, loading }) => (
      !loading && <AutoForm
        schema={profile}
        onSubmit={async (user) => {
          const { profile: userProfile } = profile.clean(user);
          profile.validate({ profile: userProfile });
          console.log('call mutation', { client, userProfile });
          await client.mutate({ mutation: userProfileMutation, variables: { userProfile } });
        }}
        model={profile.clean(data.currentUser)}
        submitField={MySubmitField}
      />
    )}
  </Query>
);
