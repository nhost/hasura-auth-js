import axios, { AxiosInstance } from 'axios';
import {
  ResetPasswordParams,
  ChangePasswordParams,
  SendVerificationEmailParams,
  SignUpEmailPasswordParams,
  SignInEmailPasswordParams,
  SignInPasswordlessEmailParams,
  SignInPasswordlessSmsParams,
  SignInPasswordlessSmsOtpParams,
  ChangeEmailParams,
  DeanonymizeParams,
  ApiSignInResponse,
  ApiSignOutResponse,
  ApiRefreshTokenResponse,
  ApiResetPasswordResponse,
  ApiChangePasswordResponse,
  ApiSendVerificationEmailResponse,
  ApiChangeEmailResponse,
  ApiDeanonymizeResponse,
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
    params: SignInPasswordlessEmailParams
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
    params: SignInPasswordlessSmsParams
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

  public async resetPassword(
    params: ResetPasswordParams
  ): Promise<ApiResetPasswordResponse> {
    try {
      await this.httpClient.post('/user/password/reset', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  public async changePassword(
    params: ChangePasswordParams
  ): Promise<ApiChangePasswordResponse> {
    try {
      await this.httpClient.post('/user/password', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  public async sendVerificationEmail(
    params: SendVerificationEmailParams
  ): Promise<ApiSendVerificationEmailResponse> {
    try {
      await this.httpClient.post('/user/email/send-verification-email', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  public async changeEmail(
    params: ChangeEmailParams
  ): Promise<ApiChangeEmailResponse> {
    try {
      await this.httpClient.post('/user/email/change', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  public async deanonymize(
    params: DeanonymizeParams
  ): Promise<ApiDeanonymizeResponse> {
    try {
      await this.httpClient.post('/user/deanonymize', params);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

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
