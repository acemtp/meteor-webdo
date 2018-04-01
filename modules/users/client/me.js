import gql from 'graphql-tag';

export const query = gql`
query me {
  me {
    _id
    username
  }
}
`;
