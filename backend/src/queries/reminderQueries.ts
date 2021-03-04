import pgFormat from "pg-format";
import { database } from "../services/database";
import { Pairing } from "../services/reminders/reminders";
import { scheduleParameters } from "../services/reminders/scheduleTuning";
import { v4 as uuidV4 } from 'uuid';
import { Gender } from "boop-core";
import webpush from "web-push";

// tokens expire after 1 week
const pushTokenExpirationTime = 7 * 24 * 60 * 60 * 1000;

export async function selectPairs(): Promise<Pairing[]> {
  // mutual friend columns are null for friend pairs
  type PairRow = {
    user_a: string; user_b: string;
    full_name_a: string; friendly_name_a: string; gender_a: Gender; vapid_subs_a: webpush.PushSubscription[];
    full_name_b: string; friendly_name_b: string; gender_b: Gender; vapid_subs_b: webpush.PushSubscription[];
    // mutual friend columns are null for friend pairs
    mutual_full_name: string | null; mutual_friendly_name: string | null; mutual_gender: Gender | null;
  };
  // call selectPairs SQL function defined in init.sql
  const rows: PairRow[] = await database.query(`select * from selectPairs($1, $2, $3)`, [
    Date.now() - scheduleParameters.cooldown,
    scheduleParameters.friendProbability,
    scheduleParameters.metafriendProbability]
  );

  const pairings: Pairing[] = [];
  // we skip any pairings with users that are already included in this iteration.
  const usedUsers: Set<string> = new Set([]);
  for (const row of rows) {
    if (!usedUsers.has(row.user_a) && !usedUsers.has(row.user_b)) {
      usedUsers.add(row.user_a);
      usedUsers.add(row.user_b);

      pairings.push(row.mutual_full_name === null
        ? {
          friends: true,
          userA: {
            uuid: row.user_a,
            fullName: row.full_name_a,
            friendlyName: row.friendly_name_a,
            gender: row.gender_a,
            vapidSubs: row.vapid_subs_a
          },
          userB: {
            uuid: row.user_b,
            fullName: row.full_name_b,
            friendlyName: row.friendly_name_b,
            gender: row.gender_b,
            vapidSubs: row.vapid_subs_b
          }
        }
        : {
          friends: false,
          userA: {
            uuid: row.user_a,
            fullName: row.full_name_a,
            friendlyName: row.friendly_name_a,
            gender: row.gender_a,
            vapidSubs: row.vapid_subs_a
          },
          userB: {
            uuid: row.user_b,
            fullName: row.full_name_b,
            friendlyName: row.friendly_name_b,
            gender: row.gender_b,
            vapidSubs: row.vapid_subs_b
          },
          mutualFriend: {
            fullName: row.mutual_full_name,
            friendlyName: row.mutual_friendly_name!,
            gender: row.mutual_gender
          }
        });
    }
  }
  // update timestamps on all selected users
  if (usedUsers.size > 0) {
    await database.query(
      pgFormat('UPDATE users set last_push_timestamp=$1 where user_uuid in (%L);', [...usedUsers.values()]),
      [Date.now()]
    );
  }
  return pairings;
}

export async function createNotificationTokens(pair: Pairing): Promise<{tokenToA: string; tokenToB: string;}> {
  const expirationTime = Date.now() + pushTokenExpirationTime;
  const tokens = { tokenToA: `push-${uuidV4()}`, tokenToB: `push-${uuidV4()}` };
  await database.query(
    `insert into push_identity_tokens(token, target_user_uuid, expiration_time) values
    ($1, $2, $5), ($3, $4, $5);`,
    [tokens.tokenToA, pair.userB.uuid, tokens.tokenToB, pair.userA.uuid, expirationTime]
  );
  return tokens;
}
