import axios from "axios";
import { getOrCreateDeviceId } from "../device-id.service";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const deviceId = await getOrCreateDeviceId();

    config.headers["x-device-id"] = deviceId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
