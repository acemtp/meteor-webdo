import { ApolloClient } from 'apollo-client';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
import { InMemoryCache } from 'apollo-client-preset';
import { ApolloLink, concat } from 'apollo-link';

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: localStorage.getItem('Meteor.loginToken') || null,
    },
  });

  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, new DDPLink({
    connection: Meteor.connection,
  })),
  cache: new InMemoryCache({
    dataIdFromObject: object => object._id,
  }),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
export default client;
