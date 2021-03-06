import faker from 'faker';
import axios from 'axios';
const htmlUrls = require('html-urls');

import { mailhog, auth, signUpAndVerifyUser } from './helpers';

test('sign in user with email and password', async () => {
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  await signUpAndVerifyUser({ email, password });

  // sign in
  const { session, error } = await auth.signIn({
    email,
    password,
  });

  expect(error).toBeNull();
  expect(session).toBeTruthy();

  expect(session).toMatchObject({
    accessToken: expect.any(String),
    accessTokenExpiresIn: expect.any(Number),
    refreshToken: expect.any(String),
    user: {
      id: expect.any(String),
      createdAt: expect.any(String),
      displayName: email,
      avatarUrl: expect.any(String),
      locale: 'en',
      email: email,
      isAnonymous: false,
      defaultRole: expect.any(String),
      roles: expect.any(Array),
    },
  });
});

test('sign in user with passwordless email (magic link)', async () => {
  const email = faker.internet.email().toLocaleLowerCase();

  // sign up
  const { session, error } = await auth.signIn({
    email,
  });

  expect(error).toBeNull();
  expect(session).toBeNull();

  // get email that was sent
  const message = await mailhog.latestTo(email);

  if (!message?.html) {
    throw new Error('email does not exists');
  }

  // get passwordless email ink
  const emailLink = htmlUrls({ html: message.html }).find(
    (href: { value: string; url: string; uri: string }) => {
      return href.url.includes('signinPasswordless');
    }
  );

  // verify email
  await axios.get(emailLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => {
      return status === 302;
    },
  });
});
