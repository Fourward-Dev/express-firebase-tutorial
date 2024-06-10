import db from "./firebas.config.js";

const teacherDevicesRef = (email) => {
  return db.collection("teachers").doc(email).collection("devices");
};

//check if the account exists
const isAccountExists = async (email) => {
  const teacherDocSnapShot = await db.collection("teachers").doc(email).get();
  if (!teacherDocSnapShot.exists) return false;
  return true;
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

export { isAccountExists, isDeviceExists, addDevice };
