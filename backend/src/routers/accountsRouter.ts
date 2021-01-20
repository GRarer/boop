import express from "express";
import { failsPasswordRequirement, failsUsernameRequirement, LoginRequest, LoginResponse } from "boop-core";
import { login } from "../services/auth";
import { createAccount } from "../services/userAccounts";
import { CreateAccountRequest, minYearsAgo, isGender } from "boop-core";
import { database } from "../services/database";

export const accountsRouter = express.Router();


accountsRouter.post('/login', (req, res) => {
  const body: LoginRequest = req.body;
  login(body).then(result => {
    if (result === "User Not Found") {
      res.status(404).send("User Not Found");
    } else if (result === "Wrong Password") {
      res.status(401).send("Incorrect Password");
    } else {
      const loginResponse: LoginResponse = result;
      res.send(loginResponse);
    }
  }).catch(err => {
    res.sendStatus(500);
  });
});

accountsRouter.post('/register', (req, res) => {
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

  createAccount(body).then((result: LoginResponse) => {
    res.send(result);
  }).catch(err => {
    // check if the reason for the exception was an already-taken username
    if (err["code"] === "23505" && err["constraint"] === "users_username_key") {
      res.status(409).send(`username ${body.username} is already taken.`);
    } else {
      res.sendStatus(500);
    }
  });
});

// returns boolean indicating whether the given username is already taken
accountsRouter.get('/exists', (req, res) => {
  const username: unknown = req.query.username;
  if (typeof username !== "string") {
    res.sendStatus(400);
    return;
  }
  database.getAuthInfo(username).then(result => {
    if (result === "Account Not Found") {
      res.send(false);
    } else {
      res.send(true);
    }
  }).catch(() => { res.sendStatus(500); });
});
