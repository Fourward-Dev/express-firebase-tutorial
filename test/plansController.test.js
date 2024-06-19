/* eslint-disable no-undef */
import getPlan from "../controllers/plansController";
import db from "../firebas-config";
import { deleteDoc } from "../helpers/deleteFromFirstore";

beforeEach(async () => await deleteDoc("plans", "1"));
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

describe("Testing plansController", () => {
  test("getPlan: invalid planId", async () => {
    try {
      await getPlan("10");
    } catch (e) {
      const expectedError = new Error("plan with the id 10 does not exists");
      expectedError.statusCode = 404;
      expect(e).toEqual(expectedError);
    }
  });
  test("getPlan: valid planId", async () => {
    const plan = await getPlan("1");
    expect(plan).toEqual({
      name: "basic",
      features: ["test-feature-1", "test-feature-2", "test-feature-3"],
    });
  });
});
