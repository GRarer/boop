import { Gender, pronouns } from "boop-core";
import { getUserAccount } from "../../queries/accountQueries";
import { throwBoopError } from "../../util/handleAsync";
import { chooseRandom } from "../../util/random";

type IdentityInfo = {fullName: string; friendlyName: string; gender: Gender;};

const friendTemplates: ((friend: IdentityInfo) => string)[] = [
  (friend) => `Say hi to ${friend.friendlyName}`,
  (friend) => `Catch up with ${friend.fullName}`,
  (friend) => `Would you like to chat with ${friend.friendlyName} today?`,
  (friend) => `How is ${friend.friendlyName} doing today? Check in on ${pronouns(friend.gender).object} and find out!`
];

const metafriendTemplates: ((metafriend: IdentityInfo, mutualFriend: IdentityInfo) => string)[] = [
  (metafriend, mutualFriend) =>
    `Say hello to someone in your circles. You and ${metafriend.fullName} are both friends with ${
      mutualFriend.friendlyName}. Would you like to chat with ${pronouns(metafriend.gender).object}?`,
  (metafriend, mutualFriend) => `You and ${metafriend.fullName} are both friends with ${
    mutualFriend.friendlyName}. Would you like to say "hi" to ${pronouns(metafriend.gender).object}?`,
];

export async function friendNotificationMessage(friendUUID: string): Promise<string> {
  const friend: IdentityInfo = await getUserAccount(friendUUID) ?? (throwBoopError("User not found", 404));
  return chooseRandom(friendTemplates)(friend);
}

export async function metafriendNotificationMessage(metafriendUUID: string, mutualFriendUUID: string): Promise<string> {
  const metafriend: IdentityInfo = await getUserAccount(metafriendUUID) ?? (throwBoopError("User not found", 404));
  const mutualFriend: IdentityInfo = await getUserAccount(mutualFriendUUID) ?? (throwBoopError("User not found", 404));
  return chooseRandom(metafriendTemplates)(metafriend, mutualFriend);
}
