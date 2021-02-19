import { database } from "../services/database";
import webpush from "web-push";
import { throwBoopError } from "../util/handleAsync";

// queries for database example demonstration
export async function addPushSubscription(subscription: webpush.PushSubscription, userUUID: string): Promise<void> {
  const subscriptionString = JSON.stringify(subscription);
  await database.query(
    `UPDATE USERS SET vapid_subs = array_append(vapid_subs, $1)
    where user_uuid = $2 and not (vapid_subs @> ARRAY[$1]::JSONB[]);`, // skip duplicate subscriptions for the same user
    [subscriptionString, userUUID]);
}

export async function getPushByUsername(username: string): Promise<webpush.PushSubscription[]> {
  const query = `select vapid_subs from users where username = $1`;
  type Row = {vapid_subs: webpush.PushSubscription[];};
  const result = (await database.query<Row>(query, [username]));
  if (result.length === 0) {
    throwBoopError("user not found", 404);
  }
  return result[0].vapid_subs;
}

export async function getPushByUUID(userUUID: string): Promise<webpush.PushSubscription[]> {
  const query = `select vapid_subs from users where user_uuid = $1`;
  type Row = {vapid_subs: webpush.PushSubscription[];};
  const result = (await database.query<Row>(query, [userUUID]));
  if (result.length === 0) {
    throwBoopError("user not found", 404);
  }
  return result[0].vapid_subs;
}
