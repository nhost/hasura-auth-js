import { HasuraAuthClient } from '../src/index';
import faker from 'faker';
import createMailhogClient from 'mailhog';
import axios from 'axios';

const htmlUrls = require('html-urls');

const AUTH_BACKEND_URL = 'http://localhost:1337/v1/auth';

const auth = new HasuraAuthClient({
  url: AUTH_BACKEND_URL,
});

const mailhog = createMailhogClient({
  host: 'localhost',
  port: 8025,
});

test('change existing password', async () => {
  // create and verify user
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  // sign up
  await auth.signUp({
    email,
    password,
  });

  // get email that was sent
  const message = await mailhog.latestTo(email);

  if (!message?.html) {
    throw new Error('email does not exists');
  }

  // get verify email link
  const verifyEmailLink = htmlUrls({ html: message.html }).find(
    (href: { value: string; url: string; uri: string }) => {
      return href.url.includes('verifyEmail');
    }
  );

  // verify email
  await axios.get(verifyEmailLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => {
      return status === 302;
    },
  });

  const signInA = await auth.signIn({
    email,
    password,
  });

  expect(signInA.error).toBeNull();
  expect(signInA.session).toBeTruthy();

  const newPassword = `${password}-new`;
  const changePasswordResponse = await auth.changePassword({
    oldPassword: password,
    newPassword,
  });

  expect(changePasswordResponse.error).toBeNull();

  await auth.signOut();

  const { session, error } = await auth.signIn({
    email,
    password: newPassword,
  });

  expect(error).toBeNull();
  expect(session).toBeTruthy();
});

test('reset password', async () => {
  // TODO: Put in a helper function
  // create and verify user
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  // sign up
  await auth.signUp({
    email,
    password,
  });

  // get email that was sent
  const message = await mailhog.latestTo(email);

  if (!message?.html) {
    throw new Error('email does not exists');
  }

  // get verify email link
  const verifyEmailLink = htmlUrls({ html: message.html }).find(
    (href: { value: string; url: string; uri: string }) => {
      return href.url.includes('verifyEmail');
    }
  );

  // verify email
  await axios.get(verifyEmailLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => {
      return status === 302;
    },
  });

  // reset password
  const { error } = await auth.resetPassword({ email });

  expect(error).toBeNull();

  // get email that was sent
  const messageResetPassword = await mailhog.latestTo(email);

  if (!messageResetPassword?.html) {
    throw new Error('email does not exists');
  }

  // get verify email link
  const resetPasswordLink = htmlUrls({ html: messageResetPassword.html }).find(
    (href: { value: string; url: string; uri: string }) => {
      return href.url.includes('passwordReset');
    }
  );

  // verify email
  await axios.get(resetPasswordLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => {
      return status === 302;
    },
  });
});
