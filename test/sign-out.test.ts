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

test('sign in user with email and password', async () => {
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

  // sign in
  const { session, error } = await auth.signIn({
    email,
    password,
  });

  expect(error).toBeNull();
  expect(session).toBeTruthy();

  expect(auth.getSession()).toBeTruthy();

  await auth.signOut();

  expect(auth.getSession()).toBeNull();
});
