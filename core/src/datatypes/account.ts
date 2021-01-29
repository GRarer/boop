// data for account creation

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
}

export type UserAccountResponse = {
  username: string;
  fullName: string;
  friendlyName: string;
  emailAddress: string;
  birthDate: string;
  gender: Gender;
}

// user gender options. an undefined value corresponds to "prefer not to say"
export type Gender = "Female" | "Male" | "Nonbinary" | null;

export const genderValues: Gender[] = ["Female", "Male", "Nonbinary"];

export function isGender(x: unknown): x is Gender {
  return (x === null) || (genderValues as unknown[]).includes(x);
}
