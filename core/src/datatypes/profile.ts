// api datatypes for friends and profile

export type ProfileSummary = {
  uuid: string;
  username: string;
  fullName: string;
  // TODO include profile image
};

export type GetFriendsResult = {
  currentFriends: ProfileSummary[];
  pendingFriendRequestsToUser: ProfileSummary[];
};

export type AnswerFriendRequest = {
  friendUUID: string;
  accept: boolean;
};
