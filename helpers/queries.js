import db from "../firebas-config.js";

const getTeacherDoc = async (email) => {
  return await db.collection("teachers").doc(email).get();
};

export default getTeacherDoc;
