import type { ApiClient } from '../api';
import { mergePreDefinedOptions } from '../util/mergePreDefinedOptions';
import type { AuthenticateRequestOptions } from './request';
import { authenticateRequest as authenticateRequestOriginal, debugRequestState } from './request';

type RunTimeOptions = Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>;

type BuildTimeOptions = Partial<
  Pick<
    AuthenticateRequestOptions,
    | 'apiUrl'
    | 'apiVersion'
    | 'audience'
    | 'domain'
    | 'isSatellite'
    | 'jwtKey'
    | 'proxyUrl'
    | 'publishableKey'
    | 'secretKey'
  >
>;

const defaultOptions = {
  secretKey: '',
  jwtKey: '',
  apiUrl: undefined,
  apiVersion: undefined,
  proxyUrl: '',
  publishableKey: '',
  isSatellite: false,
  domain: '',
  audience: '',
} satisfies BuildTimeOptions;

export type CreateAuthenticateRequestOptions = {
  options: BuildTimeOptions;
  apiClient: ApiClient;
};

export function createAuthenticateRequest(params: CreateAuthenticateRequestOptions) {
  const buildTimeOptions = mergePreDefinedOptions(defaultOptions, params.options);

  const authenticateRequest = (request: Request, options: RunTimeOptions = {}) => {
    const { apiUrl, apiVersion } = buildTimeOptions;
    const runTimeOptions = mergePreDefinedOptions(buildTimeOptions, options);
    return authenticateRequestOriginal(request, {
      ...options,
      ...runTimeOptions,
      // We should add all the omitted props from options here (eg apiUrl / apiVersion)
      // to avoid runtime options override them.
      apiUrl,
      apiVersion,
    });
  };

  return {
    authenticateRequest,
    debugRequestState,
  };
}
