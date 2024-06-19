/* eslint-disable no-undef */
import db from "../firebas-config";
import { server, app } from "../index";
import supertest from "supertest";
import {
  deleteDevicesSubCollection,
  deleteDoc,
} from "../helpers/deleteFromFirstore";

beforeEach(async () => await deleteDevicesSubCollection("test@gmail.com"));
beforeEach(async () => await deleteDoc("teachers", "test@gmail.com"));
afterAll(() => server.close());

describe("test login endpoint", () => {
  beforeEach(
    async () =>
      await db
        .collection("teachers")
        .doc("test@gmail.com")
        .set({ devicesNumber: 1, planId: 1 })
  );
  beforeEach(async () => {
    await db
      .collection("teachers")
      .doc("test@gmail.com")
      .collection("devices")
      .add({
        brand: "test-brand",
        phoneModelName: "test-phoneModelName",
        date: new Date().toLocaleDateString("fr-FR"),
      });
  });
  test("valid credentials", async () => {
    const response = await supertest(app)
      .post("/teacher/login")
      .send({
        email: "test@gmail.com",
        brand: "test-brand",
        phoneModelName: "test-phoneModelName",
      })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body).toEqual({
      succMsg: "logged in successfully",
      planId: 1,
    });
  });

  test("invalid email", async () => {
    const response = await supertest(app)
      .post("/teacher/login")
      .send({
        email: "unvalid@gmail.com",
        brand: "test-brand",
        phoneModelName: "test-phoneModelName",
      })
      .expect("Content-Type", /json/)
      .expect(404);
    expect(response.body).toEqual({ error: "teacher account does not exists" });
  });
  test("unregistred device", async () => {
    const response = await supertest(app)
      .post("/teacher/login")
      .send({
        email: "test@gmail.com",
        brand: "new-brand",
        phoneModelName: "new-phoneModelName",
      })
      .expect("Content-Type", /json/)
      .expect(409);
    expect(response.body).toEqual({ error: "Reached device's limit" });
  });
});

describe("test plan endpoint", () => {
  beforeEach(async () => await deleteDoc("plan", "1"));
  beforeEach(
    async () =>
      await db
        .collection("plans")
        .doc("1")
        .set({
          name: "basic",
          features: ["test-feature-1", "test-feature-2", "test-feature-3"],
        })
  );

  test("get plan with a valid planId", async () => {
    const response = await supertest(app)
      .get("/plan/1")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({
      name: "basic",
      features: ["test-feature-1", "test-feature-2", "test-feature-3"],
    });
  });
  test("get plan with a invalid planId", async () => {
    const response = await supertest(app)
      .get("/plan/10")
      .expect("Content-Type", /json/)
      .expect(404);
    expect(response.body).toEqual({
      error: "plan with the id 10 does not exists",
    });
  });
});

test("login with the second device", async () => {
  const testTeacherRef = db.collection("teachers").doc("test@gmail.com");
  await testTeacherRef.set({ devicesNumber: 2, planId: 1 });
  await testTeacherRef.collection("devices").add({
    brand: "test-brand",
    phoneModelName: "test-phoneModelName",
    date: new Date().toLocaleDateString("fr-FR"),
  });
  const response = await supertest(app)
    .post("/teacher/login")
    .send({
      email: "test@gmail.com",
      brand: "new-brand",
      phoneModelName: "new-phoneModelName",
    })
    .expect("Content-Type", /json/)
    .expect(200);
  expect(response.body).toEqual({
    succMsg: "logged in successfully",
    planId: 1,
  });
});
