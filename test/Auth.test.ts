import { HasuraAuthClient } from '../src/index';
var faker = require('faker');

const AUTH_BACKEND_URL = 'http://localhost:1337/v1/auth';

const auth = new HasuraAuthClient({
  url: AUTH_BACKEND_URL,
});

test('sign up user', async () => {
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  const { session, error } = await auth.signUp({
    email,
    password,
  });

  console.log({ session });
  console.log({ error });
});
