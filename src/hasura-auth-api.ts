import axios, { AxiosInstance } from 'axios';
import {
  SignUpEmailPasswordParams,
  SignInEmailPasswordParams,
  SignInPasswordlessEmailParmas,
  SignInPasswordlessSmsParmas,
  SignInPasswordlessSmsOtpParams,
  ApiSignInResponse,
  ApiSignOutResponse,
  ApiRefreshTokenResponse,
} from './utils/types';

export class HasuraAuthApi {
  private httpClient: AxiosInstance;
  private url: string;

  constructor({ url = '' }) {
    this.url = url;

    this.httpClient = axios.create({
      baseURL: this.url,
      timeout: 10000,
    });
  }

  /**
   * Use `signUpWithEmailAndPassword` to sign up a new user using email and password.
   */
  public async signUpEmailPassword(
    params: SignUpEmailPasswordParams
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post('/signup/email-password', params);
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  public async signInEmailPassword(
    params: SignInEmailPasswordParams
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post('/signin/email-password', params);
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  public async signInPasswordlessEmail(
    params: SignInPasswordlessEmailParmas
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post(
        '/signin/passwordless/email',
        params
      );
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  public async signInPasswordlessSms(
    params: SignInPasswordlessSmsParmas
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post(
        '/signin/passwordless/sms',
        params
      );
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  public async signInPasswordlessSmsOtp(
    params: SignInPasswordlessSmsOtpParams
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post(
        '/signin/passwordless/sms/otp',
        params
      );
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  public async signOut(params: {
    refreshToken: string;
    all?: boolean;
  }): Promise<ApiSignOutResponse> {
    try {
      await this.httpClient.post('/signout', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  public async refreshToken(params: {
    refreshToken: string;
  }): Promise<ApiRefreshTokenResponse> {
    try {
      const res = await this.httpClient.post('/token', params);

      return { session: res.data, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  // resetPassword
  // changePassword
  // sendVerificationEmail
  // changeEmail
  // deanonymize

  public async verifyEmail(params: {
    email: string;
    ticket: string;
  }): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post('/user/email/verify', params);

      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
