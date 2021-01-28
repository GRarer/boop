import { CreateAccountRequest, genderValues } from "boop-core";
import { LoginResponse } from "boop-core";
import { database } from "./database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, login, LoginError } from "./auth";

export async function createAccount(request: CreateAccountRequest): Promise<LoginResponse> {
  const accountUUID = uuidv4();
  // TODO validate age

  if (request.gender !== null && !genderValues.includes(request.gender)) {
    throw Error("unexpected format of gender string");
  }

  const passwordHash = await hashPassword(request.password);

  await database.addAccount({
    uuid: accountUUID,
    username: request.username,
    friendlyName: request.friendlyName,
    fullName: request.fullName,
    emailAddress: request.emailAddress,
    birthDate: request.birthDate,
    gender: request.gender,
    passwordHash: passwordHash,
  });
  const loginResult = await login({ username: request.username, password: request.password });
  if (loginResult === LoginError.WrongPassword || loginResult === LoginError.UserNotFound) {
    // this should never happen because we just created an account using those credentials
    throw Error("failed to authenticate after creating account");
  } else {
    return loginResult;
  }
}
