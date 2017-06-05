
export const getAction = (doc, field) => {
  const action = { go: { $set: {} }, undo: { $unset: {} } };
  const userId = Meteor.userId();

  action.go.$set[field] = userId;
  action.undo.$unset[field] = '';
  // swap go <=> undo
  return doc[field] === userId ? { go: action.undo, undo: action.go } : action;
};

export const doAction = (_id, _do, undo) => {
  Gifts.update(_id, _do, error => {
    if (error) {
      toastr.error(error);
      return;
    }
    const toastrEl = toastr.info('Action réussi. <a href="#">Annuler</a>');
    toastrEl.on('click', () => {
      toastrEl.hide();
      console.log('undo action', _id, undo);
      Gifts.update(_id, undo, undoError => {
        if (undoError) {
          toastr.error(undoError);
          return;
        }
        toastr.success('Action Annulée');
      });
    });
  });
};