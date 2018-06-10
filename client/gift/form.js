
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

// template(name="giftCreate")
// +autoForm collection="Gifts" id="insertGiftForm" type="insert"
// +giftFieldset
// button(type="submit") Ajouter

// template(name="giftUpdate")
// +autoForm collection="Gifts" doc=this id="updateGiftForm" type="update"
// +giftFieldset
// button(type="submit") Mettre à jour le cadeau
