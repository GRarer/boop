export async function friendNotificationMessage(friendUUID: string): Promise<string> {
  // TODO query database for name and info and create friendly message
  return `Start a chat with user ${friendUUID}`;
}

export async function metafriendNotificationMessage(metafriendUUID: string, mutualFriendUUID: string): Promise<string> {
  // TODO query database for name and info and create friendly message
  return `Start a chat with user ${metafriendUUID}. You have friend ${mutualFriendUUID} in common.`;
}
