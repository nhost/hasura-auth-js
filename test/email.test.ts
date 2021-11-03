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

test('change email', async () => {
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

  // start actual test
  const changeEmailResponse = await auth.changeEmail({
    newEmail: `a+${email}`,
  });

  expect(changeEmailResponse.error).toBeNull();

  // get email that was sent
  const changeEmailEmail = await mailhog.latestTo(email);

  if (!changeEmailEmail?.html) {
    throw new Error('email does not exists');
  }

  // get verify email link
  const changeEmailLink = htmlUrls({ html: changeEmailEmail.html }).find(
    (href: { value: string; url: string; uri: string }) => {
      return href.url.includes('emailConfirmChange');
    }
  );

  // verify email
  await axios.get(changeEmailLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => {
      return status === 302;
    },
  });
});
