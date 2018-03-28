import gql from 'graphql-tag';
import React from 'react';
import { withApollo, graphql } from 'react-apollo';
import { withRouter, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { GiftActions } from './action';
import { GiftImage} from '../gift/index';

// import { getAction } from '../../imports/client/lib/action';
// import findUserNameBy from '../../imports/client/lib/user';
// import { Gifts, Comments } from '../../collections';

// Template.giftShow.helpers({
//   prio() {
//     return _.range(this.priority);
//   },
//   userName: findUserNameBy('ownerId'),
//   lockerName: findUserNameBy('lockerId'),
//   buyerName: findUserNameBy('buyerId'),
//   ownerName: findUserNameBy('ownerId'),
//   ownerIs(currentUser) {
//     return currentUser && this.ownerId === currentUser._id;
//   },
//   ownerIsNot(currentUser) {
//     return currentUser && this.ownerId !== currentUser._id;
//   },
//   isEditableBy(currentUser) {
//     const edit = currentUser && (this.ownerId === currentUser._id || this.suggested);
//     // console.log('isEditableBy', edit, this);
//     return edit;
//   },
//   publicComments() {
//     return Comments.find({ giftId: this._id, visible: true });
//   },
//   privateComments() {
//     return Comments.find({ giftId: this._id, visible: false });
//   },
//   createdAt() {
//     return moment(this.createdAt).format('LLLL');
//   },
//   Comments() {
//     return Comments;
//   },
// });

// Template.giftShow.events({
//   'click .archive'(e) {
//     e.preventDefault();
//     Gifts.update(this._id, { $set: { archived: true } });
//   },
//   'click .unarchive'(e) {
//     e.preventDefault();
//     Gifts.update(this._id, { $set: { archived: false } });
//   },
//   'click .buy'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'buyerId');
//     Gifts.update(this._id, action.go);
//   },
//   'click .lock'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'lockerId');
//     Gifts.update(this._id, action.go);
//   },
// });

export const gifts = {
  fragments: {
    GiftSmall: gql`
    fragment GiftSmall on Gift {
      _id
      title
      detail
      priority
      image
      createdAt
      owner {
        _id
        username
      }
    }`,
  },
};

const GiftComment = ({ giftComment }) => (
  <div>
    <div>Par {'Author'} <span>{'createdAt'}</span></div>
    <ReactMarkdown source={message} />
  </div>
);
// template(name="giftComment")
//   div Par {{author}}
//     span= createdAt
//   p
//     +markdown 
//       {{message}}

const GiftGraphQL = graphql(gql`
query gift($id: String) {
  gift(id: $id) {
    ...GiftSmall
  }
  ${gifts.fragments.GiftSmall}
}
`, {
  options(props) { return { variables: { id: props.match.params.id } }; },
  props({ data: { gift, loading } }) { return { gift, loading }; },
});

const commentChange = event => console.log('commentChange', event);

// TODO in React
// template(name="giftShow")
export const GiftComponent = ({ gift, loading }) => {
  if (loading) return <div>loading...</div>;

  const { _id, title, archived, image, priority, owner, createdAt } = gift;
  return (
    <div className="gift">
      <h1>{title}</h1>
      <GiftActions gift={gift} />
      <div className="gift-profile">
        <div className="gift-section gift-picture">
          <div className="gift-image">
            {gift && gift.image ? <GiftImage title={title} image={image} /> : <img src="/photo/gift-default.png" alt={title} />}
          </div>
          <div className="stars">
            {Array.from(Array(priority)).map((u, i) => (<span key={`${_id}-star-${i}`} />))}
          </div>
          <Link className="user-name" to={`/user/${owner._id}`}>{owner.username}</Link>
        </div>
        <div className="gift-section gift-description">
          <div className="padding">
            <p>Créé le : {moment(createdAt).format('ll')}</p>
            {gift.link && <Link to={gift.link} />}
            <ReactMarkdown source={gift.detail} />
          </div>
        </div>
      </div>
      <div className="all-comments">
        {gift.privateComments &&
          <div className="comments private">
            {gift.privateComments.map((giftComment, i) => <GiftComment key={`${_id}-star-${i}`} giftComment={giftComment} />)}
            <h4>Commentaire</h4>
            <div className="panel-body">
              <form onChange={commentChange}>
                <input name="message" />
                <input name="visible" defaultValue="false" />
                <input name="giftId" value={gift._id} />
                <br />
                <button type="submit">Envoyer</button>
              </form>
            </div>
          </div>
        }
        <div className="comments">
          {gift.comments && gift.comments.map((giftComment, i) => <GiftComment key={`${_id}-star-${i}`} giftComment={giftComment} />)}
          <div className="warning"><h4>Ce message sera visible par <b>{gift.owner.username}</b></h4></div>
          <div className="panel-body">
            <form onChange={commentChange}>
              <input name="message" />
              <input name="visible" defaultValue="true" />
              <input name="giftId" defaultValue={gift._id} />
              <br />
              <button type="submit">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </div>);
};

export const Gift = withApollo(withRouter(GiftGraphQL(GiftComponent)));
