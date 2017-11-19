import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { SmallGift } from '../gift/small';
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
console.log('gift small', { SmallGift });
export class GiftList extends Component {
  /*
  h1.title= title
  .gift-list
    each gifts
      +giftSmall
  */
  render() {
    return (
      <div>
        <h1 className="title">{this.props.title}</h1>
        <div className="gift-list">
          {(this.props.gifts || []).map(gift => <SmallGift key={gift._id} gift={gift} />)}
        </div>
      </div>
    );
  }
}


export class HomeContainer extends Component {
  /*
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
  // template
  if giftToBuy
    +giftList title="À acheter" gifts=toBuyGifts
  if giftBuyed
    +giftList title="Achetés" gifts=buyedGifts
  +giftList title="Nouveau" gifts=latestGifts
  */
  render() {
    return (
      <div>
        {this.props.giftToBuys && this.props.giftToBuys.length && <GiftList title="À acheter" gifts={this.props.giftsToBuy} />}
        {this.props.giftsBuyed && this.props.giftsBuyed.length && <GiftList title="Acheté" gifts={this.props.giftsBuyed} />}
        <GiftList title="Nouveau" gifts={this.props.latestGifts} />
      </div>
    );
  }
}
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

