import express from "express";
import { database } from "../services/database";

export const databaseExampleRouter = express.Router();

databaseExampleRouter.get('/', (req, res) => {
  database.getExampleValues()
    .then((result) => {
      res.send({
        entries: result
      });
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Database error');
    });
});

databaseExampleRouter.post('/', (req, res) => {
  const body: { entry: string; } = req.body;
  console.log(`add value: ${body.entry}`);
  // database queries are asynchronous and we can't send the response until the promise is completed.
  database.addExampleValue(body.entry)
    .then(() => { res.send(); })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Database error');
    });
});
