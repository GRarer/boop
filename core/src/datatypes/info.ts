// the information that is displayed on the home screen
export type HomeScreenInfoResponse = {
  friendlyName: string;
  statusMessage: string;
  doNotDisturb: boolean;
  username: string; // needed so that home can link to this user's profile
};
