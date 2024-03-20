import db from "../firebas.config.js";

const teachersRef = db.collection("teachers");
const snapshot = async (email) => {
  return await teachersRef.where("email", "==", email).limit(1).get();
};

export { teachersRef, snapshot };
