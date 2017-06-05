import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

Gifts = new Mongo.Collection('gifts');
Comments = new Mongo.Collection('comments');
moment.locale('fr');
subs = new SubsManager();

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
