export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  sessionToken: string;
  userUUID: string; // deprecated but required for backwards compatibility with outdated cached clients
};
