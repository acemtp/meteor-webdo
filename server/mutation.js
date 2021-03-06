export default `
type Mutation {
  updateUserProfile (userProfile: UserProfileInput): User
  createGift (gift: GiftInput): Gift
  updateGift (_id: ID, gift: GiftInput): Gift
  giftArchive (_id: ID): Gift
  giftUnArchive (_id: ID): Gift
  giftLock (_id: ID): Gift
  giftBuy (_id: ID): Gift
  commentGift (_id: ID, visible: Boolean, message: String): Comment
}
`;
