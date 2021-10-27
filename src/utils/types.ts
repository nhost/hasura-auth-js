export type Session = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  user: User | null;
};

export type User = {
  id: string;
  createdAt: string;
  displayName: string;
  avatarUrl: string;
  locale: string;
  email?: string;
  isAnonymous: boolean;
  defaultRole: string;
  roles: {
    [key: string]: string;
  };
};

// Sign Up

export type SignUpEmailPasswordParams = {
  email: string;
  password: string;
  options?: {
    locale?: string;
    defaultRole?: string;
    roles?: string[];
    displayName?: string;
  };
};

export type SignUpParams = SignUpEmailPasswordParams;

export type SignUpResponse =
  | { session: Session | null; error: null }
  | { session: null; error: Error };

// Sign In

export type SignInEmailPasswordParams = {
  email: string;
  password: string;
};

export type SignInPasswordlessEmailParmas = {
  email: string;
  options?: {
    locale?: string;
    allowedRoles?: string[];
    defaultRole?: string;
    displayName?: string;
    redirectTo?: string;
  };
};

export type SignInPasswordlessSmsParmas = {
  phoneNumber: string;
  options?: {
    locale?: string;
    allowedRoles?: string[];
    defaultRole?: string;
    displayName?: string;
    redirectTo?: string;
  };
};

export type SignInPasswordlessSmsOtpParams = {
  phoneNumber: string;
  otp: string;
};

export type SignInWithProviderOptions = {
  provider: Provider;
  options?: {
    locale?: string;
    allowedRoles?: string[];
    defaultRole?: string;
    displayName?: string;
    redirectTo?: string;
  };
};

export type SignInParams =
  | SignInEmailPasswordParams
  | SignInPasswordlessEmailParmas
  | SignInPasswordlessSmsParmas
  | SignInPasswordlessSmsOtpParams
  | SignInWithProviderOptions;

export type ResetPasswordParams = {
  email: string;
  options?: {
    redirectTo?: string;
  };
};

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
};

export type SendVerificationEmailParams = {
  email: string;
  options?: {
    redirectTo?: string;
  };
};

export type SignInReponse = {
  session: Session | null;
  error: Error | null;
  mfa?: {
    enabled: boolean;
    ticket: string;
  };
  providerUrl?: string;
  provider?: string;
};

export type ClientStorage = {
  // custom
  // localStorage
  // AsyncStorage
  // https://react-native-community.github.io/async-storage/docs/usage
  setItem?: (key: string, value: string) => void;
  getItem?: (key: string) => any;
  removeItem?: (key: string) => void;

  // capacitor
  set?: (options: { key: string; value: string }) => void;
  get?: (options: { key: string }) => any;
  remove?: (options: { key: string }) => void;

  // expo-secure-storage
  setItemAsync?: (key: string, value: string) => void;
  getItemAsync?: (key: string) => any;
  deleteItemAsync?: (key: string) => void;
};

// supported client storage types
export type ClientStorageType =
  | 'localStorage'
  | 'web'
  | 'react-native'
  | 'capacitor'
  | 'expo-secure-storage'
  | 'custom';

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT';

export type AuthChangedFunction = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

export type OnTokenChangedFunction = (session: Session | null) => void;

export type LoginData = {
  mfa?: boolean;
  ticket?: string;
};

export type Headers = {
  Authorization?: string;
};

export type Provider =
  | 'apple'
  | 'facebook'
  | 'github'
  | 'google'
  | 'linkedin'
  | 'spotify'
  | 'twitter'
  | 'windowslive';

export type JWTHasuraClaims = {
  [claim: string]: string | string[];
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
  'x-hasura-user-id': string;
};

// https://hasura.io/docs/1.0/graphql/core/auth/authentication/jwt.html#the-spec
export type JWTClaims = {
  sub?: string;
  iat?: number;
  'https://hasura.io/jwt/claims': JWTHasuraClaims;
};

/////////////////////
///// API
/////////////////////

export type Mfa = {
  ticket: string;
};

export type ApiSignUpEmailPasswordResponse =
  | { session: Session; error: null }
  | { session: null; error: Error };

export type ApiSignInResponse =
  | {
      data: {
        session: Session;
        mfa: null | Mfa;
      };
      error: null;
    }
  | { data: null; error: Error };

export type ApiRefreshTokenResponse =
  | { session: Session; error: null }
  | { session: null; error: Error };

export type ApiSignOutResponse = { error: null | Error };

export type ApiResetPasswordResponse = { error: null | Error };

export type ApiChangePasswordResponse = { error: null | Error };

export type ApiSendVerificationEmailResponse = { error: null | Error };
