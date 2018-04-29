import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { UserAvatar } from '../../../client/user/user-avatar';

const userQuery = gql`
query user($userId: String) {
  user(id: $userId) {
    _id
    username
    profile {
      avatar
      description
      like
      dislike
    }
  }  
}
`;

const UserSmall = ({ userId }) => (
  <Query query={userQuery} variables={{ userId }} key={userId}>
    {({ loading, error, data }) => {
      if (error) return <div>{error.toString()}</div>;
      if (loading) return <div>Loading...</div>;

      return <UserAvatar key={data.user._id} user={data.user} />;
    }}
  </Query>
);

export default UserSmall;
