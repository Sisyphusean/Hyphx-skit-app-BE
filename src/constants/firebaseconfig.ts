import dotenv from 'dotenv';

dotenv.config();

const checkUndefined = (key: string, value: string | undefined) => {
    if (value === undefined) {
      throw new Error(`Undefined value for key: ${key}`);
    }
  };

  checkUndefined('FIREBASE_AUTH_PROVIDER_X509_CERT_URL', process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL);
  checkUndefined('FIREBASE_AUTH_URI', process.env.FIREBASE_AUTH_URI);
  checkUndefined('FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL);
  checkUndefined('FIREBASE_CLIENT_ID', process.env.FIREBASE_CLIENT_ID);
  checkUndefined('FIREBASE_CLIENT_X509_CERT_URL', process.env.FIREBASE_CLIENT_X509_CERT_URL);
  checkUndefined('FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY);
  checkUndefined('FIREBASE_PRIVATE_KEY_ID', process.env.FIREBASE_PRIVATE_KEY_ID);
  checkUndefined('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID);
  checkUndefined('FIREBASE_TOKEN_URI', process.env.FIREBASE_TOKEN_URI);
  checkUndefined('FIREBASE_TYPE', process.env.FIREBASE_TYPE);
  checkUndefined('FIREBASE_UNIVERSE_DOMAIN', process.env.FIREBASE_UNIVERSE_DOMAIN);
  

export const firebaseConfig = {
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
    auth_uri: process.env.FIREBASE_AUTH_URI as string,
    client_email: process.env.FIREBASE_CLIENT_EMAIL as string,
    client_id: process.env.FIREBASE_CLIENT_ID as string,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL as string,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID as string,
    project_id: process.env.FIREBASE_PROJECT_ID as string,
    token_uri: process.env.FIREBASE_TOKEN_URI as string,
    type: process.env.FIREBASE_TYPE as string,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN as string
}

