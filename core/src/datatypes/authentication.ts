export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  sessionToken: string;
};
