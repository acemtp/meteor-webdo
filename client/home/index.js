import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withTracker } from 'meteor/react-meteor-data';
import { SmallGift } from '../gift';
import { subs, Gifts } from '../../collections';

/*
import { subs, Gifts } from '../../collections';
Router.route('/', {
  name: 'home',
  waitOn() {
    return [
      subs.subscribe('users'),
      subs.subscribe('gifts.tobuy'),
      subs.subscribe('gifts.buyed'),
      subs.subscribe('gifts.latest'),
    ];
  },
  data() {
    return {
      toBuyGifts: Gifts.find(
        { archived: false, lockerId: Meteor.userId(), buyerId: { $exists: false } },
        { sort: { priority: -1 } }),
      buyedGifts: Gifts.find(
        { archived: false, buyerId: Meteor.userId() },
        { sort: { lockerId: 1, priority: -1 } }),
      latestGifts: Gifts.find(
        { archived: false, ownerId: { $ne: Meteor.userId() } },
        { sort: { createdAt: -1 }, limit: 10 }),
    };
  },
});
*/


const NewGiftsGraphQL = graphql(gql`
query gifts($type: GiftFilter) {
  gifts(filter: $type, limit: 5) {
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
`, {
    options(props) { return { variables: { type: props.type || 'latest' } }; },
    props({ data: { gifts, loading } }) { return { gifts, loading }; },
  });

export const GiftList = NewGiftsGraphQL(({ title, gifts, loading }) => (
  !loading && gifts && gifts.length ?
    (<div>
      <h1 className="title">{title}</h1>
      <div className="gift-list">
        {(gifts || []).map(gift => <SmallGift key={gift._id} gift={gift} />)}
      </div>
    </div>) : ''
));

export const HomeContainer = () => (
<div>
  <GiftList title="À acheter" type="lockerId" />
  <GiftList title="Acheté" type="buyerId" />
  <GiftList title="Nouveau" />
</div>);

export const Home = withTracker(() => {
  const toBuyHandler = subs.subscribe('gifts.tobuy');
  const buyedHandler = subs.subscribe('gifts.buyed');
  const latestHandler = subs.subscribe('gifts.latest');

  return {
    dataLoading: !(toBuyHandler.ready() && buyedHandler.ready() && latestHandler.ready()),
    toBuyGifts: Gifts.find(
      { archived: false, lockerId: Meteor.userId(), buyerId: { $exists: false } },
      { sort: { priority: -1 } }).fetch(),
    buyedGifts: Gifts.find(
      { archived: false, buyerId: Meteor.userId() },
      { sort: { lockerId: 1, priority: -1 } }).fetch(),
    latestGifts: Gifts.find(
      { archived: false, ownerId: { $ne: Meteor.userId() } },
      { sort: { createdAt: -1 }, limit: 10 }).fetch(),
  };
})(HomeContainer);

