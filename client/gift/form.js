import gql from 'graphql-tag';
import { CurrentUser } from '/modules/users/client/currentUser';
import { ApolloConsumer, Query } from 'react-apollo';
import { Route } from 'react-router-dom';

import GraphQLBridge from 'uniforms/GraphQLBridge';
// import { buildASTSchema, parse } from 'graphql';
import { buildASTSchema } from 'graphql/utilities/buildASTSchema';
import { parse } from 'graphql/language/parser';

import React from 'react';
import AutoField from 'uniforms-unstyled/AutoField';
import AutoForm from 'uniforms-unstyled/AutoForm';
import SubmitField from 'uniforms-unstyled/SubmitField'; // replace with react-final-form?
import LongTextField from 'uniforms-unstyled/LongTextField'; // replace with react-final-form?
import { GiftGraphQL } from './show';

import GiftInput from '../../modules/gifts/GiftInput.graphql';

const GiftFieldSet = () => (
  <CurrentUser>
    {({ data: { currentUser }, loading }) => (
      // TODO: add class has-error on error
      !loading && (
        <fieldset>
          <div className="form-group">
            <AutoField id="gift-link" name="link" />
            <span className="help-block">Certain lien peuvent automatiquement remplir les champs de description et le lien vers l'image.</span>

            <AutoField id="gift-title" name="title" />
            <AutoField id="gift-image" name="image" />
            <AutoField id="gift-owner-id" name="ownerId" options={(currentUser.userFriends || []).map(user => ({ label: user.username, value: user._id }))} />
            <AutoField
              id="gift-priority"
              name="priority"
              options={[
                { label: '5 étoiles - Doit avoir', value: 5 },
                { label: '4 étoiles - Adorerais avoir', value: 4 },
                { label: '3 étoiles - Aimerais avoir', value: 3 },
                { label: "2 étoiles - J'y pense", value: 2 },
              ]}
            />
            <LongTextField id="gift-detail" name="detail" rows="10" />
          </div>
        </fieldset>
      )
    )}
  </CurrentUser>
);

class FillWithLink extends AutoForm {
  onChange(key, value) {
    super.onChange(key, value);
    if (key !== 'link') return;

    if (document.querySelector("input[name='title']").value.trim()) return;
    if (document.querySelector("textarea[name='detail']").value.trim()) return;
    if (document.querySelector("input[name='image']").value.trim()) return;

    Meteor.call('curExtractMeta', value, (error, result) => {
      if (error) return;

      if (result.name) document.querySelector("input[name='title']").value = result.name;
      if (result.description) document.querySelector("textarea[name='detail']").value = result.description;
      if (result.image) document.querySelector("input[name='image']").value = result.image;
    });
  }
}

// START custom bridge based on Uniforms graphql Bridge
const schemaType = buildASTSchema(parse(GiftInput)).getType('GiftInput');
const schemaData = {
  title: {
    label: 'Titre',
  },
  detail: {
    label: 'Détail',
    optional: true,
  },
  link: {
    label: 'Lien',
    max: 1024,
    optional: true,
  },
  image: {
    label: 'Image',
    max: 1024,
    optional: true,
  },
  priority: {
    label: 'Priorité',
    min: 1,
    max: 5,
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: 'A quel point souhaite tu ce cadeau?',
      },
    },
  },
  ownerId: {
    label: 'Pour',
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: '',
      },
    },
  },
};

const bridge = new GraphQLBridge(schemaType, () => { }, schemaData);
// END

const giftCreateMutation = gql`
mutation createGift($gift: GiftInput!) {
  createGift(gift: $gift) {
    _id
  }
}`;

export const GiftCreate = () => (
  <Route>
    {({ history }) => (
      // TODO: add class has-error on error
      <ApolloConsumer>
        {client => (
          <AutoForm
            schema={bridge}
            model={{ ownerId: Meteor.userId(), priority: 5 }}
            onSubmit={async gift => client.mutate({ mutation: giftCreateMutation, variables: { gift } })}
            onSubmitSuccess={({ data:{ createGift: { _id } } }) => (console.log('gift created', _id) || history.push(`/gift/${_id}`))}
            onSubmitFailure={(...args) => {
              console.error('Promise rejected!', ...args);
              alert(`Failed to create gift :(`);
            }}
            onValidate={(model, error, callback) => {
              console.log('onValidate', { model, error });
              callback(error);
            }}
          >
            <GiftFieldSet />
            <SubmitField value="Créé un nouveau cadeau" />
          </AutoForm>
        )}
      </ApolloConsumer>
    )}
  </Route>
);

const giftUpdateMutation = gql`
mutation updateGift($giftId: String, $gift: GiftInput!) {
  updateGift(_id: $giftId, gift: $gift) {
    _id
    detail
  }
}`;

// TODO: add class has-error on error
const validKeys = ['title', 'detail', 'link', 'image', 'priority' ];
export const GiftEdit = ({ giftId }) => (
  <Route>
    {({ history }) => (
      <Query query={GiftGraphQL} variables={{ giftId }}>
        {({ client, data, loading }) => (loading || (
          <AutoForm
            schema={bridge}
            model={validKeys.reduce((gift, key) => ({ ...gift, [key]: data.gift[key] }), {})}
            onSubmit={gift => console.log('onSubmit', { gift }) || client.mutate({ mutation: giftUpdateMutation, variables: { giftId, gift } })}
            onSubmitSuccess={({ data: mutationData, errors }) => {
              console.log('succeed', { mutationData, errors});
              if (!errors || !errors.length) return history.push(`/gift/${giftId}`);
              alert(`Something went wrong: \n${errors.map(e => e.message).join('\n')}`);
            }}
            onSubmitFailure={(...args) => console.error('onSubmitFailure', args) || alert(`Internal error`)}
            onValidate={(model, error, callback) => {
              console.log('onValidate', { model, error });
              callback(error);
            }}
          >
            <GiftFieldSet />
            <SubmitField value="Mettre à jour le cadeau" />
          </AutoForm>
        ))}
      </Query>
    )}
  </Route>
);
