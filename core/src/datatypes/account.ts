// data for account creation

import { Gender } from "./gender";
import { PrivacyLevel } from "./profile";

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
