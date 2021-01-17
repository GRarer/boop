import express from "express";
import { LoginRequest, LoginResponse } from "boop-core";
import { login } from "../services/auth";
import { createAccount } from "../services/userAccounts";
import { CreateAccountRequest } from "boop-core";

export const accountsRouter = express.Router();


accountsRouter.post('/login', (req, res) => {
  const body: LoginRequest = req.body;
  login(body).then(result => {
    if (result === "User Not Found") {
      res.status(404).send(Error("User Not Found"));
    } else if (result === "Wrong Password") {
      res.status(401).send(Error("Incorrect Password"));
    } else {
      const loginResponse: LoginResponse = result;
      res.send(loginResponse);
    }
  }).catch(err => {
    res.status(500).send(err);
  });
});

accountsRouter.post('/register', (req, res) => {
  const body: CreateAccountRequest = req.body;
  createAccount(body).then((result: LoginResponse) => {
    res.send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
});
