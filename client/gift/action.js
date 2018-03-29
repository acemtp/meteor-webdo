import React, { Component } from 'react';

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

const GiftActions = ({ archived, lockerId, locker, buyerId, buyer }) => (
  <div>
    {this.isEditableBy
      ? (
        <span>
          <a className="button edit" href={`pathFor 'gift.update'`}>
            <i>Edit</i>
          </a>
          <button className={archived ? 'unarchive' : 'archive'}>
            <i>{archived ? 'D&eacute;-archiver' : 'Archiver'}</i>
          </button>
        </span>
      ) : (
        <span>
          <button className="lock">
            <i>{lockerId ? `par ${locker.username}` : 'Réserver'}</i>
          </button>
          <button className="buy">
            <i>{buyerId ? `par ${buyer.username}` : 'Réserver'}</i>
          </button>
        </span>
      ) }
  </div>
);
export default GiftActions;
