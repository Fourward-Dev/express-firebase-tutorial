import db from "../firebas.config";
const deleteDevicesSubCollection = async (email) => {
  const collectionRef = db
    .collection("teachers")
    .doc(email)
    .collection("devices");
  const snapshot = await collectionRef.get();
  const docs = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(docs);
};

const deleteTeacherDoc = async (email) => {
  await db.collection("teachers").doc(email).delete();
};

export { deleteDevicesSubCollection, deleteTeacherDoc };
