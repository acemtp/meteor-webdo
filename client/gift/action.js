import gql from 'graphql-tag';
import React from 'react';
import { ApolloConsumer } from "react-apollo";
import { Link } from 'react-router-dom';

// Template.giftAction.helpers({
//   ownerIs(currentUser) {
//     return currentUser && this.ownerId === currentUser._id;
//   },
// });

// Template.giftAction.events({
//   'click .archive'(e) {
//     e.preventDefault();
//     doAction(this._id, { $set: {archived: true} }, { $set: {archived: false} });
//   },
//   'click .unarchive'(e) {
//     e.preventDefault();
//     doAction(this._id, { $set: {archived: false} }, { $set: {archived: true} });
//   },
//   'click .buy'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'buyerId');
//     doAction(this._id, action.go, action.undo);
//   },
//   'click .lock'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'lockerId');
//     doAction(this._id, action.go, action.undo);
//   },
// });

// XXX redo action directly on the gift?
// template(name="giftAction")
// if ownerIs currentUser
//   if archived
//     i.unarchive.mdi-content-inbox
//   else
//     i.archive.mdi-content-archive
// else
//   if archived
//     i.unarchive.mdi-content-inbox
//   else if buyerId
//     i.archive.mdi-content-archive
//   else if lockerId
//     i.buy.mdi-action-add-shopping-cart
//   else
//     i.lock.mdi-action-lock-open
const giftArchiveArchivedMutation = gql`
mutation giftArchive($giftId: ID!) {
  giftArchive(_id: $giftId) {
    _id
  }
}`;

const giftArchiveUnArchivedMutation = gql`
mutation giftUnArchive($giftId: ID!) {
  giftUnArchive(_id: $giftId) {
    _id
  }
}`;
const GiftActions = ({ gift: {_id, canEdit, isOwner, archived, lockerId, locker, buyerId, buyer } }) => (
<div>
  <span>
    <ApolloConsumer>{client => (
      <React.Fragment>
        <Link className={`button edit ${canEdit ? '' : 'hidden'}`} to={`/gift/${_id}/edit`}><i>Edit</i></Link>
          {(archived 
            ? <button onClick={() => client.mutate({ mutation: giftArchiveUnArchivedMutation, variables: { giftId: _id } })} className={`${canEdit ? '' : 'hidden '} unarchive`}><i>D&eacute;-archiver</i></button>
            : <button onClick={() => client.mutate({ mutation: giftArchiveArchivedMutation, variables: { giftId: _id } })} className={`${canEdit ? '' : 'hidden '} archive`}><i>Archiver</i></button>)}
        <button className={`lock ${isOwner ? 'hidden' : ''}`}><i>{lockerId ? `par ${locker.username}` : 'Réserver'}</i></button>
        <button className={`buy ${isOwner ? 'hidden' : ''}`}><i>{buyerId ? `par ${buyer.username}` : 'Réserver'}</i></button>
      </React.Fragment>
    )}
    </ApolloConsumer>
  </span>
</div>
);
export default GiftActions;
