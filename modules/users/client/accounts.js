
// import React, { Component } from 'react';
import { T9n } from 'meteor-accounts-t9n';
import fr from 'meteor-accounts-t9n/build/fr';

// import {makeExecutableSchema} from 'graphql-tools';
// import {loadSchema, getSchema} from 'graphql-loader';
// import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts';
// import typeDefs from './schema';
// import resolvers from './resolvers';

T9n.map('fr', fr);
T9n.setLanguage('fr');

// AutoForm.setDefaultTemplate('plain');

Accounts.ui.config({
  minimumPasswordLength: 2,
  passwordSignupFields: 'USERNAME_ONLY',
  homeRoutePath: '/home',
});

// AccountsTemplates.configure({
//   defaultLayoutType: 'blaze-to-react',
//   // defaultTemplate: 'fullPageAtForm', // default
//   defaultLayout: Layout,
//   defaultLayoutRegions: {},
//   // defaultContentRegion: 'main'
//   sendVerificationEmail: false,
//   focusFirstInput: true,
//   homeRoutePath: 'home',
//   onLogoutHook() { /* TODO: make react router go to '/' // Router.go('/'); */ },
// });

// // remove email fields
// const pwd = AccountsTemplates.removeField('password');
// AccountsTemplates.removeField('email');
// AccountsTemplates.addFields([
//   {
//     _id: 'username',
//     type: 'text',
//     displayName: 'username',
//     required: true,
//     minLength: 5,
//   },
//   pwd,
// ]);


// Load all accounts related resolvers and type definitions into graphql-loader
// initAccounts({
//   loginWithFacebook: false,
//   loginWithGoogle: false,
//   loginWithLinkedIn: false,
//   loginWithPassword: true,
// });

// Load all your resolvers and type definitions into graphql-loader
// loadSchema({ typeDefs, resolvers});

// Gets all the resolvers and type definitions loaded in graphql-loader
// const schema = getSchema();
// const executableSchema = makeExecutableSchema(schema);
