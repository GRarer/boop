import { CreateAccountRequest } from "boop-core";
import { LoginResponse } from "boop-core";
import { database, } from "./database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, login, } from "./auth";
import { throwBoopError } from "../util/handleAsync";

export async function createAccount(request: CreateAccountRequest): Promise<LoginResponse> {
  const accountUUID = uuidv4();
  const passwordHash = await hashPassword(request.password);

  const query =
      `INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email", "birth_date",
      "is_admin") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
  const params = [accountUUID, request.username, passwordHash, request.fullName, request.friendlyName,
    request.gender, request.emailAddress, request.birthDate, false];

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
