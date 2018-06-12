import React from 'react';
import AutoField from 'uniforms-unstyled/AutoField';
import AutoForm from 'uniforms-unstyled/AutoForm';
import SubmitField from 'uniforms-unstyled/SubmitField'; // replace with react-final-form?
import LongTextField from 'uniforms-unstyled/LongTextField'; // replace with react-final-form?

import { Gifts } from '../../collections';
import { CurrentUser } from '/modules/users/client/currentUser';

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

const GiftFieldSet = () => (
  <CurrentUser>
    {({ data: { currentUser }, loading }) => (console.log({ currentUser, loading }),
    // TODO: add class has-error on error
    !loading && <fieldset>
      <div className="form-group">
        <label className="control-label" htmlFor="gift-link">Link</label>
        <AutoField id="gift-link" name="link" />
        <span className="help-block">Link</span>

        <AutoField id="gift-title" name="title" />
        <AutoField id="gift-image" name="image" />
        <AutoField id="gift-owner-id" name="ownerId" options={(currentUser.userFriends || []).map(user => ({ label: user.username, value: user._id}))} />
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

export const GiftCreate = () => (
  // TODO: add class has-error on error
  <AutoForm
    schema={Gifts.simpleSchema()}
    onSubmit={async (user) => {
      return alert('TODO: submit new gift');
      // await client.mutate({ mutation: userProfileMutation, variables: { userProfile } });
    }}
  >
    <GiftFieldSet />
    <SubmitField value="Créé" />
  </AutoForm>
);

export const GiftEdit = () => (
  // TODO: add class has-error on error
  <AutoForm>
    <GiftFieldSet />
    <SubmitField value="Éditer" />
  </AutoForm>
);

// template(name="giftCreate")
// +autoForm collection="Gifts" id="insertGiftForm" type="insert"
// +giftFieldset
// button(type="submit") Ajouter

// template(name="giftUpdate")
// +autoForm collection="Gifts" doc=this id="updateGiftForm" type="update"
// +giftFieldset
// button(type="submit") Mettre à jour le cadeau
