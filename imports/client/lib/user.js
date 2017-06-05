export const findUserNameBy = (field) =>
  function findUserNameByField() {
    try {
      return Meteor.users.findOne(this[field]).username;
    } catch (e) {
      console.log('can not find user', this[field], 'with field', field);
      return 'Utilisateur inconnu';
    }
  };
