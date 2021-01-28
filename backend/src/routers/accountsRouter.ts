import express from "express";
import { failsPasswordRequirement, failsUsernameRequirement, LoginRequest, LoginResponse } from "boop-core";
import { login, LoginError, userUuidFromReq } from "../services/auth";
import { createAccount } from "../services/userAccounts";
import { CreateAccountRequest, minYearsAgo, isGender } from "boop-core";
import { database, DatabaseError } from "../services/database";
import { handleAsync } from "../util/handleAsync";
export const accountsRouter = express.Router();


accountsRouter.post('/login', handleAsync(async (req, res) => {
  const body: LoginRequest = req.body;
  const result = await login(body);
  if (result === LoginError.UserNotFound) {
    res.sendStatus(404);
    return;
  } else if (result === LoginError.WrongPassword) {
    res.sendStatus(401);
    return;
  } else {
    const loginResponse: LoginResponse = result;
    res.send(loginResponse);
    return;
  }
}));

accountsRouter.post('/register', handleAsync(async (req, res) => {
  const body: CreateAccountRequest = req.body;
  // validate username and password
  const passwordOrUsernameIssue: string | undefined
    = failsUsernameRequirement(body.username) ?? failsPasswordRequirement(body.password);
  if (passwordOrUsernameIssue) {
    res.status(401).send(passwordOrUsernameIssue);
    return;
  }

  // validate age and gender
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

  try {
    const result = await createAccount(body);
    res.send(result);
  } catch (err) {
    if (typeof err === "object" && err["code"] === "23505" && err["constraint"] === "users_username_key") {
      res.status(409).send(`username ${body.username} is already taken.`);
    } else {
      res.sendStatus(500);
    }
  }
}));

accountsRouter.get('/exists', handleAsync(async (req, res) => {
  const username: unknown = req.query.username;
  if (typeof username !== "string") {
    res.sendStatus(400);
    return;
  }
  const result = await database.getAuthInfo(username);
  if (result === DatabaseError.UserNotFound) {
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
