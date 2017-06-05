Template.giftAction.helpers({
  ownerIs(currentUser) {
    return currentUser && this.ownerId === currentUser._id;
  },
});

const doAction = (_id, _do, undo) => {
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

const getAction = (doc, field) => {
  const action = {
    go: {
      $set: {},
    },
    undo: {
      $unset: {},
    },
  };
  const userId = Meteor.userId();

  action.go.$set[field] = userId;
  action.undo.$unset[field] = '';
  if (doc[field] === userId)
    // swap go <=> undo
    return { go: action.undo, undo: action.go };

  return action;
};

Template.giftAction.events({
  'click .archive'(e) {
    e.preventDefault();
    doAction(this._id, {$set: {archived: true}}, {$set: {archived: false}});
  },
  'click .unarchive'(e) {
    e.preventDefault();
    doAction(this._id, {$set: {archived: false}}, {$set: {archived: true}});
  },
  'click .buy'(e) {
    e.preventDefault();
    const action = getAction(this, 'buyerId');
    doAction(this._id, action.go, action.undo);
  },
  'click .lock'(e) {
    e.preventDefault();
    const action = getAction(this, 'lockerId');
    doAction(this._id, action.go, action.undo);
  },
});
