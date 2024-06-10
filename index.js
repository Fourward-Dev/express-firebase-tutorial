/* eslint-disable no-undef */
import express from "express";
import "dotenv/config";
import { body, validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import { errorResponder } from "./error-handlers/errorResponder.js";
import {
  addDevice,
  isAccountExists,
  isDeviceExists,
} from "./authenticationController.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send({ message: "hello world!" });
});

app.post(
  "/teacher/login",
  [
    body("idToken").trim().notEmpty().withMessage("idToken is required!"),
    body("brand").trim().notEmpty().escape().withMessage("Brand is required!"),
    body("phoneModelName")
      .trim()
      .notEmpty()
      .withMessage("phoneModelName is required!"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const client = new OAuth2Client();
    client
      .verifyIdToken({
        idToken: req.body.idToken,
        // eslint-disable-next-line no-undef
        audience: process.env.CLIENT_ID,
      })
      .then((ticket) => {
        const payload = ticket.getPayload();
        req.user = payload;
        next();
      })
      .catch(next);
  },
  async (req, res, next) => {
    let error;
    try {
      const email = req.user.email;
      const { brand, phoneModelName } = req.body;
      const accountExists = await isAccountExists(email);
      //check if account exist or not
      if (!accountExists) {
        error = new Error("teacher account does not exists");
        error.statusCode = 404;
        throw error;
      }
      const deviceExists = await isDeviceExists(email, brand, phoneModelName);
      if (!deviceExists) {
        //call add device
        await addDevice(email, brand, phoneModelName);
        return res.status(200).send({ succMsg: "logged in successfully" });
      }
      res.status(200).send({ succMsg: "logged in successfully" });
    } catch (error) {
      next(error);
    }
  }
);

app.use(errorResponder);
const server = app.listen(port, () => {
  console.log(`ClassQ Server listening on port ${port}`);
});

export { server, app };
