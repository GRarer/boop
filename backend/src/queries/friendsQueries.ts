import { ProfileSummary } from "boop-core";
import { database } from "../services/database";

// sql template for deleting a friend request between two users
export const deleteFriendRequestQueryString: string =
`delete from friend_requests where
(((from_user = $1) and (to_user = $2)) or ((from_user = $2) and (to_user = $1)));`;

export async function getIncomingFriendRequests(uuid: string): Promise<ProfileSummary[]> {
  const query =
    `select distinct user_uuid, username, full_name from users join friend_requests
    on user_uuid = from_user where to_user = $1;`;
  type ResultRow = {user_uuid: string; username: string; full_name: string;};
  const results: ResultRow[] = await database.query(query, [uuid]);
  return results.map(r => ({ uuid: r.user_uuid, username: r.username, fullName: r.full_name }));
}

export async function getFriends(uuid: string): Promise<ProfileSummary[]> {
  const query =
    `select distinct user_uuid, username, full_name from friends join users on user_a = user_uuid where user_b = $1;`;
  type ResultRow = {user_uuid: string; username: string; full_name: string;};
  const results: ResultRow[] = await database.query(query, [uuid]);
  return results.map(r => ({ uuid: r.user_uuid, username: r.username, fullName: r.full_name }));
}