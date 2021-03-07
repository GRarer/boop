import { PrivacyLevel } from "boop-core";
import { database } from "./database";

// determines whether a user profile should be visible to the user who requested it
// the friends list should already be known by the caller, but this function will query for friends-of-friends
// if that information is needed
export async function profileVisibility(
  opts: {
    privacyLevel: PrivacyLevel;
    requesterUUID?: string;
    profileUUID: string;
    profileFriendUUIDs: string[];
  }
): Promise<{allow: true;} | {allow: false; reason: string;}> {

  const privacyLevel = opts.privacyLevel;

  // you must be logged in to view nonpublic profiles
  if (opts.requesterUUID === undefined) {
    return privacyLevel === "public"
      ? { "allow": true }
      : { allow: false, reason: "You must be logged in to view this profile" };
  }

  // users can always view their own profiles
  if (opts.requesterUUID === opts.profileUUID) {
    return { allow: true };
  }

  switch (opts.privacyLevel) {
  case "public": {
    // public profiles are visible to anyone
    return { allow: true };
  }
  case "private": {
    // private profiles are visible to friends and friends-of-friends
    if (opts.profileFriendUUIDs.includes(opts.requesterUUID)) {
      return { allow: true };
    } else {
      // we only query to check if the requester is a friend-of-friend if we need that information
      const friendsOfFriends = (await database.query<{uuid: string;}>(
          `select distinct f2.user_b as uuid
          from friends f1 join friends f2 on f1.user_b = f2.user_a
          where f1.user_a = $1 and f2.user_b = $2`,
          [opts.profileUUID, opts.requesterUUID]
      )).length > 0;
      return friendsOfFriends
        ? { allow: true }
        : { allow: false, reason: "You must be friends with this user or one of their friends to view this profile." };
    }

  }
  case "restricted": {
    // restricted profiles are visible to friends
    return opts.profileFriendUUIDs.includes(opts.requesterUUID)
      ? { allow: true }
      : { allow: false, reason: "You must be friends with this user to view this profile." };
  }
  }
}
