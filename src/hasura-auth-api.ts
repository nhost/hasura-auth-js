import axios, { AxiosInstance } from 'axios';
import {
  apiRefreshTokenResponse,
  ApiSignInResponse,
  ApiSignInWithOtpParams,
  ApiSignInWithPasswordless,
  ApiSignOutResponse,
  ApiSignUpWithEmailAndPasswordReponse,
  SignUpWithEmailAndPasswordOptions,
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
  public async signUpWithEmailAndPassword(
    options: SignUpWithEmailAndPasswordOptions
  ): Promise<ApiSignUpWithEmailAndPasswordReponse> {
    try {
      const res = await this.httpClient.post('/signup/email-password', options);
      return { session: res.data.session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  async signInWithEmailAndPassword(params: {
    email: string;
    password: string;
  }): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post('/signin/email-password', params);
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signInWithPasswordless(
    params: ApiSignInWithPasswordless
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post(
        '/signin/passwordless/start',
        params
      );
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signInWithOtp(
    params: ApiSignInWithOtpParams
  ): Promise<ApiSignInResponse> {
    try {
      const res = await this.httpClient.post('/signin/otp', params);
      return { data: res.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut(params: {
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

  async refreshToken(params: {
    refreshToken: string;
  }): Promise<apiRefreshTokenResponse> {
    try {
      const res = await this.httpClient.post('/token', params);

      return { session: res.data, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  async verifyEmail(params: {
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
