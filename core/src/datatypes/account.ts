// data for account creation

import { Gender } from "./gender";
import { ContactMethod, PrivacyLevel, ExportedProfileSummary } from "./profile";

export type CreateAccountRequest = {
  username: string;
  fullName: string;
  password: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string; // ISO format date string (e.g. 2020-01-16)
  gender: Gender;
  privacyLevel: PrivacyLevel;
  profileShowAge: boolean;
  profileShowGender: boolean;
  profileBio?: string;
  pushSubscription?: PushSubscriptionJSON;
  contactMethods?: ContactMethod[];
};

export type AccountDataResponse = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
  privacyLevel: PrivacyLevel;
  profileShowAge: boolean;
  profileShowGender: boolean;
  statusMessage: string;
  doNotDisturb: boolean;
  profileBio?: string;
  avatarUrl: string;
  contactMethods?: ContactMethod[];
  friends?: ExportedProfileSummary[];
  incomingRequests?: ExportedProfileSummary[];
  outgoingRequests?: ExportedProfileSummary[];
};

export type UpdateAccountRequest = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
};

export type CurrentSettingsResponse = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
  avatarUrl: string;
  privacyLevel: PrivacyLevel;
  profileShowAge: boolean;
  profileShowGender: boolean;
};

export type UpdatePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type UpdatePrivacyRequest = {
  privacyLevel: PrivacyLevel;
  profileShowAge: boolean;
  profileShowGender: boolean;
};
