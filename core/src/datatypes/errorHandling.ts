export type BoopError = {
  errorMessage: string;
  statusNumber: number;
  cause?: unknown;
};

export function isBoopError(x: unknown): x is BoopError {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const e: {errorMessage?: unknown; statusNumber?: unknown;} = x;
  return (typeof e.errorMessage === "string" && typeof e.statusNumber === "number");
}
