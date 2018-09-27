import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { css } from 'emotion';

import GiftImage from './image';

const breakpoints = {
  // Numerical values will result in a min-width query
  small: 576,
  medium: 768,
  large: 992,
  xLarge: 1200,
  // String values will be used as is
  tallPhone: '(max-width: 360px) and (min-height: 740px)',
};

const mq = Object.keys(breakpoints).reduce((accumulator, label) => {
  const prefix = typeof breakpoints[label] === 'string' ? '' : 'min-width:';
  const suffix = typeof breakpoints[label] === 'string' ? '' : 'px';

  accumulator[label] = cls => css`
    @media (${prefix + breakpoints[label] + suffix}) {
      ${cls};
    }
  `;
  return accumulator;
}, {});

const giftSmallClass = css`
  background-color: #f7f7f7;
  border-radius: 3px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px #e6e6e6;
  cursor: pointer;
  margin-bottom: 1em;
  position: relative;

  ${mq.small(css`
    float:left;
    display: block;
    margin-right: 4.34783%;
    width: 47.82609%;

    &:last-child {
      margin-right: 0
    }

    &:nth-child(2n) {
      margin-right: 0
    }

    &:nth-child(2n+1) {
      clear: left
    }
  `)}

  ${mq.medium(css`
    float:left;
    display: block;
    margin-right: 2.85714%;
    width: 31.42857%

    &:nth-child(2n) {
      margin-right: 2.85714%
    }

    &:nth-child(2n+1) {
        clear: none
    }

    &:last-child {
      margin-right: 0
    }

    &:nth-child(3n) {
      margin-right: 0
    }

    &:nth-child(3n+1) {
      clear: left
    }
  `)}

  ${mq.large(css`
    float:left;
    display: block;
    margin-right: 2.12766%;
    width: 23.40426%

    &:nth-child(3n) {
      margin-right: 2.12766%
    }

    &:nth-child(3n+1) {
      clear: none
    }

    &:last-child {
      margin-right: 0
    }

    &:nth-child(4n) {
      margin-right: 0
    }

    &:nth-child(4n+1) {
      clear: left
    }
  `)}

  ${mq.xLarge(css`
    float:left;
    display: block;
    margin-right: 1.69492%;
    width: 18.64407%

    &:nth-child(4n) {
      margin-right: 1.69492%
    }

    &:nth-child(4n+1) {
      clear: none
    }

    &:last-child {
      margin-right: 0
    }

    &:nth-child(5n) {
      margin-right: 0
    }

    &:nth-child(5n+1) {
      clear: left
    }
  `)}
`;


export default class SmallGift extends Component {
  prio() {
    return Array.from(Array(this.props.gift.priority));
  }
  buyedClass() {
    return this.buyerId ? 'buyed' : '';
  }
  isOwner() {
    return this.props.gift.isOwner; // ownerId === Meteor.userId();
  }
  render() {
    return (
      <Link className={giftSmallClass} to={`/gift/${this.props.gift._id}`}>
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
