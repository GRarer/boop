// api datatypes for friends and profile

export type ProfileSummary = {
  username: string;
  fullName: string;
  // TODO include profile image
};

export type GetFriendsResult = {
  currentFriends: ProfileSummary[];
  pendingFriendRequestsToUser: ProfileSummary[];
  pendingFriendRequestsFromUser: ProfileSummary[];
};
