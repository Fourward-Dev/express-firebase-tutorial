/* eslint-disable no-undef */
import {
  addDevice,
  getTeacherPlan,
  isDeviceExists,
} from "../controllers/authenticationController.js";
import db from "../firebas-config";
import {
  deleteDevicesSubCollection,
  deleteDoc,
} from "../helpers/deleteFromFirstore";

beforeEach(async () => await deleteDevicesSubCollection("test@gmail.com"));
beforeEach(async () => await deleteDoc("teachers", "test@gmail.com"));
beforeEach(
  async () =>
    await db
      .collection("teachers")
      .doc("test@gmail.com")
      .set({ devicesNumber: 1, planId: 1 })
);

describe("test authenticationController", () => {
  test("getTeacherPlan: invalid account", async () => {
    try {
      await getTeacherPlan("invalid@gmail.com");
    } catch (e) {
      const expectedError = new Error("teacher account does not exists");
      expectedError.statusCode = 404;
      expect(e).toEqual(expectedError);
    }
  });
  test("getTeacherPlan: valid account", async () => {
    const planId = await getTeacherPlan("test@gmail.com");
    expect(planId).toBe(1);
  });
  test("isDeviceExists: login with unregistred device", async () => {
    const isExists = await isDeviceExists(
      "test@gmail.com",
      "samsung",
      "unregistred-model"
    );
    expect(isExists).toBe(false);
  });
  test("isDeviceExists: login with a registred device", async () => {
    await db
      .collection("teachers")
      .doc("test@gmail.com")
      .collection("devices")
      .add({
        brand: "test-brand",
        phoneModelName: "test-phoneModelName",
        date: new Date().toLocaleDateString("fr-FR"),
      });
    const isExists = await isDeviceExists(
      "test@gmail.com",
      "test-brand",
      "test-phoneModelName"
    );
    expect(isExists).toBe(true);
  });

  test("add device", async () => {
    await addDevice("test@gmail.com", "test-brand", "test-phoneModelName");
    const teacherDevicesRef = db
      .collection("teachers")
      .doc("test@gmail.com")
      .collection("devices");
    const snapshot = await teacherDevicesRef.get();
    const { brand, phoneModelName } = snapshot.docs[0].data();
    expect({ brand, phoneModelName }).toEqual({
      brand: "test-brand",
      phoneModelName: "test-phoneModelName",
    });
  });
  test("surpass device's limits", async () => {
    await db
      .collection("teachers")
      .doc("test@gmail.com")
      .collection("devices")
      .add({
        brand: "test-brand",
        phoneModelName: "test-phoneModelName",
        date: new Date().toLocaleDateString("fr-FR"),
      });
    try {
      await addDevice("test@gmail.com", "new-brand", "new-phoneModelName");
    } catch (e) {
      const expectedError = new Error("Reached device's limit");
      expectedError.statusCode = 409;
      expect(e).toEqual(expectedError);
    }
  });
});
