import { ContactMethod, } from "boop-core";
import express from "express";
import { authenticateUUID } from "../services/auth";
import { database, } from "../services/database";
import { handleAsync, } from "../util/handleAsync";
import pgFormat from "pg-format";
import { getContactMethods } from "../queries/contactQueries";

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
  const methods: ContactMethod[] = await getContactMethods(userUUID);
  res.send(methods);
}));
