import express from "express";
import { failsPasswordRequirement, failsUsernameRequirement, LoginRequest, LoginResponse,
  sessionTokenHeaderName } from "boop-core";
import { login, LoginError, userUuidFromReq } from "../services/auth";
import { createAccount } from "../services/userAccounts";
import { CreateAccountRequest, minYearsAgo, isGender } from "boop-core";
import { DatabaseError } from "../services/database";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const accountsRouter = express.Router();
import { getAuthInfo, removeSession } from "../queries/authQueries";

accountsRouter.post('/login', handleAsync(async (req, res) => {
  const body: LoginRequest = req.body;
  const result = await login(body);
  if (result === LoginError.UserNotFound) {
    throwBoopError("User Not Found.", 404);
  } else if (result === LoginError.WrongPassword) {
    throwBoopError("Incorrect Password", 401);
  } else {
    const loginResponse: LoginResponse = result;
    res.send(loginResponse);
    return;
  }
}));

accountsRouter.post('/logout', handleAsync(async (req, res) => {
  const token: string | undefined = req.header(sessionTokenHeaderName);
  if (token !== undefined) {
    await removeSession(token);
  }
  res.send();
}));

accountsRouter.post('/register', handleAsync(async (req, res) => {
  const body: CreateAccountRequest = req.body;
  // validate username and password
  const passwordOrUsernameIssue: string | undefined
    = failsUsernameRequirement(body.username) ?? failsPasswordRequirement(body.password);
  if (passwordOrUsernameIssue) {
    throwBoopError(passwordOrUsernameIssue, 401);
  }

  // validate age and gender
  try {
    const birthDate: Date = new Date(body.birthDate);
    if (!minYearsAgo(birthDate, 13)) {
      throwBoopError("Age must be at least 13 years.", 403);
    }
  } catch (reason) {
    throwBoopError("Invalid date format.", 400);
  }
  if (!isGender(body.gender)) {
    throwBoopError("Invalid gender format.", 400);
  }

  const result = await createAccount(body);
  if (result === DatabaseError.Conflict) {
    throwBoopError(`Username ${body.username} is already taken.`, 409);
  } else {
    const loginResponse: LoginResponse = result;
    res.send(loginResponse);
  }
}));

accountsRouter.get('/exists', handleAsync(async (req, res) => {
  const username: unknown = req.query.username;
  if (typeof username !== "string") {
    throwBoopError("Error: Invalid username query.", 400);
  }
  const result = await getAuthInfo(username);
  if (result === undefined) {
    res.send(false);
    return;
  } else {
    res.send(true);
    return;
  }
}));

// tells whether the session header corresponds to a valid session
accountsRouter.get('/sessionValid', handleAsync(async (req, res) => {
  const session = await userUuidFromReq(req);
  res.send((session !== undefined));
}));
