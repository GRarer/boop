import { database } from "../services/database";

// queries for database example demonstration
export async function addPushSubscription(subscription: PushSubscriptionJSON, userUUID: string): Promise<void> {
  await database.query(
    `INSERT INTO subscriptions(endpoint, sub_json, user_uuid) VALUES($1, $2, $3)
    ON CONFLICT (endpoint, user_uuid) DO UPDATE SET endpoint=$1, sub_json=$2;`,
    [subscription.endpoint, subscription, userUUID]
  );
}

export async function getPushByUsername(username: string): Promise<PushSubscriptionJSON[]> {
  const query = `select sub_json from users join subscriptions using (user_uuid) where username = $1`;
  type ResultRow = {sub_json: PushSubscriptionJSON;};
  const result = (await database.query<ResultRow>(query, [username]));
  return result.map(r => r.sub_json);
}
