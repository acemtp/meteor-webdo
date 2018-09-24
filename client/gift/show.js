import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import GiftActions from './action';
import { GiftImage } from './index';

export const gift = {
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

const GiftComment = ({ giftComment: { author, createdAt, message } }) => (
  <div>
    <div>Par {author} <span>{moment(createdAt).fromNow()}</span></div>
    <ReactMarkdown source={message} />
  </div>
);

export const GiftGraphQL = gql`
query gift($giftId: String) {
  gift(id: $giftId) {
    ...GiftSmall
    canEdit
    archived
    actions
    lockerId
    locker {
      _id
      username
    }
    buyerId
    buyer {
      _id
      username
    }
    comments {
      _id
      createdAt
      author
      message
    }
    privateComments {
      _id
      createdAt
      author
      message
    }
  }
}
${gift.fragments.GiftSmall}
`;

const giftCommentMutation = gql`
mutation commentGift($giftId: String!, $visible: Boolean!, $message: String) {
  commentGift(_id: $giftId, visible: $visible, message: $message) {
    _id
    detail
    comments {
      _id
      message
    }
    privateComments {
      _id
      message
    }
  }
}`;

const commentSubmit = async (refetch, client, data, giftId, visible, event) => {
  event.preventDefault();
  const message = (visible ? data.message : data.privateMessage).value;
  console.log('commentChange', client, giftId, visible, message);
  try {
    const result = await client.mutate({ mutation: giftCommentMutation, variables: { giftId, visible, message } });
    refetch();
    console.log('comment added', { result });
  } catch (err) {
    console.error('failed to add comment', { err });
  }
};

export const Gift = ({ giftId }) => (
  <Query query={GiftGraphQL} variables={{giftId}}>
    {({ data: { gift }, loading, error, client, refetch }) => {
      if (error) return <div>{error}</div>;
      if (loading) return <div>Loading...</div>;
      if (!gift) return <div>gift not found :'(</div>;
      const { _id, title, archived, image, priority, owner, createdAt } = gift;
      console.log('Gift', { gift, client });
      const data = {};
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
            {gift.owner._id !== Meteor.userId()
              && (
                <div className="comments private">
                  {(gift.privateComments || []).map((giftComment, i) => <GiftComment key={`${_id}-star-${i}`} giftComment={giftComment} />)}
                  <h4>Commentaire</h4>
                  <div className="panel-body">
                    <form onSubmit={commentSubmit.bind(null, refetch, client, data, giftId, false)}>
                      <input name="message" ref={(el) => data.privateMessage = el} />
                      <br />
                      <button type="submit">Envoyer</button>
                    </form>
                  </div>
                </div>
              )
            }
            <div className="comments">
              {(gift.comments || []).map((giftComment, i) => <GiftComment key={`${_id}-star-${i}`} giftComment={giftComment} />)}
              <div className="warning">
                <h4>
                  Ce message sera visible par
                  <b>{gift.owner.username}</b>
                </h4>
              </div>
              <div className="panel-body">
                <form onSubmit={commentSubmit.bind(null, refetch, client, data, giftId, true)}>
                  <input name="message" ref={(el) => data.message = el} />
                  <br />
                  <button type="submit">Envoyer</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }}
  </Query>
);
