AutoForm.addHooks(['insertPublicComment', 'insertPrivateComment'], {
  onSuccess() {
    toastr.success('commentaire ajoute');
  },
  onError(formType, error) {
    toastr.error(error);
    console.log('updateUserForm, onError:', formType, error);
  },
});

AutoForm.hooks({
  updateUserForm: {
    onSubmit(doc, update) {
      Meteor.users.update(this.docId, update);
      this.done();
      return false;
    },
    onSuccess() {
      Router.go('user.gifts', { _id: this.docId });
    },
    onError(formType, error) {
      console.log('updateUserForm, onError:', formType, error);
    },
  },
});

AutoForm.addHooks(['insertGiftForm', 'updateGiftForm'], {
  onSuccess() {
    toastr.success('Sauvegarde reussi');
    Router.go('gift.show', { _id: this.docId });
  },
});
