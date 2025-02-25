import type { ClerkOptions } from '@clerk/backend';
import { createClerkClient as _createClerkClient, verifyToken } from '@clerk/backend';

import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import { loadApiEnv, loadClientEnv } from './utils';

type ClerkClient = ReturnType<typeof _createClerkClient> & {
  expressWithAuth: ReturnType<typeof createClerkExpressWithAuth>;
  expressRequireAuth: ReturnType<typeof createClerkExpressRequireAuth>;
  verifyToken: typeof verifyToken;
};

/**
 * This needs to be a *named* function in order to support the older
 * new Clerk() syntax for v4 compatibility.
 * Arrow functions can never be called with the new keyword because they do not have the [[Construct]] method
 */
export function createClerkClient(options: ClerkOptions): ClerkClient {
  const clerkClient = _createClerkClient(options);
  const expressWithAuth = createClerkExpressWithAuth({ ...options, clerkClient });
  const expressRequireAuth = createClerkExpressRequireAuth({ ...options, clerkClient });

  return Object.assign(clerkClient, {
    expressWithAuth,
    expressRequireAuth,
    verifyToken,
  });
}

let clerkClientSingleton = {} as unknown as ReturnType<typeof createClerkClient>;

export const clerkClient = new Proxy(clerkClientSingleton, {
  get(_target, property) {
    const hasBeenInitialised = !!clerkClientSingleton.authenticateRequest;
    if (hasBeenInitialised) {
      // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
      return clerkClientSingleton[property];
    }

    const env = { ...loadApiEnv(), ...loadClientEnv() };
    if (env.secretKey) {
      clerkClientSingleton = createClerkClient({ ...env, userAgent: '@clerk/clerk-sdk-node' });
      // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
      return clerkClientSingleton[property];
    }

    // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
    return Clerk({ ...env, userAgent: '@clerk/clerk-sdk-node' })[property];
  },
  set() {
    return false;
  },
});

/**
 * Stand-alone express middlewares bound to the pre-initialised clerkClient
 */
export const ClerkExpressRequireAuth = (...args: Parameters<ReturnType<typeof createClerkExpressRequireAuth>>) => {
  const env = { ...loadApiEnv(), ...loadClientEnv() };
  const fn = createClerkExpressRequireAuth({ clerkClient, ...env });
  return fn(...args);
};

export const ClerkExpressWithAuth = (...args: Parameters<ReturnType<typeof createClerkExpressWithAuth>>) => {
  const env = { ...loadApiEnv(), ...loadClientEnv() };
  const fn = createClerkExpressWithAuth({ clerkClient, ...env });
  return fn(...args);
};
