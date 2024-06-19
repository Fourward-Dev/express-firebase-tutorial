/* eslint-disable no-undef */
import { initializeApp, cert } from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";
import "dotenv/config";

const envName = process.env.NODE_ENV || "test";
initializeApp({
  credential: cert({
    type: process.env.type_test,
    project_id:
      envName === "test" ? process.env.project_id_test : process.env.project_id,
    private_key_id:
      envName === "test"
        ? process.env.private_key_id_test
        : process.env.private_key_id,
    private_key:
      envName === "test"
        ? process.env.private_key_test?.replace(/\\n/g, "\n")
        : process.env.private_key?.replace(/\\n/g, "\n"),
    client_email:
      envName === "test"
        ? process.env.client_email_test
        : process.env.client_email,
    client_id:
      envName === "test" ? process.env.client_id_test : process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url:
      envName === "test"
        ? process.env.client_x509_cert_url_test
        : process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  }),
});

const db = getFirestore();

export default db;
