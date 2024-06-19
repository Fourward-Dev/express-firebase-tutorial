import db from "../firebase-config.js";

const getPlan = async (planId) => {
  const snapshot = await db.collection("plans").doc(planId).get();
  if (!snapshot.exists) {
    const error = new Error(`plan with the id ${planId} does not exists`);
    error.statusCode = 404;
    throw error;
  }
  return snapshot.data();
};

export default getPlan;
