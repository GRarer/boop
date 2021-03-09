import { PrivacyLevel, ProfileViewerRelation } from "boop-core";
import { database } from "./database";

// determines whether a user profile should be visible to the user who requested it
// the friends list should already be known by the caller, but this function will query for friends-of-friends
// if that information is needed
export async function profileVisibility(
  opts: {
    privacyLevel: PrivacyLevel;
    requesterUUID: string | undefined;
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

// information about the relationship between the viewer and the owner of this profile
// the friends list should already be known by the caller, but this function will query for friend requests
// if that information is needed
export async function lookupProfileViewerRelation(
  opts: {
    requesterUUID: string | undefined;
    profileUUID: string;
    profileFriendUUIDs: string[];
  }
): Promise<ProfileViewerRelation> {
  if (opts.requesterUUID === undefined) {
    return {
      self: false,
      viewerLoggedIn: false,
      friend: false,
    };
  } else if (opts.requesterUUID === opts.profileUUID) {
    return {
      self: true,
      viewerLoggedIn: true,
      friend: false,
    };
  } else if (opts.profileFriendUUIDs.includes(opts.requesterUUID)) {
    return {
      self: false,
      viewerLoggedIn: true,
      friend: true,
    };
  } else {
    // if the user is logged in but is not the owner of the profile or one of the owner's friends,
    // then we want to know whether there is already a pending friend request between these users
    const senders: string[] = (
      await database.query<{from_user: string;}>(
        `select distinct from_user
        from friend_requests
        where (from_user = $1 and to_user = $2) or (from_user = $2 and to_user = $1);`,
        [opts.requesterUUID, opts.profileUUID]
      )
    ).map(row => row.from_user);
    if (senders.includes(opts.profileUUID)) {
      return {
        viewerLoggedIn: true,
        self: false,
        friend: false,
        pendingFriendRequest: "incoming"
      };
    } else if (senders.includes(opts.requesterUUID)) {
      return {
        viewerLoggedIn: true,
        self: false,
        friend: false,
        pendingFriendRequest: "outgoing"
      };
    } else {
      return {
        viewerLoggedIn: true,
        self: false,
        friend: false,
      };
    }
  }
}
