import { CurrentUser } from '/modules/users/client/currentUser';
import gql from 'graphql-tag';
import { ApolloConsumer } from "react-apollo";
import { Route } from 'react-router-dom';

// for graphql bridge
import GraphQLBridge from 'uniforms/GraphQLBridge';
import { buildASTSchema, parse } from 'graphql';
import GiftInput from '/modules/gifts/GiftInput.graphql';

import React from 'react';
import AutoField from 'uniforms-unstyled/AutoField';
import AutoForm from 'uniforms-unstyled/AutoForm';
import SubmitField from 'uniforms-unstyled/SubmitField'; // replace with react-final-form?
import LongTextField from 'uniforms-unstyled/LongTextField'; // replace with react-final-form?

// Template.giftFieldset.helpers({
//   giftOwnerId() {
//     return Meteor.userId();
//   },
// });


// Template.giftCreate.events({
//   'change input[name="link"]'() {
//     if ($("input[name='title']").val()) return;
//     if ($("textarea[name='detail']").val()) return;
//     if ($("input[name='image']").val()) return;

//     Meteor.call('curExtractMeta', $("input[name='link']").val(), (error, result) => {
//       console.log('extra', error, result);
//       if (!error) {
//         if (result.name) $("input[name='title']").val(result.name);
//         if (result.description) $("textarea[name='detail']").val(result.description);
//         if (result.image) $("input[name='image']").val(result.image);
//       }
//     });
//   },
// });

// TODO: rewrite in react
// template(name="giftFieldset")
// fieldset
//   legend Information du cadeau

//   .form-group(class="{{#if afFieldIsInvalid name='link'}}has-error{{/if}}")
//     label.control-label {{afFieldLabelText name='link'}}
//     +afFieldInput name="link" max=1024 autofocus=''
//     if afFieldIsInvalid name='link'
//       span.help-block {{afFieldMessage name='link'}}

//   +afQuickField name='title'

//   .form-group(class="{{#if afFieldIsInvalid name='image'}}has-error{{/if}}")
//     label.control-label {{afFieldLabelText name='image'}}
//     +afFieldInput name="image" max=1024
//     if afFieldIsInvalid name='image'
//       span.help-block {{afFieldMessage name='image'}}

//   +afQuickField name='ownerId' options=friends value=giftOwnerId
//   +afQuickField name='priority' options=priorities
//   +afQuickField name='detail' type='textarea' rows=10

const onChange = function (link, ...args) {
}
const GiftFieldSet = () => (
  <CurrentUser>
    {({ data: { currentUser }, loading }) => (
      // TODO: add class has-error on error
      !loading &&
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
mutation updateGift($gift: GiftInput!) {
  createGift(gift: $gift) {
    _id
  }
}`;

export const GiftCreate = () => (
  <Route>
    {({ history }) => (
      // TODO: add class has-error on error
      <ApolloConsumer>
        {client => (<AutoForm
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
        }}>
        <GiftFieldSet />
        <SubmitField value="Créé un nouveau cadeau" />

      </AutoForm>)}
    </ApolloConsumer>)}
  </Route>
);

export const GiftEdit = () => (
  // TODO: add class has-error on error
  <FillWithLink>
    <GiftFieldSet />
    <SubmitField value="Éditer" />
  </FillWithLink>
);

// template(name="giftCreate")
// +autoForm collection="Gifts" id="insertGiftForm" type="insert"
// +giftFieldset
// button(type="submit") Ajouter

// template(name="giftUpdate")
// +autoForm collection="Gifts" doc=this id="updateGiftForm" type="update"
// +giftFieldset
// button(type="submit") Mettre à jour le cadeau
