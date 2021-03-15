import { environment } from "src/environments/environment";

// completes api URLs based on the api domain defined in environment.ts (or environment.prod.ts for production mode)
export function formatEndpointURL(path: string): string {
  return environment.apiDomain + path;
}
