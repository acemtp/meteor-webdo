// import { getAction } from '../../imports/client/lib/action';
// import findUserNameBy from '../../imports/client/lib/user';
// import { Gifts, Comments } from '../../collections';

// Template.giftShow.helpers({
//   prio() {
//     return _.range(this.priority);
//   },
//   userName: findUserNameBy('ownerId'),
//   lockerName: findUserNameBy('lockerId'),
//   buyerName: findUserNameBy('buyerId'),
//   ownerName: findUserNameBy('ownerId'),
//   ownerIs(currentUser) {
//     return currentUser && this.ownerId === currentUser._id;
//   },
//   ownerIsNot(currentUser) {
//     return currentUser && this.ownerId !== currentUser._id;
//   },
//   isEditableBy(currentUser) {
//     const edit = currentUser && (this.ownerId === currentUser._id || this.suggested);
//     // console.log('isEditableBy', edit, this);
//     return edit;
//   },
//   publicComments() {
//     return Comments.find({ giftId: this._id, visible: true });
//   },
//   privateComments() {
//     return Comments.find({ giftId: this._id, visible: false });
//   },
//   createdAt() {
//     return moment(this.createdAt).format('LLLL');
//   },
//   Comments() {
//     return Comments;
//   },
// });

// Template.giftShow.events({
//   'click .archive'(e) {
//     e.preventDefault();
//     Gifts.update(this._id, { $set: { archived: true } });
//   },
//   'click .unarchive'(e) {
//     e.preventDefault();
//     Gifts.update(this._id, { $set: { archived: false } });
//   },
//   'click .buy'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'buyerId');
//     Gifts.update(this._id, action.go);
//   },
//   'click .lock'(e) {
//     e.preventDefault();
//     const action = getAction(this, 'lockerId');
//     Gifts.update(this._id, action.go);
//   },
// });

// TODO in reat
// template(name="giftShow")
// .gift
//   h1= title
//   if isEditableBy currentUser
//     a.button.edit(href="{{pathFor 'gift.update'}}")
//       i Edit
//     if archived
//       button.unarchive
//         i D&eacute;-archiver
//     else
//       button.archive
//         i Archiver
//   else
//     button.lock
//       i
//       if lockerId
//         | par {{lockerName}}
//       else
//         | Réserver
//     button.buy
//       i
//       if buyerId
//         | par {{buyerName}}
//       else
//         | Acheter

//   .gift-profile
//     .gift-section.gift-picture
//       .gift-image
//         if image
//           +giftImage
//         else
//           img(src="/photo/gift-default.png", alt=title)
//       .stars
//         each prio
//           span
//       a.user-name(href="{{pathFor 'user' _id=ownerId}}") {{userName}}
//     .gift-section.gift-description
//       .padding
//         p Créé le : {{createdAt}}
//       if link
//         p
//           a(href=link, target="_blank") Visiter le site marchand
//       +markdown
//         {{detail}}
//   .all-comments
//     if ownerIsNot currentUser
//       .comments.private
//         each privateComments
//           +giftComment
//         h4 Commentaire
//         .panel-body
//           +autoForm collection=Comments id="insertPrivateComment" type="insert"
//             +afFieldInput name="message"
//             +afFieldInput name="visible" value="false"
//             +afFieldInput name="giftId" value=../_id
//             br
//             button(type="submit") Envoyer

//     .comments
//       each publicComments
//         +giftComment
//       .warning
//         h4 Ce message sera visible par <b>{{ownerName}}</b>
//       div
//         +autoForm collection=Comments id="insertPublicComment" type="insert"
//           +afFieldInput name="message"
//           +afFieldInput name="visible" value="true"
//           +afFieldInput name="giftId" value=../_id
//           br
//           button(type="submit") Envoyer

