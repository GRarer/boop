import { CreateAccountRequest } from "boop-core";
import { LoginResponse } from "boop-core";
import { database, DatabaseError } from "./database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, login, LoginError } from "./auth";
import { throwBoopError } from "../util/handleAsync";

export async function createAccount(request: CreateAccountRequest): Promise<LoginResponse | DatabaseError.Conflict> {
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
      return DatabaseError.Conflict;
    } else {
      throw err;
    }
  }

  const loginResult = await login({ username: request.username, password: request.password });
  if (loginResult === LoginError.WrongPassword || loginResult === LoginError.UserNotFound) {
    // this should never happen because we just created an account using those credentials
    throwBoopError("Error: Failed to log in after registering.", 500);
  } else {
    return loginResult;
  }
}
