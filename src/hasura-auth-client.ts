import queryString from 'query-string';
import { HasuraAuthApi } from './hasura-auth-api';
import { NHOST_REFRESH_TOKEN } from './utils/constants';
import { inMemoryLocalStorage, isBrowser } from './utils/helpers';
import {
  AuthChangedFunction,
  AuthChangeEvent,
  ClientStorage,
  ClientStorageType,
  // Headers,
  Session,
  SignInOptions,
  SignUpOptions,
  SignUpResponse,
} from './utils/types';

export class HasuraAuthClient {
  private api: HasuraAuthApi;

  private onTokenChangedFunctions: Function[];
  private onAuthChangedFunctions: AuthChangedFunction[];

  private refreshInterval: any;
  private refreshIntervalTime: number | null;

  private clientStorage: ClientStorage;
  private clientStorageType: string;

  private url: string;
  private autoRefreshToken: boolean;

  private session: Session | null;

  private initAuthLoading: boolean;
  private refreshSleepCheckInterval: any;
  private refreshIntervalSleepCheckLastSample: number;
  private sampleRate: number;

  constructor({
    url,
    autoRefreshToken = true,
    autoLogin = true,
    refreshIntervalTime = 5000,
    clientStorage,
    clientStorageType = 'web',
  }: {
    url: string;
    autoRefreshToken?: boolean;
    autoLogin?: boolean;
    refreshIntervalTime?: number;
    clientStorage?: ClientStorage;
    clientStorageType?: ClientStorageType;
  }) {
    this.refreshIntervalTime = refreshIntervalTime;

    if (isBrowser()) {
      localStorage.setItem('test', 'okok?');
    }

    if (!clientStorage) {
      if (isBrowser()) {
        this.clientStorage = localStorage;
      } else {
        this.clientStorage = new inMemoryLocalStorage();
      }
    } else {
      this.clientStorage = clientStorage;
    }

    this.clientStorageType = clientStorageType;

    this.onTokenChangedFunctions = [];
    this.onAuthChangedFunctions = [];
    this.refreshInterval;

    this.refreshSleepCheckInterval = 0;
    this.refreshIntervalSleepCheckLastSample = Date.now();
    this.sampleRate = 2000; // check every 2 seconds

    this.url = url;

    this.autoRefreshToken = autoRefreshToken;

    this.initAuthLoading = true;

    this.session = null;
    // this.user = null;

    this.api = new HasuraAuthApi({ url: this.url });

    // get refresh token from query param (from external OAuth provider callback)
    let refreshToken: string | null = null;
    let autoLoginFromQueryParameters = false;

    // try to auto login using hashtag query parameters
    // ex if the user came from a magic link
    if (autoLogin && isBrowser()) {
      // try {
      const urlParams = queryString.parse(
        window.location.toString().split('#')[1]
      );

      if ('refreshToken' in urlParams) {
        this.clearHashFromUrl();
        refreshToken = urlParams.refreshToken as string;
      }

      if ('otp' in urlParams && 'email' in urlParams) {
        this.clearHashFromUrl();
        const { otp, email } = urlParams;
        // sign in with OTP
        this.signIn({
          otp: otp as string,
          email: email as string,
        });
        autoLoginFromQueryParameters = true;
      }
    }

    // if empty string, then set it to null
    // refreshToken = refreshToken ? refreshToken : null;

    if (!autoLoginFromQueryParameters && autoLogin) {
      this._autoLogin(refreshToken);
    } else if (refreshToken) {
      this._setItem(NHOST_REFRESH_TOKEN, refreshToken);
    }
  }

  /**
   * Use `signUp` to sign up users using email an password.
   *
   * If you want to sign up a user using magic link or a social provider, use
   * the `signIn` function instead.
   *
   * @example
   * auth.signIn({email, password}); // email password
   *
   * @docs https://docs.nhost.io/TODO
   */
  public async signUp(options: SignUpOptions): Promise<SignUpResponse> {
    const {
      email,
      password,
      displayName,
      locale,
      roles,
      defaultRole,
      profile,
    } = options;

    // email and password
    if (email && password) {
      // sign up with email and password
      const { session, error } = await this.api.signUpWithEmailAndPassword({
        email,
        password,
        displayName,
        locale,
        defaultRole,
        roles,
        profile,
      });

      if (error) {
        return { session: null, error };
      }

      if (session) {
        this._setSession(session);
      }

      return { session, error: null };
    }

    return { session: null, error: new Error('incorrect combination') };
  }

  /**
   * Use `signIn` to sign in users using email and password, magic link or provider.
   *
   * @example
   * auth.signIn({email, password}); // email password
   * auth.signIn({email}); // magic link
   * auth.signIn({provider}); // provider
   * auth.signIn({otp, email }); // OTP
   *
   * @docs https://docs.nhost.io/TODO
   */
  public async signIn(params: SignInOptions): Promise<{
    session: Session | null;
    mfa: null | {
      ticket: string;
    };
    error: Error | null;
    providerUrl?: string;
    provider?: string;
  }> {
    if ('provider' in params) {
      const { provider } = params;
      const providerUrl = `${this.url}/signin/provider/${provider}`;

      if (isBrowser()) {
        window.location.href = providerUrl;
      } else {
        return { providerUrl, provider, session: null, mfa: null, error: null };
      }
    }

    // email password
    if ('email' in params && 'password' in params) {
      const { email, password } = params;
      const { data, error } = await this.api.signInWithEmailAndPassword({
        email,
        password,
      });

      if (error) {
        return { session: null, mfa: null, error };
      }

      if (!data) {
        return { session: null, mfa: null, error: new Error('Incorrect data') };
      }

      const { session, mfa } = data;

      if (session) {
        this._setSession(session);
      }

      return { session, mfa, error: null };
    }

    // magic link
    if ('email' in params && !('otp' in params)) {
      const { email } = params;

      const { error } = await this.api.signInWithPasswordless({
        connection: 'email',
        email,
      });

      if (error) {
        return { session: null, mfa: null, error };
      }

      return { session: null, mfa: null, error: null };
    }

    // sign in using OTP
    if ('otp' in params) {
      // OTP from email
      if (params.email) {
        const { otp, email } = params;

        const { data, error } = await this.api.signInWithOtp({
          connection: 'email',
          email,
          otp,
        });

        if (error) {
          return { session: null, mfa: null, error };
        }

        if (!data) {
          return {
            session: null,
            mfa: null,
            error: new Error('Incorrect data'),
          };
        }

        const { session, mfa } = data;

        if (session) {
          this._setSession(session);
        }

        return { session, mfa, error: null };
      }

      // OTP from SMS
      if (params.phoneNumber) {
        // TODO
        // const { otp, phoneNumber } = params;
        // const { data, error } = await this.api.signInWithOtp({
        //   connection: 'sms',
        //   phoneNumber,
        //   otp,
        // });
        // if (error) {
        //   return { session: null, mfa: null, error };
        // }
        // if (!data) {
        //   return {
        //     session: null,
        //     mfa: null,
        //     error: new Error('Incorrect data'),
        //   };
        // }
        // const { session, mfa } = data;
        // if (session) {
        //   this._setSession(session);
        // }
        // return { session, mfa, error: null };
      }
    }

    return {
      session: null,
      mfa: null,
      error: new Error('incorrect combination'),
    };
  }

  // public verifyOtp({ params }: { params: string }): Promise<{
  //   session: Session | null;
  //   mfa: null | {
  //     ticket: string;
  //   };
  //   error: Error | null;
  // }> {

  //   return {}};
  // }

  /**
   * Use `verifyEmail` to verify a user's email using a ticket.
   *
   * @example
   * auth.verifyEmail({email, tricket})
   *
   * @docs https://docs.nhost.io/TODO
   */

  /**
   * Use `signOut` to sign out a user
   *
   * @example
   * signOut();
   *
   * @docs https://docs.nhost.io/TODO
   */
  public async signOut(params?: { all?: boolean }): Promise<unknown> {
    const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);

    this._clearSession();

    const { error } = await this.api.signOut({
      refreshToken,
      all: params?.all,
    });
    return { error };
  }

  public async verifyEmail(params: {
    email: string;
    ticket: string;
  }): Promise<unknown> {
    const { data, error } = await this.api.verifyEmail(params);

    return { data, error };
  }

  /**
   * Use `onTokenChanged` to add a custom function that will trigger whenever
   * the access and refresh token is changed.
   *
   * @example
   * auth.onTokenChanged(() => console.log('access token changed'););
   *
   * @docs https://docs.nhost.io/TODO
   */
  public onTokenChanged(fn: Function): Function {
    this.onTokenChangedFunctions.push(fn);

    // get internal index of this function
    const index = this.onTokenChangedFunctions.length - 1;

    const unsubscribe = () => {
      try {
        // replace onTokenChanged with empty function
        this.onTokenChangedFunctions[index] = () => {};
      } catch (err) {
        console.warn(
          'Unable to unsubscribe onTokenChanged function. Maybe the functions is already unsubscribed?'
        );
      }
    };

    return unsubscribe;
  }

  /**
   * Use `onAuthStateChanged` to add a custom function that will trigger
   * whenever the state of the user changed. Ex from signed in to signed out or
   * vice versa.
   *
   * @example
   * auth.onAuthStateChanged(({event, session}) => {
   *   console.log(`auth state changed. State is not ${event} with session: ${session}`)
   * });
   *
   * @docs https://docs.nhost.io/TODO
   */
  public onAuthStateChanged(fn: AuthChangedFunction): Function {
    this.onAuthChangedFunctions.push(fn);

    // get internal index for this functions
    const index = this.onAuthChangedFunctions.length - 1;

    const unsubscribe = () => {
      try {
        // replace onAuthStateChanged with empty function
        this.onAuthChangedFunctions[index] = () => {};
      } catch (err) {
        console.warn(
          'Unable to unsubscribe onAuthStateChanged function. Maybe you already did?'
        );
      }
    };

    return unsubscribe;
  }

  /**
   * Use `isAuthenticated` to check if the user is authenticated or not.
   *
   * If `isAuthenticated` returns null it means that the SDK is trying to sign
   * in the user but is waiting for network requests to finish.
   *
   * @example
   *
   * const  = auth.isAuthenticated();
   *
   * if (authenticated) {
   *   console.log('User is authenticated');
   * }
   *
   * @docs https://docs.nhost.io/TODO
   */
  public isAuthenticated(): boolean {
    return this.session !== null;
  }

  /**
   * Use `isAuthenticated` to check if the user is authenticated or not.
   *
   * If `isAuthenticated` returns null it means that the SDK is trying to sign
   * in the user but is waiting for network requests to finish.
   *
   * @example
   *
   * const { authenticated, loading } = auth.isAuthenticated();
   *
   * if (authenticated) {
   *   console.log('User is authenticated');
   * }
   *
   * @docs https://docs.nhost.io/TODO
   */
  public isAuthenticatedAsync(): Promise<unknown> {
    const isAuthenticated = this.isAuthenticated();

    return new Promise((resolve) => {
      if (isAuthenticated !== null) resolve(isAuthenticated);
      else {
        const unsubscribe = this.onAuthStateChanged((event, _session) => {
          resolve(event === 'SIGNED_IN');
          unsubscribe();
        });
      }
    });
  }

  /**
   * Use `getAuthenticationStatus` to get the authentication status of the user.
   *
   * if `isLoading` is true, the auth request is in transit and the SDK does not
   * yet know if the user will be logged in or not.
   *
   *
   * @example
   *
   * const { isAuthenticated, isLoading } = auth.getAuthenticationStatus();
   *
   * if (isLoading) {
   *   console.log('Loading...')
   * }
   *
   * if (isAuthenticated) {
   *   console.log('User is authenticated');
   * }
   *
   * @docs https://docs.nhost.io/TODO
   */
  public getAuthenticationStatus(): {
    isAuthenticated: boolean;
    isLoading: boolean;
  } {
    if (this.initAuthLoading)
      return { isAuthenticated: false, isLoading: true };

    return { isAuthenticated: this.session !== null, isLoading: false };
  }

  /**
   * @deprecated Use `getAccessToken()` instead.
   */

  public getJWTToken(): string | undefined {
    return this.getAccessToken();
  }

  /**
   *
   * Use `getAccessToken` to get the logged in user's access token.
   *
   * @example
   *
   * const accessToken = auth.getAccessToken();
   *
   * @docs https://docs.nhost.io/TODO
   */
  public getAccessToken(): string | undefined {
    if (!this.session) {
      return undefined;
    }

    return this.session.accessToken;
  }

  /**
   *
   * Use `refreshSession()` to refresh the current session or refresh the
   * session with an provided `refreshToken`.
   *
   * @example
   *
   * refreshToken();
   * refreshToken(refreshToken);
   *
   * @docs https://docs.nhost.io/TODO
   */
  public async refreshSession(refreshToken?: string): Promise<void> {
    const refreshTokenToUse = refreshToken
      ? refreshToken
      : await this._getItem(NHOST_REFRESH_TOKEN);

    if (!refreshTokenToUse) {
      console.warn('no refresh token found. No way of refreshing session');
    }

    return await this._refreshTokens(refreshTokenToUse);
  }

  /**
   *
   * Use `getSession()` to get the current session.
   *
   * @example
   *
   * const session = getSession();
   *
   * @docs https://docs.nhost.io/TODO
   */
  public getSession() {
    return this.session;
  }

  /**
   *
   * Use `getUser()` to get the current user.
   *
   * @example
   *
   * const user = getUser();
   *
   * @docs https://docs.nhost.io/TODO
   */
  public getUser() {
    return this.session ? this.session.user : null;
  }

  private async _setItem(key: string, value: string): Promise<void> {
    if (typeof value !== 'string') {
      console.error(`value is not of type "string"`);
      return;
    }

    switch (this.clientStorageType) {
      case 'web':
        if (typeof this.clientStorage.setItem !== 'function') {
          console.error(`this.clientStorage.setItem is not a function`);
          break;
        }
        this.clientStorage.setItem(key, value);
        break;
      case 'custom':
      case 'react-native':
        if (typeof this.clientStorage.setItem !== 'function') {
          console.error(`this.clientStorage.setItem is not a function`);
          break;
        }
        await this.clientStorage.setItem(key, value);
        break;
      case 'capacitor':
        if (typeof this.clientStorage.set !== 'function') {
          console.error(`this.clientStorage.set is not a function`);
          break;
        }
        await this.clientStorage.set({ key, value });
        break;
      case 'expo-secure-storage':
        if (typeof this.clientStorage.setItemAsync !== 'function') {
          console.error(`this.clientStorage.setItemAsync is not a function`);
          break;
        }
        this.clientStorage.setItemAsync(key, value);
        break;
      default:
        break;
    }
  }

  private async _getItem(key: string): Promise<string> {
    switch (this.clientStorageType) {
      case 'web':
        if (typeof this.clientStorage.getItem !== 'function') {
          console.error(`this.clientStorage.getItem is not a function`);
          break;
        }
        return this.clientStorage.getItem(key) as string;
      case 'custom':
      case 'react-native':
        if (typeof this.clientStorage.getItem !== 'function') {
          console.error(`this.clientStorage.getItem is not a function`);
          break;
        }
        return (await this.clientStorage.getItem(key)) as string;
      case 'capacitor':
        if (typeof this.clientStorage.get !== 'function') {
          console.error(`this.clientStorage.get is not a function`);
          break;
        }
        const res = await this.clientStorage.get({ key });
        return res.value as string;
      case 'expo-secure-storage':
        if (typeof this.clientStorage.getItemAsync !== 'function') {
          console.error(`this.clientStorage.getItemAsync is not a function`);
          break;
        }
        return this.clientStorage.getItemAsync(key) as string;
      default:
        return '';
    }
    return '';
  }

  // private async _removeItem(key: string): Promise<void> {
  //   switch (this.clientStorageType) {
  //     case 'web':
  //       if (typeof this.clientStorage.removeItem !== 'function') {
  //         console.error(`this.clientStorage.removeItem is not a function`);
  //         break;
  //       }
  //       return this.clientStorage.removeItem(key);
  //     case 'custom':
  //     case 'react-native':
  //       if (typeof this.clientStorage.removeItem !== 'function') {
  //         console.error(`this.clientStorage.removeItem is not a function`);
  //         break;
  //       }
  //       return await this.clientStorage.removeItem(key);
  //     case 'capacitor':
  //       if (typeof this.clientStorage.remove !== 'function') {
  //         console.error(`this.clientStorage.remove is not a function`);
  //         break;
  //       }
  //       await this.clientStorage.remove({ key });
  //       break;
  //     case 'expo-secure-storage':
  //       if (typeof this.clientStorage.deleteItemAsync !== 'function') {
  //         console.error(`this.clientStorage.deleteItemAsync is not a function`);
  //         break;
  //       }
  //       this.clientStorage.deleteItemAsync(key);
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // private _generateHeaders(): Headers | null {
  //   if (!this.session) {
  //     return {};
  //   }

  //   return {
  //     Authorization: `Bearer ${this.session.accessToken}`,
  //   };
  // }

  private _autoLogin(refreshToken: string | null): void {
    // Not sure about this...
    if (!isBrowser()) {
      return;
    }

    // maybe better to use setTimout hack in _refreshTokens because of SSR / Next.js
    // if (!refreshToken) {
    //   this._clearSession();
    //   return;
    // }

    this._refreshTokens(refreshToken);
  }

  private async _refreshTokens(
    paramRefreshToken: string | null
  ): Promise<void> {
    const refreshToken =
      paramRefreshToken || (await this._getItem(NHOST_REFRESH_TOKEN));

    if (!refreshToken) {
      // place at end of call-stack to let frontend get `null` first (to match SSR)
      setTimeout(() => {
        this._clearSession();
      }, 0);
      return;
    }

    try {
      // set lock to avoid two refresh token request being sent at the same time with the same token.
      // If so, the last request will fail because the first request used the refresh token

      const { session, error } = await this.api.refreshToken({ refreshToken });

      if (error) {
        if (error.message === 'Request failed with status code 401') {
          this._clearSession();
          return;
        }
      }

      if (!session) throw new Error('Invalid session data');

      this._setSession(session);
      this.tokenChanged();
    } catch (error) {
      // throw new Error(error);
    }
  }

  private tokenChanged(): void {
    for (const tokenChangedFunction of this.onTokenChangedFunctions) {
      tokenChangedFunction();
    }
  }

  private authStateChanged({
    event,
    session,
  }: {
    event: AuthChangeEvent;
    session: Session | null;
  }): void {
    for (const authChangedFunction of this.onAuthChangedFunctions) {
      authChangedFunction(event, session);
    }
  }

  private async _clearSession(): Promise<void> {
    // get previous state before clearing the session
    const { isLoading, isAuthenticated } = this.getAuthenticationStatus();

    // clear current session no mather what the previous auth state was
    this.session = null;
    this.initAuthLoading = false;

    // if the user was previously authenticated, clear all intervals and send a
    // state change call to subscribers
    if (isLoading || isAuthenticated) {
      clearInterval(this.refreshInterval);
      clearInterval(this.refreshSleepCheckInterval);

      this.authStateChanged({ event: 'SIGNED_OUT', session: null });
    }
  }

  private async _setSession(session: Session) {
    const { isAuthenticated } = this.getAuthenticationStatus();

    this.session = session;

    await this._setItem(NHOST_REFRESH_TOKEN, session.refreshToken);

    if (this.autoRefreshToken && !isAuthenticated) {
      // start refresh token interval after logging in
      const JWTExpiresIn = session.accessTokenExpiresIn;
      const refreshIntervalTime = this.refreshIntervalTime
        ? this.refreshIntervalTime
        : Math.max(30 * 1000, JWTExpiresIn - 45000); //45 sec before expires
      this.refreshInterval = setInterval(async () => {
        const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);
        this._refreshTokens(refreshToken);
      }, refreshIntervalTime);

      // refresh token after computer has been sleeping
      // https://stackoverflow.com/questions/14112708/start-calling-js-function-when-pc-wakeup-from-sleep-mode
      this.refreshIntervalSleepCheckLastSample = Date.now();
      this.refreshSleepCheckInterval = setInterval(async () => {
        if (
          Date.now() - this.refreshIntervalSleepCheckLastSample >=
          this.sampleRate * 2
        ) {
          const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);
          this._refreshTokens(refreshToken);
        }
        this.refreshIntervalSleepCheckLastSample = Date.now();
      }, this.sampleRate);

      this.authStateChanged({ event: 'SIGNED_IN', session: this.session });
    }

    this.initAuthLoading = false;
  }

  private clearHashFromUrl() {
    window.history.replaceState(
      {},
      document.title,
      window.location.href.split('#')[0]
    );
  }
}
