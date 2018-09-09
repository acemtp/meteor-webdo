import gql from 'graphql-tag';
import React from 'react';
import { ApolloConsumer } from "react-apollo";
import { Link } from 'react-router-dom';
import client from '../apollo';

const giftArchiveArchivedMutation = gql`
mutation giftArchive($giftId: ID!) {
  giftArchive(_id: $giftId) {
    _id
    archived
  }
}`;

const giftArchiveUnArchivedMutation = gql`
mutation giftUnArchive($giftId: ID!) {
  giftUnArchive(_id: $giftId) {
    _id
    archived
  }
}`;

const mutation = (action, properties) => gql`
mutation gift${action}($giftId: ID!) {
  gift${action}(_id: $giftId) {
    _id
    ${properties.join('\n')}
  }
}`;

const GiftActions = ({
  gift: {
    _id, canEdit, isOwner, archived, lockerId, locker, buyerId, buyer, actions: availableActions
  }
}) => {
  // TODO: fix client
  const buttons = [];
  if (availableActions.includes('edit')) buttons.push(<Link key="edit" className={`button edit ${canEdit ? '' : 'hidden'}`} to={`/gift/${_id}/edit`}><i>Edit</i></Link>);
  if (availableActions.includes('archive')) buttons.push(archived
    ? <button key="unArchive" type="button" onClick={() => client.mutate({ mutation: mutation('UnArchive', ['archived']), variables: { giftId: _id } })} className="unarchive"><i>D&eacute;-archiver</i></button>
    : <button key="archive" type="button" onClick={() => client.mutate({ mutation: mutation('Archive', ['archived']), variables: { giftId: _id } })} className="archive"><i>Archiver</i></button>);
  if (availableActions.includes('lock')) buttons.push(<button key="lock" type="button" onClick={() => client.mutate({ mutation: mutation('Lock', ['lockerId', 'buyer {', '_id', 'username', '}']), variables: { giftId: _id } }).then(({ errors }) => errors && errors.length && (console.error(errors) || alert(errors[0].message)))} className="lock"><i>{lockerId ? `par ${locker.username}` : 'Réserver'}</i></button>);
  if (availableActions.includes('buy')) buttons.push(<button key="buy" type="button" onClick={() => client.mutate({ mutation: mutation('Buy', ['buyerId', 'buyer {', '_id', 'username', '}']), variables: { giftId: _id } })} className="buy"><i>{buyerId ? `par ${buyer.username}` : 'Acheter'}</i></button>);

  return (
    <div>
      <span>{buttons}</span>
    </div>
  );
};

export default GiftActions;
