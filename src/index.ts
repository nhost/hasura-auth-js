import AuthClient from "./AuthClient";
import { UserConfig, User, Session } from "./types";

const createAuthClient = (config: UserConfig) => {
  return new AuthClient(config);
};

export { AuthClient, createAuthClient, User, Session, UserConfig };
