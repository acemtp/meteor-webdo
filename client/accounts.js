T9n.language = 'fr';
//  T9n.missingPrefix = ">";
//  T9n.missingPostfix = "<";

AutoForm.setDefaultTemplate('materialize');

Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

AccountsTemplates.configure({
  sendVerificationEmail: false,
  focusFirstInput: true,
  homeRoutePath: 'home',
  onLogoutHook: function () { Router.go('/'); },
});

// remove email fields
var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: 'username',
      type: 'text',
      displayName: 'username',
      required: true,
      minLength: 5,
  },
  pwd
]);
