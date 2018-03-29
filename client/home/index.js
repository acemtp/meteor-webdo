import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { SmallGift } from '../gift';
import { gift } from '../gift/show';

const NewGiftsGraphQL = gql`
query homeGifts($type: GiftFilter) {
  gifts(filter: $type, limit: 5) {
    ...GiftSmall
  }
}
${gift.fragments.GiftSmall}
`;

export const GiftList = ({ title, type = 'latest' }) => (
  <Query query={NewGiftsGraphQL} variables={{type}}>
    {({ data: { gifts }, loading, error }) => {
      if (error) return <div>{error.toString()}</div>;
      if (loading) return <div>Loading...</div>;

      return (
        <div>
          <h1 className="title">{title}</h1>
          <div className="gift-list">
            {(gifts || []).map(g => <SmallGift key={g._id} gift={g} />)}
          </div>
        </div>);
    }}
  </Query>
);

export const Home = () => (
  <div>
    <GiftList title="À acheter" type="lockerId" />
    <GiftList title="Acheté" type="buyerId" />
    <GiftList title="Nouveau" />
  </div>
);
