import { CreateAccountRequest, genderValues, UpdateAccountRequest } from "boop-core";
import { LoginResponse, UserAccountResponse } from "boop-core";
import { database } from "./database";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, login } from "./auth";

class AccountsManager { 

  constructor() {
  }

  async createAccount(request: CreateAccountRequest): Promise<LoginResponse> {
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
    if (loginResult === "Wrong Password" || loginResult === "User Not Found") {
      // this should never happen because we just created an account using those credentials
      throw Error("failed to authenticate after creating account");
    } else {
      return loginResult;
    }
  }

  async updateAccount(request: UpdateAccountRequest, uuid: string): Promise<void> { // TODO change the login response
    if (request.gender !== null && !genderValues.includes(request.gender)) {
      throw Error("unexpected format of gender string");
    }

    await database.updateAccount({
      uuid: uuid,
      username: request.username,
      friendlyName: request.friendlyName,
      fullName: request.fullName,
      emailAddress: request.emailAddress,
      birthDate: request.birthDate,
      gender: request.gender
    });
  }

  async getAccount(uuid: string): Promise<UserAccountResponse | "no user found matching uuid"> {
    const userAccountInfo = await database.getUserAccount(uuid);
    if (userAccountInfo !== undefined) {
      return userAccountInfo;
    }

    return "no user found matching uuid"
  }
}

export const accountsManager: AccountsManager = new AccountsManager();
