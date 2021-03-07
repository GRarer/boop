import { ContactMethod, ProfileResponse, StartChatResult } from "boop-core";
import express from "express";
import { getContactMethods } from "../queries/contactQueries";
import { getFriends } from "../queries/friendsQueries";
import { getProfileAndPrivacy } from "../queries/profileQueries";
import { userUuidFromReq } from "../services/auth";
import { emailToGravatarURL } from "../services/avatars";
import { database, } from "../services/database";
import { profileVisibility } from "../services/profilePrivacy";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const profileRouter = express.Router();

profileRouter.get('/user_profile', handleAsync(async (req, res) => {
  const requesterUUID = await userUuidFromReq(req);
  const profileUsername = req.query['username'];
  if (typeof profileUsername !== "string") {
    throwBoopError("missing or invalid username", 400);
  }

  const profileInfo = await getProfileAndPrivacy(profileUsername);
  const friendsList = await getFriends(profileInfo.uuid);
  const contactMethods = await getContactMethods(profileInfo.uuid);

  const visibility = await profileVisibility({
    privacyLevel: profileInfo.privacyLevel,
    profileUUID: profileInfo.uuid,
    requesterUUID: requesterUUID,
    profileFriendUUIDs: friendsList.map(summary => summary.uuid)
  });

  if (visibility.allow) {
    const response: ProfileResponse = {
      visible: true,
      profile: {
        uuid: profileInfo.uuid,
        fullName: profileInfo.fullName,
        avatarUrl: profileInfo.avatarUrl,
        bio: profileInfo.bio,
        statusMessage: profileInfo.statusMessage,
        contactMethods: contactMethods,
        friends: friendsList
      },
      isSelf: requesterUUID === profileInfo.uuid
    };
    res.send(response);
  } else {
    const response: ProfileResponse = {
      visible: false,
      reason: visibility.reason
    };
    res.send(response);
  }
}));


profileRouter.get('/chat_info', handleAsync(async (req, res) => {
  const tokenParam: unknown = req.query["token"];
  if (typeof tokenParam !== "string") {
    throwBoopError("invalid or missing chat notification token", 400);
  }

  const person = (await database.query<{user_uuid: string; username: string; friendly_name: string; email: string;}>(
    `select user_uuid, username, friendly_name, email
    from users join push_identity_tokens on user_uuid = target_user_uuid
    where token = $1;`,
    [tokenParam]
  ))[0] ?? throwBoopError("error: notification expired", 410);

  const contactMethods: ContactMethod[] = (await database.query<{platform: string; contact_id: string;}>(
    `select platform, contact_id from contact_methods where user_uuid = $1;`, [person.user_uuid]))
    .map(row => ({ platform: row.platform, contactID: row.contact_id }));

  const result: StartChatResult = {
    username: person.username,
    friendlyName: person.friendly_name,
    contactMethods,
    avatarUrl: emailToGravatarURL(person.email)
  };
  res.send(result);
}));
