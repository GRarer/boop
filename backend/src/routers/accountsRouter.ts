import express from "express";
import {
  failsPasswordRequirement, failsUsernameRequirement, LoginRequest, LoginResponse, sessionTokenHeaderName,
  UpdatePasswordRequest, UpdateAccountRequest, CurrentSettingsResponse, UpdatePrivacyRequest
} from "boop-core";
import { authenticateUUID, login, userUuidFromReq } from "../services/auth";
import { CreateAccountRequest, minYearsAgo, isGender } from "boop-core";
import { handleAsync, throwBoopError } from "../util/handleAsync";
import { getAuthInfoByUsername, getPasswordHashByUuid, removeSession } from "../queries/authQueries";
import bcrypt from "bcrypt";
import {
  createAccount, getCurrentSettings, updateAccount, updatePassword, deleteAccount
} from "../queries/accountQueries";
import { database } from "../services/database";
import { DateTime } from "luxon";

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
  let meetsMinimumAge = false;
  try {
    const birthDate: Date = DateTime.fromISO(body.birthDate).toJSDate();
    if (minYearsAgo(birthDate, 13)) {
      meetsMinimumAge = true;
    }
  } catch (reason) {
    throwBoopError("Invalid date format", 400);
  }
  if (!meetsMinimumAge) {
    throwBoopError("You must be at least 13 years old", 403);
  }

  if (!isGender(body.gender)) {
    throwBoopError("Invalid gender format.", 400);
  }

  await createAccount(body);
  const loginResponse: LoginResponse = await login({ username: body.username, password: body.password });
  res.send(loginResponse);
}));

accountsRouter.get('/current_settings', handleAsync(async (req, res) => {
  const uuid = await authenticateUUID(req);
  const result: CurrentSettingsResponse = await getCurrentSettings(uuid);
  res.send(result);
}));

accountsRouter.delete('/delete', handleAsync(async (req, res) => {
  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    throwBoopError("Unauthenticated user", 401);
  }

  await deleteAccount(uuid);
  res.send();
}));

accountsRouter.put('/edit', handleAsync(async (req, res) => {
  const body: UpdateAccountRequest = req.body;

  const usernameIssue: string | undefined = failsUsernameRequirement(body.username);
  if (usernameIssue) {
    throwBoopError(usernameIssue, 401);
  }

  const uuid = await authenticateUUID(req);

  let meetsMinimumAge = false;
  try {
    const birthDate: Date = DateTime.fromISO(body.birthDate).toJSDate();
    if (minYearsAgo(birthDate, 13)) {
      meetsMinimumAge = true;
    }
  } catch (reason) {
    throwBoopError("Invalid date format", 400);
  }
  if (!meetsMinimumAge) {
    throwBoopError("You must be at least 13 years old", 403);
  }

  if (!isGender(body.gender)) {
    throwBoopError("Invalid gender format", 400);
  }

  await updateAccount(body, uuid);
  res.send();
}));

accountsRouter.put('/password', handleAsync(async (req, res) => {
  const body: UpdatePasswordRequest = req.body;
  const passwordIssue = failsPasswordRequirement(body.newPassword);
  if (passwordIssue) {
    throwBoopError('Password invalid', 401);
  }

  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    throwBoopError('User not authorized', 401);
  }

  const userHash = await getPasswordHashByUuid(uuid);
  const oldPasswordValid = await bcrypt.compare(body.oldPassword, userHash);
  if (!oldPasswordValid) {
    throwBoopError('Password incorrect', 401);
  }

  await updatePassword(uuid, body.newPassword);
  res.send();
}));

accountsRouter.put('/privacy', handleAsync(async (req, res) => {
  const uuid: string = await authenticateUUID(req);
  const newValues: UpdatePrivacyRequest = req.body;
  await database.query(
    `UPDATE users SET profile_privacy_level = $1, profile_show_age = $2, profile_show_gender = $3
    WHERE user_uuid=$4;`,
    [newValues.privacyLevel, newValues.profileShowAge, newValues.profileShowGender, uuid]
  );
  res.send();
}));

// returns boolean indicating whether the given username is already taken
accountsRouter.get('/exists', handleAsync(async (req, res) => {
  const username: unknown = req.query.username;
  if (typeof username !== "string") {
    throwBoopError("Error: Invalid username query.", 400);
  }
  const result = await getAuthInfoByUsername(username);
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
