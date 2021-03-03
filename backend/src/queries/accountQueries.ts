import { CreateAccountRequest, Gender, genderValues, LoginResponse, UpdateAccountRequest,
  UserAccountResponse } from "boop-core";
import { database } from "../services/database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, login, } from "../services/auth";
import { throwBoopError } from "../util/handleAsync";
import { emailToGravatarURL } from "../services/avatars";

export async function createAccount(request: CreateAccountRequest): Promise<LoginResponse> {
  const accountUUID = uuidv4();
  const passwordHash = await hashPassword(request.password);

  const query =
      `INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email", "birth_date")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
  const params = [accountUUID, request.username, passwordHash, request.fullName, request.friendlyName,
    request.gender, request.emailAddress, request.birthDate];

  try {
    await database.query(query, params);
  } catch (err) {
    if (typeof err === "object" && err["code"] === "23505" && err["constraint"] === "users_username_key") {
      throwBoopError(`Username '${request.username}' is already taken.`, 409);
    } else {
      throw err;
    }
  }

  return await login({ username: request.username, password: request.password });
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

export async function getUserAccount(uuid: string): Promise<UserAccountResponse> {
  const query = `SELECT "username", "full_name", "friendly_name", "email", "birth_date", "gender"
   FROM users WHERE user_uuid=$1`;
  type UserRow = {
    username: string;
    full_name: string;
    friendly_name: string;
    email: string;
    birth_date: string;
    gender: Gender;
  };

  const rows: UserRow[] = (await database.query(query, [uuid]));

  if (rows.length === 0) {
    throwBoopError("Account Not Found", 404);
  }

  const result = rows[0];
  return {
    username: result.username,
    fullName: result.full_name,
    friendlyName: result.friendly_name,
    emailAddress: result.email,
    birthDate: result.birth_date,
    gender: result.gender,
    avatarUrl: emailToGravatarURL(result.email),
  };
}

export async function updatePassword(uuid: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  const query = 'UPDATE users SET bcrypt_hash=$1 WHERE user_uuid=$2;';
  await database.query(query, [passwordHash, uuid]);
}
