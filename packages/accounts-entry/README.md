---
layout: default
username: Differential
repo: accounts-entry
desc: Meteor sign up and sign in pages.
version: 1.0.2

---

**NOTE:** Version 0.8.0 and higher or accounts-entry requires that you use Meteor 0.8.2 or higher. You also need to pass the pause param to AccountsEntry.signedInRequired if you are using it. If you were using master and extraSignUpFields, please review the docs for changes in the 0.8.0 release.

# accounts-entry

[![Build Status](https://travis-ci.org/Differential/accounts-entry.png)](https://travis-ci.org/Differential/accounts-entry)

accounts-entry is a meteorite package that relies on Iron Router and provides an
alternative interface to accounts-ui, with whole pages for sign up
and sign in.

We wanted something to work with that used [Iron Router](https://github.com/EventedMind/iron-router),
[Bootstrap 3](https://github.com/mangasocial/meteor-bootstrap-3), and didn't require the forcing of
the dropdown box that didn't seem to be easily styled. But we love the ease of adding more packages like `accounts-facebook` or `accounts-twitter`, so we fully support the OAuth packages by adding buttons to let people sign-up/sign-in with those services if you add them.  By default, accounts-entry doesn't offer email/password login functionality.  If you `mrt add accounts-password`, accounts-entry will offer your users the option to sign-up/sign-in with a username and password.

![Example](http://github.differential.io/accounts-entry/images/Example.png)

Examples of the package in action (check out the sign up or sign in
links):

* [https://linklyapp.com/](https://linklyapp.com/)
* [https://carp.io/](https://carp.io/)
* [https://getliquid.io/](https://getliquid.io/)
* [http://support.unpolishedcr.com/](http://support.unpolishedcr.com/)
* Email team@differential.io to add your project to the list.

[Changelog](https://github.com/BeDifferential/accounts-entry/blob/master/CHANGELOG.md)

## Compatibility

accounts-entry is presently compatible with Iron Router 0.6.0 and above. Since meteorite doesn't support semantic version locking, we are currently pegged to 0.6.4 of Iron-router.

## Getting started

Run:

```
mrt add accounts-entry
```

You can install the `accounts-ui` package, as it is still used for OAuth setup.

## Provided routes

You will get routes and the necessary templates for:

```
/sign-in
/sign-out
/sign-up
/forgot-password
```

{% assign special = '{{> accountButtons}}' %}
You can then either add links to those directly, or use the `{{ special }}` helper we provide to give you the apppropriate links for signed-in/signed-out users.  The `{{ special }}` helper will display a sign-out link and the user's email address when they are signed-in.

## Ensuring signed in users for routes

Simply add the following line of code: `AccountsEntry.signInRequired(this);` to require users be signed in for a route and to redirect the user to the included sign-in page and stop any rendering. Accounts-entry also tracks where the user was trying to go and will route them back after sign in.

Here is an Iron-Router route example:

````js
  this.route('userProfile', {
    path: '/profile',
    template: 'profile',
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    }
  });
````

## Setting up password login

Use `mrt add accounts-password` if you want to have email/username login authentication options. This is now optional and will only display if installed. You need to configure an OAuth option if you choose not to have password logins.

## Setting up OAuth/social integrations

{% assign loginButtons = '{{> loginButtons}}' %}
Use `accounts-ui` to configure your social/OAuth integrations (or manually create records in your database, if you have those skills). We don't have the nice instructions on how to configure the services built into this package, but if you choose to use <code>{{ loginButtons }}</code> elsewhere in your application (even temporarily), you can configure OAuth logins there.

## Configuration

### Signup codes

We have added support for a signupCode in case you want to have a special code to handout to keep signups at a pace you want. This code is checked if you turn on the client and server side options listed below.

**The signup code is only checked for accounts-password logins, so know that OAuth logins will still allow people in.**

### In CLIENT code only

Since this is a young package, we are maintaining compatibility with accounts-ui (so if in a pinch accounts-entry is broken for you, you could easily switch to accounts-ui). We also use the UI for oauth configs from accounts-ui.

```js
  Meteor.startup(function () {
    AccountsEntry.config({
      logo: 'logo.png'                  // if set displays logo above sign-in options
      privacyUrl: '/privacy-policy'     // if set adds link to privacy policy and 'you agree to ...' on sign-up page
      termsUrl: '/terms-of-use'         // if set adds link to terms  'you agree to ...' on sign-up page
      homeRoute: '/'                    // mandatory - path to redirect to after sign-out
      dashboardRoute: '/dashboard'      // mandatory - path to redirect to after successful sign-in
      profileRoute: 'profile'
      passwordSignupFields: 'EMAIL_ONLY'
      showSignupCode: true
      showOtherLoginServices: true      // Set to false to hide oauth login buttons on the signin/signup pages. Useful if you are using something like accounts-meld or want to oauth for api access
      extraSignUpFields: [{             // Add extra signup fields on the signup page
        field: "name",                           // The database property you want to store the data in
        name: "This Will Be The Initial Value",  // An initial value for the field, if you want one
        label: "Full Name",                      // The html lable for the field
        placeholder: "John Doe",                 // A placeholder for the field
        type: "text",                            // The type of field you want
        required: true                           // Adds html 5 required property if true
       }]
    });
  });
```

### In SERVER code only

Call `AccountsEntry.config` with a hash of optional configuration:

```js
  Meteor.startup(function () {
    AccountsEntry.config({
      signupCode: 's3cr3t',         // only restricts username+password users, not OAuth
      defaultProfile:
          someDefault: 'default'
    });
  });
```

*Note: only set a signupCode if you want to use that feature.*

The default configuration includes:

```js
  wrapLinks: true                   // wraps accounts-entry links in <li> for bootstrap compatability purposes
  homeRoute: '/'                    // MUST BE SET - redirect to this path after sign-out
  dashboardRoute: '/dashboard'      // MUST BE SET - redirect to this path after sign-in
```

Remember, you must provide a route for home (used when signing out) and
dashboard (used after signing in).

## Interested in building a quick meteor app that starts with Accounts-Entry?

We've created a [meteor-boilerplate repo](http://github.differential.io/meteor-boilerplate/) that you can clone as a starting point for an app.  It follows all our standards that we use for building apps for our clients.
