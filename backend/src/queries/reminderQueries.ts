import pgFormat from "pg-format";
import { database } from "../services/database";
import { Pairing } from "../services/reminders";
import { scheduleParameters } from "../services/scheduleTuning";

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
    all_pairs as (
      select * from friend_pairs union all select * from metafriend_pairs
    )
    select * from all_pairs order by random();`;

    // shared is the mutual friend for friend-of-friend pairs, null for friend pairs
    type PairRow = {user_a: string; user_b: string; shared: string | null;};
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
        pairings.push(row.shared === null
          ? { userA: row.user_a, userB: row.user_b, friends: true }
          : { userA: row.user_a, userB: row.user_b, friends: false, mutualFriend: row.shared });
      }
    }
    // update timestamps on all selected users
    await database.query(
      pgFormat('UPDATE users set last_push_timestamp=$1 where user_uuid in (%L);', [...usedUsers.values()]),
      [Date.now()]
    );
    return pairings;
}
