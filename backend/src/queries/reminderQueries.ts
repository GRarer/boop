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
  const query =
    `-- find all the users that can be sent notifications right now
    WITH enabled_users AS (
      SELECT user_uuid
      FROM users
      WHERE (do_not_disturb IS NOT true) and (last_push_timestamp is null or last_push_timestamp < $1)
    ),
    -- find all the friend-of-friend relationships
    metafriends as (
      select f1.user_a as user_a, f1.user_b as shared, f2.user_b as user_b
      from friends f1 join friends f2 on f1.user_b = f2.user_a
      where f1.user_a <> f2.user_b and f2.user_b not in (select f3.user_b from friends f3 where f3.user_a = f1.user_a)
    ),
    -- pick a random subset of users to get notifications about friends
    friends_chosen_users AS (
      SELECT user_uuid
      FROM enabled_users
      WHERE random() < $2
    ),
    -- get the array of possible friends that those users could be paired with
    friend_options AS (
      SELECT user_a, array_agg(user_b order by random()) as user_bs
      FROM friends_chosen_users join friends on friends_chosen_users.user_uuid = friends.user_a
      group by user_a
    ),
    -- pick a random subset of users to get notifications about friends-of-friends
    metafriends_chosen_users AS (
      SELECT user_uuid
      FROM enabled_users
      WHERE random() < $3
    ),
    -- get the array of possible friends-of-friends those users could be paired with
    metafriend_options AS (
      SELECT user_a, array_agg(ARRAY[user_b, shared] order by random()) as user_bs
      FROM metafriends_chosen_users join metafriends on metafriends_chosen_users.user_uuid = metafriends.user_a
      group by user_a
    ),
    friend_pairs as (
      -- select one of the possible friends
      select user_a, user_bs[1] as user_b, NULL::UUID as shared
      from friend_options
      -- note that the resulting set of pairs is likely to contain duplicates of the same user
    ),
    metafriend_pairs as (
      select user_a, user_bs[1][1] as user_b, user_bs[1][2] as shared
      from metafriend_options
      -- note that the resulting set of pairs is likely to contain duplicates of the same user
    ),
    -- merge friend pairs and friend-of-friend pairs
    all_pairs as (
      select * from friend_pairs union all select * from metafriend_pairs
    ),
    -- collect user info for user a
    a_info as (
      select user_a, user_b, shared,
      full_name as full_name_a, friendly_name as friendly_name_a, gender as gender_a, vapid_subs as vapid_subs_a
      from all_pairs join users on user_a = user_uuid
    ),
    -- collect user info for user b
    ab_info as (
      select user_a, user_b, shared,
      full_name_a, friendly_name_a, gender_a, vapid_subs_a,
      full_name as full_name_b, friendly_name as friendly_name_b, gender as gender_b, vapid_subs as vapid_subs_b
      from a_info join users on user_b = user_uuid
    ),
    -- collect user info for mutual friend if applicable
    abc_info as (
      select user_a, user_b,
      full_name_a, friendly_name_a, gender_a, vapid_subs_a,
      full_name_b, friendly_name_b, gender_b, vapid_subs_b,
      full_name as mutual_full_name, friendly_name as mutual_friendly_name, gender as mutual_gender
      from ab_info left join users on shared = user_uuid
    )
    -- return results in a random order
    select * from abc_info order by random();`;

    // mutual friend columns are null for friend pairs
    type PairRow = {
      user_a: string; user_b: string;
      full_name_a: string; friendly_name_a: string; gender_a: Gender; vapid_subs_a: webpush.PushSubscription[];
      full_name_b: string; friendly_name_b: string; gender_b: Gender; vapid_subs_b: webpush.PushSubscription[];
      // mutual friend columns are null for friend pairs
      mutual_full_name: string | null; mutual_friendly_name: string | null; mutual_gender: Gender | null;
    };
    const rows: PairRow[] = await database.query(query, [
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
    await database.query(
      pgFormat('UPDATE users set last_push_timestamp=$1 where user_uuid in (%L);', [...usedUsers.values()]),
      [Date.now()]
    );
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
