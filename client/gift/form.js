
Template.giftFieldset.helpers({
  giftOwnerId() {
    return Meteor.userId();
  },
});


Template.giftCreate.events({
  'change input[name="link"]'() {
    if ($("input[name='title']").val()) return;
    if ($("textarea[name='detail']").val()) return;
    if ($("input[name='image']").val()) return;

    Meteor.call('curExtractMeta', $("input[name='link']").val(), (error, result) => {
      console.log('extra', error, result);
      if (!error) {
        if (result.name) $("input[name='title']").val(result.name);
        if (result.description) $("textarea[name='detail']").val(result.description);
        if (result.image) $("input[name='image']").val(result.image);
      }
    });
  },
});
