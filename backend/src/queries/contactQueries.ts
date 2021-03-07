import { ContactMethod } from "boop-core";
import { database } from "../services/database";

export async function getContactMethods(userUUID: string): Promise<ContactMethod[]> {

  const results = await database.query<{platform: string; contact_id: string;}>(
    `select platform, contact_id from contact_methods where user_uuid = $1`, [userUUID]
  );
  return results.map(row => ({ platform: row.platform, contactID: row.contact_id }));
}
