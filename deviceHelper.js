export const getDeviceId = () => {
  let did = localStorage.getItem("device_id");
  if (!did) {
    did = crypto.randomUUID();
    localStorage.setItem("device_id", did);
  }
  return did;
};
