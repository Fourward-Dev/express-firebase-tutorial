import db from "../firebase-config.js";

const teacherDevicesRef = (email) => {
  return db.collection("teachers").doc(email).collection("devices");
};

const getTeacherPlan = async (email) => {
  const teacherDocSnapShot = await db.collection("teachers").doc(email).get();
  //check if the account exists
  if (!teacherDocSnapShot.exists) {
    const error = new Error("teacher account does not exists");
    error.statusCode = 404;
    throw error;
  }
  const teacher = teacherDocSnapShot.data();
  const { planId } = teacher;
  return planId;
};

//check device existence
const isDeviceExists = async (email, brand, phoneModelName) => {
  const teacherDevicesSnapshot = await teacherDevicesRef(email).get();
  const devices = teacherDevicesSnapshot.docs.map((doc) => doc.data());
  const isDeviceExists = devices.some(
    (device) =>
      device.brand === brand && device.phoneModelName === phoneModelName
  );
  if (!isDeviceExists) return false;
  return true;
};

//add a new device
const addDevice = async (email, brand, phoneModelName) => {
  const teacherDevicesSnapshot = await teacherDevicesRef(email).get();
  const devices = teacherDevicesSnapshot.docs.map((doc) => doc.data());
  const teacherDocRef = db.collection("teachers").doc(email);
  const teacherSnapshot = await teacherDocRef.get();
  if (devices.length < teacherSnapshot.data().devicesNumber) {
    await teacherDevicesRef(email).add({
      brand,
      phoneModelName,
      date: new Date().toLocaleDateString("fr-FR"),
    });
    return;
  }
  const error = new Error("Reached device's limit");
  error.statusCode = 409;
  throw error;
};

export { getTeacherPlan, isDeviceExists, addDevice };
