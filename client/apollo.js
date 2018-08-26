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
});
export default client;
