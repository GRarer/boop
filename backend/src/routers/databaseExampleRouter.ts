import express from "express";
import { database } from "../services/database";

export const databaseExampleRouter = express.Router();

databaseExampleRouter.get('/', (req, res) => {
  database.getExampleValues()
    .then((result) => {
      res.send(result);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Database error');
    });
});

databaseExampleRouter.post('/', (req, res) => {
  const body: string = req.body;
  console.log(body);
  console.log(`add value: ${body}`);
  // database queries are asynchronous and we can't send the response until the promise is completed.
  database.addExampleValue(body)
    .then(() => { res.send(); })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Database error');
    });
});
