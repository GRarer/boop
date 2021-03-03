// data for account creation

import { Gender } from "./gender";

export type CreateAccountRequest = {
  username: string;
  fullName: string;
  password: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string; // ISO format date string (e.g. 2020-01-16)
  gender: Gender;
};

export type UpdateAccountRequest = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
};

export type UserAccountResponse = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
  avatarUrl: string,
};

export type UpdatePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};


