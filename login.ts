// import fetch from 'node-fetch';
import { KeyPair, buildAuthenticatedFetch, createDpopHeader, generateDpopKeyPair } from '@inrupt/solid-client-authn-core';
import { LoginCredentials } from './interfaces';
const jsonld = require('jsonld');

// https://communitysolidserver.github.io/CommunitySolidServer/6.x/usage/client-credentials/
const getToken = async (email: string, password: string): Promise<AuthPair> => {

  // This assumes your server is started under http://localhost:3000/.
  // This URL can also be found by checking the controls in JSON responses when interacting with the IDP API,
  // as described in the Identity Provider section.
  const response = await fetch('http://localhost:3000/idp/credentials/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // The email/password fields are those of your account.
    // The name field will be used when generating the ID of your token.
    body: JSON.stringify({ email: email, password: password, name: 'my-token' }),
  });

  // These are the identifier and secret of your token.
  // Store the secret somewhere safe as there is no way to request it again from the server!
  const { id, secret }: any = await response.json()
  console.log('id: %s\nsecret: %s', id, secret);
  const ap = await requestAccessToken(id, secret)
  console.log(ap);
  return ap
}

interface AuthPair {
  dpopKey: KeyPair,
  accessToken: string
}

const requestAccessToken = async (id: any, secret: any): Promise<AuthPair> => {
  // A key pair is needed for encryption.
  // This function from `solid-client-authn` generates such a pair for you.
  const dpopKey = await generateDpopKeyPair();

  // These are the ID and secret generated in the previous step.
  // Both the ID and the secret need to be form-encoded.
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
  // This URL can be found by looking at the "token_endpoint" field at
  // http://localhost:3000/.well-known/openid-configuration
  // if your server is hosted at http://localhost:3000/.
  const tokenUrl = 'http://localhost:3000/.oidc/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
    },
    body: 'grant_type=client_credentials&scope=webid',
  })

  // This is the Access token that will be used to do an authenticated request to the server.
  // The JSON also contains an "expires_in" field in seconds,
  // which you can use to know when you need request a new Access token.
  const { access_token: accessToken } = await response.json()
  console.log("accessToken: %s", accessToken);


  return { dpopKey: dpopKey, accessToken: accessToken }
}

const buildAuthFetch = async (accessToken: string, dpopKey: KeyPair): Promise<typeof fetch> => {
  console.log('buildAuthFetch');

  // The DPoP key needs to be the same key as the one used in the previous step.
  // The Access token is the one generated in the previous step.
  const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });
  return authFetch
  // authFetch can now be used as a standard fetch function that will authenticate as your WebID.
  // This request will do a simple GET for example.
  //const response = await authFetch('http://localhost:3000/private');
}

export async function login(credentials: LoginCredentials) {
  const { accessToken, dpopKey } = await getToken(credentials.email, credentials.password)
  const authFetch = await buildAuthFetch(accessToken, dpopKey)

  return { accessToken, dpopKey, authFetch }
}
