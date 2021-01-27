export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  userUUID: string;
  sessionToken: string; // used to verify identity when making requests to backend
};

export function isLoginResponse(x: unknown): x is LoginResponse {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  for (const field of ["userUUID", "sessionToken"]) {
    if (typeof (x as any)[field] !== "string") {
      return false;
    }
  }
  return true;
}
