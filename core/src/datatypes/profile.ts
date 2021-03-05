// api datatypes for friends and profile
export type ProfileSummary = {
  uuid: string;
  username: string;
  fullName: string;
  statusMessage: string;
  avatarUrl: string;
};

export type GetFriendsResult = {
  currentFriends: ProfileSummary[];
  pendingFriendRequestsToUser: ProfileSummary[];
};

export type AnswerFriendRequest = {
  friendUUID: string;
  accept: boolean;
};

export type ContactMethod = {
  platform: string;
  contactID: string;
};

export type StartChatResult = {
  username: string;
  friendlyName: string;
  avatarUrl: string;
  contactMethods: ContactMethod[];
};
