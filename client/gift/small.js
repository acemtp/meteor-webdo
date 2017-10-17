import { Router } from 'meteor/iron:router';
import React from 'react';

import { GiftImage } from './image';
import findUserNameBy from '../../imports/client/lib/user';

Template.giftSmall.helpers({
  prio() {
    return _.range(this.priority);
  },
  buyedClass() {
    return this.buyerId ? 'buyed' : '';
  },
  isOwner() {
    return this.ownerId === Meteor.userId();
  },
  userName: findUserNameBy('ownerId'),
  buyerName: findUserNameBy('buyerId'),
  lockerName: findUserNameBy('lockerId'),
});

class SmallGift extends React.Component {
  constructor() {
    super();
    this.userName = findUserNameBy('ownerId', 'gift');
  }
  isOwner() {
    return this.props.gift.ownerId === Meteor.userId();
  }
  render() {
    return (
      <a className="gift-small" href={Router.path('gift.show', this.props.gift)}>
        <div className="gift-small-image">
          <GiftImage image={this.props.gift.image} title={this.props.gift.title} />
        </div>
        <div className="gift-small-description card-border">
          {this.userName()}
          <span className="stars">
            {Array.from(Array(this.props.gift.priority)).map((u, i) => (<span key={`${this.props.gift._id}-star-${i}`} />))}
          </span>
        </div>
        {this.isOwner() ? '' : (
          <div className="gift-small-state card-border">
            {this.props.buyerId ?
              (<div className="buyed">par {this.buyerName()} </div>)
              :
              (this.lockerId ?
                (<div className="lock">par {this.lockerName()} </div>)
                :
                ('Disponible')
              )
            }
          </div>
        )}
        <div className="gift-small-title card-border">{this.props.gift.title}</div>
      </a>
    );
  }
}

export {
  SmallGift,
};
