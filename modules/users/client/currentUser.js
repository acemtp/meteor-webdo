import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

export const query = gql`
query currentUser {
  currentUser {
    _id
    username
    profile {
      friends
    }
    userFriends {
      _id
      username
    }
  }
}
`;

export const queryProfile = gql`
query currentUser {
  currentUser {
    _id
    username
    profile {
      like
      dislike
      avatar
      description
    }
  }
}
`;
export const CurrentUser = ({ children }) => (<Query query={query}>{children}</Query>);
