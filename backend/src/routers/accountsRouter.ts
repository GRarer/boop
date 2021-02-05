import express from "express";
import { failsPasswordRequirement, failsUsernameRequirement, LoginRequest, LoginResponse,
  sessionTokenHeaderName, UpdatePasswordRequest, UpdateAccountRequest } from "boop-core";
import { login, userUuidFromReq, verifyPassword } from "../services/auth";
import { createAccount, changePassword, updateAccount, getAccount } from "../services/userAccounts";
import { CreateAccountRequest, minYearsAgo, isGender } from "boop-core";
import { handleAsync, throwBoopError } from "../util/handleAsync";
import { getAuthInfo, removeSession } from "../queries/authQueries";

export const accountsRouter = express.Router();

accountsRouter.post('/login', handleAsync(async (req, res) => {
  const body: LoginRequest = req.body;
  const loginResponse: LoginResponse = await login(body);
  res.send(loginResponse);
  return;
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
  // validate username and password format
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

  const loginResponse: LoginResponse = await createAccount(body);
  res.send(loginResponse);
}));

accountsRouter.get('/info', handleAsync(async (req, res) => { // TODO make this a query string
  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    res.status(401).send('unauthorized user');
    return;
  }

  const result = await getAccount(uuid);
  if (result === undefined) {
    throwBoopError("User not found", 404);
    return;
  }

  res.send(result);
}));

accountsRouter.put('/edit', handleAsync(async (req, res) => {
  const body: UpdateAccountRequest = req.body;

  const usernameIssue: string | undefined = failsUsernameRequirement(body.username);
  if (usernameIssue) {
    res.status(401).send(usernameIssue);
    return;
  }

  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    res.status(401).send('unauthorized user');
    return;
  }

  try {
    const birthDate: Date = new Date(body.birthDate);
    if (!minYearsAgo(birthDate, 13)) {
      res.status(403).send("age must be at least 13 years");
      return;
    }
  } catch (reason) {
    res.status(400).send("invalid date format");
    return;
  }
  if (!isGender(body.gender)) {
    res.status(400).send("invalid gender format");
    return;
  }

  updateAccount(body, uuid).then(() => {
    res.send(body);
  }).catch((err) => {
    if (err["code"] === "23505" && err["constraint"] === "users_username_key") {
      res.status(409).send(`username ${body.username} is already taken.`);
    } else {
      res.sendStatus(500);
    }
  });
}));

accountsRouter.put('/password', handleAsync(async (req, res) => {
  const body: UpdatePasswordRequest = req.body;
  const passwordIssue = failsPasswordRequirement(body.newPassword);
  if (passwordIssue) {
    throwBoopError('Password invalid', 401);
    return;
  }

  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    throwBoopError('User not authorized', 401);
    return;
  }

  const result = await verifyPassword(body.oldPassword, uuid);
  if (!result) {
    throwBoopError('Password incorrect', 401);
    return;
  }

  changePassword(body.newPassword, uuid).then(() => {
    res.send({ 'status': 'password updated' });
  }).catch((err) => {
    res.sendStatus(500);
  });
}));

// returns boolean indicating whether the given username is already taken
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
