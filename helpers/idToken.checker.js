import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();
export const verify = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  return ticket.getPayload();
};
