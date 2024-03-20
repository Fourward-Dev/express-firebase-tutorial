import { initializeApp, applicationDefault, cert } from "firebase-admin/app";

import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";

import serviceAccount from "./secrets.json" assert { type: "json" };

// const serviceAccount = {
//   type: process.env.type,
//   project_id: process.env.project_id,
//   private_key_id: process.env.private_key_id,
//   client_email: process.env.client_email,
//   client_id: process.env.client_email,
//   auth_uri: process.env.auth_uri,
//   token_uri: process.env.token_uri,
//   auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
//   client_x509_cert_url: process.env.client_x509_cert_url,
//   universe_domain: process.env.universe_domain,
// };
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export default db;
