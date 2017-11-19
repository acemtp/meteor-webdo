import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';

SimpleSchema.extendOptions(['autoform']);

export const Gifts = new Mongo.Collection('gifts');
export const Comments = new Mongo.Collection('comments');
export const subs = new SubsManager();

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
    optional: true,
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
      return undefined;
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
      return undefined;
    },
    denyUpdate: true,
  },
}, { tracker: Tracker });

Gifts.allow({
  insert: () => false,
  update: () => false,
});

SchemaBridge.schema(Gifts.simpleSchema(), 'Gift', { wrap: false });

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
      return undefined;
    },
    denyUpdate: true,
  },
  author: {
    type: String,
    autoValue() {
      const { username } = Meteor.users.findOne(this.userId);
      if (this.isInsert) return username;
      if (this.isUpsert) return { $setOnInsert: username };
      this.unset();
      return undefined;
    },
    denyUpdate: true,
  },
  authorId: {
    type: String,
    autoValue() {
      if (this.isInsert) return this.userId;
      if (this.isUpsert) return { $setOnInsert: this.userId };
      this.unset();
      return undefined;
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
}, { tracker: Tracker });

Comments.allow({
  insert: () => Meteor.userId(),
  update: () => Meteor.userId(),
});

export const profile = new SimpleSchema({
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
}, { tracker: Tracker });

