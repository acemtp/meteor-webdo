import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import AutoForm from 'uniforms-unstyled/AutoForm'; // replace with react-final-form?
import SubmitField from 'uniforms-unstyled/SubmitField'; // replace with react-final-form?

import { UserComponent } from './user-avatar';
import { gift } from '../gift/show';
import { profile } from '../../collections';
import { queryProfile } from '../../modules/users/client/currentUser';


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
User.propType = {
  userId: PropTypes.boolean,
  archived: PropTypes.boolean,
}

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
      !loading && (
        <AutoForm
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
      )
    )}
  </Query>
);
UserUpdate.propType = propType(queryProfile).isRequired;
