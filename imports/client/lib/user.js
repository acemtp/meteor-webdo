export default function findUserNameBy(field, prop) {
  return function findUserNameByField() {
    const data = prop ? this.props[prop] : this;
    try {
      const user = Meteor.users.findOne(data[field]);
      return user ? user.username : 'Utilisateur inconnu';
    } catch (e) {
      console.log('can not find user', this[field], 'with field', field);
      return 'Utilisateur inconnu';
    }
  };
}
