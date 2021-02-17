import { database } from "../services/database";
import webpush from "web-push";

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

export async function getPushByUUID(userUUID: string): Promise<webpush.PushSubscription[]> {
  const query = `select sub_json from subscriptions where user_uuid = $1`;
  type ResultRow = {sub_json: PushSubscriptionJSON;};
  const result = (await database.query<ResultRow>(query, [userUUID]));
  return result.map(r => ({
    endpoint: r.sub_json.endpoint!,
    keys: {
      p256dh: r.sub_json.keys!['p256dh'],
      auth: r.sub_json.keys!['auth']
    }
  }));
}
