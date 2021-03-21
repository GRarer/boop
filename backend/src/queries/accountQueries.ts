import { CreateAccountRequest, Gender, genderValues, UpdateAccountRequest,
  CurrentSettingsResponse, PrivacyLevel } from "boop-core";
import { database } from "../services/database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from "../services/auth";
import { throwBoopError } from "../util/handleAsync";
import { emailToGravatarURL } from "../services/avatars";
import { isWebpushSubscription } from "../services/pushManager";
import pgFormat from "pg-format";

export async function createAccount(user: CreateAccountRequest): Promise<void> {
  const accountUUID = uuidv4();
  const passwordHash = await hashPassword(user.password);

  try {
    await database.doTransaction(async (client) => {
      // create account
      const accountCreationQuery =
      `INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email",
      "birth_date", "profile_privacy_level", "profile_show_age", "profile_show_gender", "profile_bio")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;
      const accountParams = [
        accountUUID, user.username, passwordHash, user.fullName, user.friendlyName, user.gender, user.emailAddress,
        user.birthDate, user.privacyLevel, user.profileShowAge, user.profileShowGender, user.profileBio
      ];
      await client.query(accountCreationQuery, accountParams);
      // set push subscription if present
      const subscription = user.pushSubscription;
      if (isWebpushSubscription(subscription)) {
        await client.query(
          `UPDATE USERS SET vapid_subs = array_append(vapid_subs, $1)
          where user_uuid = $2;`,
          [subscription, accountUUID]
        );
      }
      // set contact methods
      await client.query(pgFormat(
        'INSERT INTO contact_methods (user_uuid, platform, contact_id) VALUES %L;',
        user.contactMethods.map(method => [accountUUID, method.platform, method.contactID])
      ));
    });
  } catch (err) {
    if (typeof err === "object" && err["code"] === "23505" && err["constraint"] === "users_username_key") {
      throwBoopError(`Username '${user.username}' is already taken.`, 409);
    } else {
      throw err;
    }
  }
}


export async function updateAccount(values: UpdateAccountRequest,
  uuid: string): Promise<void> {
  if (values.gender !== null && !genderValues.includes(values.gender)) {
    throw Error("unexpected format of gender string");
  }

  const query =
  `UPDATE users SET username=$1, full_name=$2, friendly_name=$3, gender=$4, email=$5, birth_date=$6
  WHERE user_uuid=$7;`;
  try {
    await database.query(query, [values.username, values.fullName,
      values.friendlyName, values.gender, values.emailAddress, values.birthDate, uuid]);
  } catch (err) {
    if (err["code"] === "23505" && err["constraint"] === "users_username_key") {
      throwBoopError(`Username '${values.username}' is already taken.`, 409);
    } else {
      throw err;
    }
  }

}

export async function deleteAccount(uuid: string): Promise<void> {
  const query = `DELETE FROM users WHERE user_uuid=$1`;

  await database.query(query, [uuid]); // Any error should be thrown
}

export async function getCurrentSettings(uuid: string): Promise<CurrentSettingsResponse> {
  const query =
  `SELECT "username", "full_name", "friendly_name", "email", "birth_date", "gender",
    "profile_privacy_level", "profile_show_age","profile_show_gender"
    FROM users WHERE user_uuid=$1`;
  type UserRow = {
    username: string;
    full_name: string;
    friendly_name: string;
    email: string;
    birth_date: string;
    gender: Gender;
    profile_privacy_level: PrivacyLevel;
    profile_show_age: boolean;
    profile_show_gender: boolean;
  };

  const rows: UserRow[] = (await database.query(query, [uuid]));
  const result = rows[0] ?? throwBoopError("Account Not Found", 404);

  return {
    username: result.username,
    fullName: result.full_name,
    friendlyName: result.friendly_name,
    emailAddress: result.email,
    birthDate: result.birth_date,
    gender: result.gender,
    avatarUrl: emailToGravatarURL(result.email),
    privacyLevel: result.profile_privacy_level,
    profileShowAge: result.profile_show_age,
    profileShowGender: result.profile_show_gender
  };
}

export async function updatePassword(uuid: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  const query = 'UPDATE users SET bcrypt_hash=$1 WHERE user_uuid=$2;';
  await database.query(query, [passwordHash, uuid]);
}
