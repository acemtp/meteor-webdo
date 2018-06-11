import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Img } from '../user/user-avatar';
import { Gift } from './show';
import { GiftCreate } from './form';

export { Gift, GiftCreate };
export const GiftImage = ({ image, title }) => (
  image ? (
    <Img
      src={`http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${image}`}
      alt={title}
      fallback="/photo/gift-default.png"
    />
  ) : (
    <Img
      src="/photo/gift-default.png"
      alt={title}
    />
  )
);

GiftImage.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export class SmallGift extends React.Component {
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
      <Link className="gift-small" to={`/gift/${this.props.gift._id}`}>
        <div className="gift-small-image">
          <GiftImage image={this.props.gift.image} title={this.props.gift.title} />
        </div>
        <div className="gift-small-description card-border">
          {this.props.gift.owner.username}
          <span className="stars">
            {this.prio().map((u, i) => (<span key={`${this.props.gift._id}-star-${i}`} />))}
          </span>
        </div>
        {this.isOwner() ? '' : (
          <div className="gift-small-state card-border">
            {this.props.buyer
            ? (<div className="buyed">par {this.props.buyer.username} </div>)
            : (this.locker
              ? (<div className="lock">par {this.props} </div>)
              : ('Disponible')
              )
            }
          </div>
        )}
        <div className="gift-small-title card-border">{this.props.gift.title}</div>
      </Link>
    );
  }
}
