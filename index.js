import express from "express";
import "dotenv/config";
import db from "./firebas.config.js";
import { body, validationResult } from "express-validator";
import { verify } from "./helpers/idToken.checker.js";
import { errorResponder } from "./error-handlers/errorResponder.js";
import { snapshot, teachersRef } from "./helpers/queries.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

app.post(
  "/teacher",
  [
    body("email")
      .trim()
      .notEmpty()
      .escape()
      .isEmail()
      .withMessage("Email must be an email!"),
    body("devicesNumber")
      .notEmpty()
      .escape()
      .isInt()
      .toInt()
      .withMessage("devicesNumber must be int!"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      //TODO check email existence
      const snapshotRes = await snapshot(email);
      if (!snapshotRes.empty) {
        const error = new Error("Account already exists");
        error.statusCode = 409;
        throw error;
      }
      await db.collection("teachers").add({
        email: req.body.email,
        devicesNumber: req.body.devicesNumber,
      });
      res.status(201).send({ succMsg: "account created" });
    } catch (error) {
      next(error);
    }
  }
);

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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    //idToken verification
    let payload;
    let email;
    try {
      payload = await verify(req.body.idToken);
    } catch (error) {
      error = new Error("unauthorized");
      error.statusCode = 401;
      throw error;
    }

    email = payload["email"];
    //retrieve teacher by email
    let error;
    try {
      const snapshotRes = await snapshot(email);
      //check if account exist or not
      if (snapshotRes.empty || !snapshotRes.docs[0].data().email) {
        error = new Error("teacher account does not exists");
        error.statusCode = 404;
        throw error;
      }
      const teacherDoc = snapshotRes.docs[0];
      const teacherDevicesRef = teachersRef
        .doc(teacherDoc.id)
        .collection("devices");
      const devicesSubCollection = await teacherDevicesRef.get();
      //check if the teacher has reached the device limit
      if (devicesSubCollection.docs.length < teacherDoc.data().devicesNumber) {
        //update teacher doc (add devices sub-collaction)
        await teacherDevicesRef.add({
          brand: req.body.brand,
          phoneModelName: req.body.phoneModelName,
        });
        res.status(201).send({ succMsg: "logged in successfully" });
      } else {
        //check device info
        const isExists = devicesSubCollection.docs.some(
          (doc) =>
            doc.data().brand === req.body.brand &&
            doc.data().phoneModelName === req.body.phoneModelName
        );
        if (!isExists) {
          error = new Error("unauthorized");
          error.statusCode = 401;
          throw error;
        }
        res.status(200).send({ succMsg: "logged in successfully" });
      }
    } catch (error) {
      next(error);
    }
  }
);

app.use(errorResponder);
app.listen(port, () => {
  console.log(`ClassQ Server listening on port ${port}`);
});
