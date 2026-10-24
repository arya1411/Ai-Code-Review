import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  // Auth is hosted by this app. Ignore stale build-time URLs in the browser.
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});
