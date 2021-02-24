import { ContactMethod, } from "boop-core";
import express from "express";
import { authenticateUUID } from "../services/auth";
import { database, } from "../services/database";
import { handleAsync, } from "../util/handleAsync";
import pgFormat from "pg-format";

export const contactRouter = express.Router();

contactRouter.put('/my_methods', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  const methods: ContactMethod[] = req.body;

  // remove previous methods and insert new methods as one atomic transaction
  await database.doTransaction(async (client) => {
    // remove previous methods
    await client.query(`delete from contact_methods where user_uuid = $1`, [userUUID]);

    // insert new methods
    if (methods.length > 0) {
      const params: string[][] = methods.map(method => [userUUID, method.platform, method.contactID]);
      await client.query(pgFormat('INSERT INTO contact_methods (user_uuid, platform, contact_id) VALUES %L;', params));
    }
  });

  res.send();
}));

contactRouter.get('/my_methods', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  type ResultRow = {platform: string; contact_id: string;};
  const results = await database.query<ResultRow>(
    `select platform, contact_id from contact_methods where user_uuid = $1`, [userUUID]
  );
  const methods: ContactMethod[] = results.map(row => ({ platform: row.platform, contactID: row.contact_id }));
  res.send(methods);
}));
