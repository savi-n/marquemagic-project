import axios from "axios";
import { API_END_POINT, ENDPOINT_BANK } from "../_config/app.config";

export const getKYCData = async (formData, token) => {
  try {
    const url = `${ENDPOINT_BANK}/getKycDataUiUx`;
    const config = {
      headers: {
        "Content-type": "multipart/form-data",
        Authorization: token,
      },
    };
    const g = await axios.post(url, formData, config);
    const t = await g;
    return t;
  } catch (err) {
    return { data: { message: err.message, status: "nok" } };
  }
};

export const verifyPan = async (ref_id, number, name, token) => {
  const url = `${ENDPOINT_BANK}/verifyKycData`;
  const g = await axios.post(
    url,
    { ref_id, number, name },
    { headers: { Authorization: token } }
  );
  const t = await g;
};

export const gstFetch = async (pan_number, state_code, token) => {
  const url = `${ENDPOINT_BANK}/GSTData`;
  if (state_code == null) state_code = "22";
  const g = await axios.post(
    url,
    { pan_number, state_code },
    { headers: { Authorization: token } }
  );
  const t = await g;
  return t;
};
