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
  profile: null | {
    [key: string]: string;
  };
};

export type Profile = {
  [key: string]: string | number | boolean;
};

export type SignUpWithEmailAndPasswordOptions = {
  email: string;
  password: string;
  locale?: string;
  defaultRole?: string;
  roles?: string[];
  displayName?: string;
  profile?: Profile;
};

export type SignUpOptions = SignUpWithEmailAndPasswordOptions;

export type SignUpResponse =
  | { session: Session | null; error: null }
  | { session: null; error: Error };

export type SignInWithEmailAndPasswordOptions = {
  email: string;
  password: string;
};

export type SignInPasswordLessEmailParams = {
  email: string;
  locale?: string;
  allowedRoles?: string[];
  defaultRole?: string;
  displayName?: string;
  profile?: Profile;
};

export type SignInPasswordLessSmsParams = {
  phoneNumber: string;
  locale?: string;
  allowedRoles?: string[];
  defaultRole?: string;
  displayName?: string;
  profile?: Profile;
};

export type SignInWithPasswordless =
  | SignInPasswordLessEmailParams
  | SignInPasswordLessSmsParams;

export type SignInWithProviderOptions = {
  provider: Provider;
};

export type SignInWithOtp = {
  email?: string;
  phoneNumber?: string;
  otp: string;
};

export type SignInOptions =
  | SignInWithEmailAndPasswordOptions
  | SignInWithPasswordless
  | SignInWithProviderOptions
  | SignInWithOtp;

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

// export type signUpCredentials = {
//   email?: string;
//   password?: string;
//   provider?: Provider;
//   locale?: string;
//   defaultRole?: string;
//   roles?: string[];
//   displayName?: string;
//   profile?: Profile;
// };

// export interface HasuraAuthClientParams {
//   url: string;
//   refreshIntervalTime: number | null;
//   clientStorage: ClientStorage;
//   clientStorageType: string;
//   ssr?: boolean;
//   autoLogin: boolean;
// }

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

export type ApiSignInWithOtpParams =
  | { connection: 'email'; email: string; otp: string }
  | { connection: 'sms'; phoneNumber: string; otp: string };

type ApiPasswordLessEmailParams = {
  connection: 'email';
  email: string;
  locale?: string;
  allowedRoles?: string[];
  defaultRole?: string;
  displayName?: string;
  profile?: Profile;
};
type ApiPasswordLessSmsParams = {
  connection: 'sms';
  phoneNumber: string;
  locale?: string;
  allowedRoles?: string[];
  defaultRole?: string;
  displayName?: string;
  profile?: Profile;
};

export type ApiSignInWithPasswordless =
  | ApiPasswordLessEmailParams
  | ApiPasswordLessSmsParams;

export type ApiSignUpWithEmailAndPasswordReponse =
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

export type apiRefreshTokenResponse =
  | { session: Session; error: null }
  | { session: null; error: Error };

export type ApiSignOutResponse = { error: null | Error };
