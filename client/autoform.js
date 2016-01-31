AutoForm.addHooks([ 'insertPublicComment', 'insertPrivateComment' ], {
  onSuccess: function() {
    toastr.success('commentaire ajoute');
  },
  onError: function (formType, error) {
    toastr.error(error);
    console.log('updateUserForm, onError:', formType, error);
  }
});

AutoForm.hooks({
  updateUserForm: {
    onSubmit: function (doc, update) {
      Meteor.users.update(this.docId, update);
      this.done();
      return false;
    },
    onSuccess: function() {
      Router.go('user.gifts', { _id: this.docId });
    },
    onError: function (formType, error) {
      console.log('updateUserForm, onError:', formType, error);
    }
  }
});

AutoForm.addHooks([ 'insertGiftForm', 'updateGiftForm' ], {
  onSuccess: function() {
    toastr.success('Sauvegarde reussi');
    Router.go('gift.show', { _id: this.docId });
  }
});
