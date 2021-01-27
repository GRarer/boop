import express from "express";
import { database } from "../services/database";
import { handleAsync } from "../util/handleAsync";

export const databaseExampleRouter = express.Router();

databaseExampleRouter.get('/', handleAsync(async (req, res) => {
  const result = await database.getExampleValues();
  res.send(result);
}));

databaseExampleRouter.post('/', handleAsync(async (req, res) => {
  const body: string = req.body;
  console.log(body);
  console.log(`add value: ${body}`);
  // database queries are asynchronous and we can't send the response until the promise is completed.
  await database.addExampleValue(body);
  res.send();
}));
