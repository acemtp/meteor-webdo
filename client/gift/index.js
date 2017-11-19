import React from 'react';
import PropTypes from 'prop-types';

import { Img } from '../user/user-avatar';
import findUserNameBy from '../../imports/client/lib/user';

export const GiftImage = ({ image, title }) => (
  <Img
    src={`http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${image}`}
    alt={title}
    fallback="/photo/gift-default.png"
  />
);

GiftImage.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export class SmallGift extends React.Component {
  constructor() {
    super();
    this.userName = findUserNameBy('ownerId', 'gift');
    this.buyerName = findUserNameBy('buyerId');
    this.lockerName = findUserNameBy('lockerId');
  }
  prio() {
    return Array.from(Array(this.props.gift.priority));
  }
  buyedClass() {
    return this.buyerId ? 'buyed' : '';
  }
  isOwner() {
    return this.props.gift.ownerId === Meteor.userId();
  }
  render() {
    return (
      <a className="gift-small" href={`Router.path('gift.show', this.props.gift)`}>
        <div className="gift-small-image">
          <GiftImage image={this.props.gift.image} title={this.props.gift.title} />
        </div>
        <div className="gift-small-description card-border">
          {this.userName()}
          <span className="stars">
            {this.prio().map((u, i) => (<span key={`${this.props.gift._id}-star-${i}`} />))}
          </span>
        </div>
        {this.isOwner() ? '' : (
          <div className="gift-small-state card-border">
            {this.props.buyerId
            ? (<div className="buyed">par {this.buyerName()} </div>)
            : (this.lockerId
              ? (<div className="lock">par {this.lockerName()} </div>)
              : ('Disponible')
              )
            }
          </div>
        )}
        <div className="gift-small-title card-border">{this.props.gift.title}</div>
      </a>
    );
  }
}
