import express from "express";
import "dotenv/config";
import { body, validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import { errorResponder } from "./error-handlers/errorResponder.js";
import { snapshot, teachersRef } from "./helpers/queries.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

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
      const snapshotRes = await snapshot(req.user.email);
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
          date: new Date().toLocaleDateString("fr-FR"),
        });
        res
          .status(201)
          .send({ succMsg: "device identifier successfully saved" });
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
