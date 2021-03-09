import { Gender } from "./gender";

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

export type Profile = {
  uuid: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  statusMessage: string;
  contactMethods: ContactMethod[];
  friends: ProfileSummary[];
  gender: Gender;
  birthDate: string | null;
};

// the relationship between the viewer and the owner of a profile determines what options are shown
// e.g. "edit" or "send friend request"
export type ProfileViewerRelation = {
  viewerLoggedIn: boolean;
  self: boolean;
  friend: boolean;
  pendingFriendRequest? : "incoming" | "outgoing";
};

export type ProfileResponse = {
  visible: true;
  profile: Profile;
  // determines whether to show "edit" or "send friend request" buttons
  viewerRelation: ProfileViewerRelation;
} | {
  visible: false;
  reason: string;
};


export type StartChatResult = {
  username: string;
  friendlyName: string;
  avatarUrl: string;
  contactMethods: ContactMethod[];
};

// private profiles are visible to friends and friends-of-friends
// restricted profiles are visible only to friends, which prevents friends-of-friends from being matched
export type PrivacyLevel = "public" | "private" | "restricted";

// information for showing the "edit profile" screen
export type ProfileEditResponse = {
  username: string;
  bio: string;
  statusMessage: string;
};

export type UpdateProfileTextRequest = {
  bio: string;
  statusMessage: string;
};
