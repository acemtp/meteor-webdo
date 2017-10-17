export default function findUserNameBy(field, prop) {
  return function findUserNameByField() {
    const data = prop ? this.props[prop] : this;
    try {
      return Meteor.users.findOne(data[field]).username;
    } catch (e) {
      console.log('can not find user', this[field], 'with field', field);
      return 'Utilisateur inconnu';
    }
  };
}
