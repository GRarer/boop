export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  userUUID: string;
  sessionToken: string; // used to verify identity when making requests to backend
};
