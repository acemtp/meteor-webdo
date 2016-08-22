Gifts = new Mongo.Collection('gifts');
Comments = new Mongo.Collection('comments');
moment.locale('fr');

Gifts.attachSchema({
  title: {
    type: String,
    label: 'Titre',
    max: 149,
  },
  detail: {
    type: String,
    label: 'Détail',
  },
  link: {
    type: String,
    label: 'Lien',
    max: 1024,
    optional: true,
  },
  image: {
    type: String,
    label: 'Image',
    max: 1024,
    optional: true,
  },
  priority: {
    type: Number,
    label: 'Priorité',
    min: 1,
    max: 5,
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: 'A quel point souhaite tu ce cadeau?',
      },
    },
  },
  ownerId: {
    type: String,
    label: 'Pour',
    autoform: {
      type: 'select',
      afFieldInput: {
        firstOption: '',
      },
    },
  },
  createdAt: {
    type: Date,
    label: 'Date de création',
    autoValue() {
      if (this.isInsert) return new Date();
      if (this.isUpsert) return { $setOnInsert: new Date() };
      this.unset();
    },
    denyUpdate: true,
  },
  lockerId: {
    type: String,
    optional: true,
  },
  buyerId: {
    type: String,
    optional: true,
  },
  archived: {
    type: Boolean,
    defaultValue: false,
  },
  suggested: {
    type: Boolean,
    autoValue() {
      const value = Meteor.userId() !== this.field('ownerId').value;
      if (this.isInsert) return value;
      if (this.isUpsert) return { $setOnInsert: value };
      this.unset();
    },
    denyUpdate: true,
  },
});

Gifts.allow({
  insert: Meteor.userId,
  update: Meteor.userId,
});

Comments.attachSchema({
  giftId: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  message: {
    type: String,
    max: 1024,
    autoform: {
      afFieldInput: {
        rows: 4,
      },
    },
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) return new Date();
      if (this.isUpsert) return { $setOnInsert: new Date() };
      this.unset();
    },
    denyUpdate: true,
  },
  author: {
    type: String,
    autoValue() {
      const username = Meteor.users.findOne(this.userId).username;
      if (this.isInsert) return username;
      if (this.isUpsert) return { $setOnInsert: username };
      this.unset();
    },
    denyUpdate: true,
  },
  authorId: {
    type: String,
    autoValue() {
      if (this.isInsert) return this.userId;
      if (this.isUpsert) return { $setOnInsert: this.userId };
      this.unset();
    },
    denyUpdate: true,
  },
  visible: {
    type: Boolean,
    autoform: {
      afFieldInput: {
        type: 'hidden',
      },
    },
  },
  removed: {
    type: Boolean,
    defaultValue: false,
  },
});

Comments.allow({
  insert: Meteor.userId,
  update: Meteor.userId,
});

profile = new SimpleSchema({
  profile: {
    type: Object,
  },
  'profile.description': {
    type: String,
    label: 'Votre Description',
    autoform: {
      rows: 10,
    },
    max: 1000,
  },
  'profile.like': {
    type: String,
    label: "J'aime",
    autoform: {
      rows: 10,
    },
    max: 1000,
  },
  'profile.dislike': {
    type: String,
    label: "J'aime pas",
    autoform: {
      rows: 10,
    },
    max: 1000,
  },
  'profile.avatar': {
    type: String,
    label: 'Le lien vers votre photo',
    max: 1000,
  },
});

Router.configure({
  loadingTemplate: 'loading',
});

// routes

Router.route('/user/update', {
  name: 'user.update',
  waitOn() {
    return Meteor.subscribe('user.profile');
  },
  data() {
    return Meteor.users.findOne(Meteor.userId());
  },
});

Router.route('/user/:_id/gift/create', {
  name: 'gift.create',
  waitOn() {
    return Meteor.subscribe('users');
  },
});

Router.route('/user/:_id/gifts', {
  name: 'user.gifts',
  waitOn() {
    return Meteor.subscribe('user.gifts', this.params._id);
  },
  data() {
    const archived = this.params.query.archived === '1';
    const ownerId = this.params._id;
    const sort = ownerId === Meteor.userId()
      ? { priority: -1 }
      : { buyerId: 1, lockerId: 1, priority: -1, title: 1 };

    return {
      // used to show link to archived or not archived gifts
      archived,
      // to get the right id for pathFor
      _id: ownerId,
      user: Meteor.users.findOne(ownerId),
      gifts: Gifts.find({ archived, ownerId }, { sort }),
    };
  },
});

Router.route('/gift/:_id', {
  name: 'gift.show',
  waitOn() {
    return [
      Meteor.subscribe('gift.show', this.params._id),
      Meteor.subscribe('gift.comments', this.params._id),
      Meteor.subscribe('users'),
    ];
  },
  data() {
    const gift = Gifts.findOne(this.params._id);
    if (gift) gift.comments = Comments.find({giftId: this.params._id});
    return gift;
  },
});

Router.route('/gift/:_id/update', {
  name: 'gift.update',
  waitOn() {
    return [Meteor.subscribe('gift.show', this.params._id), Meteor.subscribe('users')];
  },
  data() {
    return Gifts.findOne(this.params._id);
  },
});

Router.route('/users', {
  name: 'users',
  waitOn() {
    return Meteor.subscribe('users');
  },
});

Router.configure({
  layoutTemplate: 'masterLayout',
});
