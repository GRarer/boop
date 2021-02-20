// api datatypes for friends and profile

import { ContactMethod } from "./contacts";

export type ProfileSummary = {
  uuid: string;
  username: string;
  fullName: string;
  statusMessage: string;
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

export type StartChatResult = {
  username: string;
  friendlyName: string;
  // TODO include profile image
  contactMethods: ContactMethod[];
};
