import {SchemaMutations as Auth} from 'meteor/nicolaslopezj:apollo-accounts';

export default `
type Mutation {
 ${Auth()}
 updateUserProfile (userProfile: UserProfileInput): User
 createGift (gift: GiftInput): Gift
 updateGift (giftId: String, gift: GiftInput): Gift
}
`;

