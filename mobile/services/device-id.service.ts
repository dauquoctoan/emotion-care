import { useDeviceStore } from "@/stores/user.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { deviceInfo } from "./api-service.ts";


const DEVICE_ID_KEY = "device_id";


export async function getOrCreateDeviceId(): Promise<string> {
  const cached = useDeviceStore.getState().deviceId;

  if (cached) {
    return cached;
  }

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (stored) {
    useDeviceStore.getState().setDeviceId(stored);

    return stored;
  }

  const newId = uuidv4();

  await AsyncStorage.setItem(
    DEVICE_ID_KEY,
    newId
  );

  useDeviceStore.getState().setDeviceId(newId);

  return newId;
}


export async function initDevice() {
  await getOrCreateDeviceId();

  const response = await deviceInfo();

  if(response?.data.success){
    useDeviceStore
    .getState()
    .setDevice(response?.data?.data);
  }

  return response?.data?.data;
}


export async function getDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY);
}


export async function setDeviceId(deviceId: string) {
  await AsyncStorage.setItem(
    DEVICE_ID_KEY,
    deviceId
  );

  useDeviceStore
    .getState()
    .setDeviceId(deviceId);
}


export async function clearDeviceId() {
  await AsyncStorage.removeItem(
    DEVICE_ID_KEY
  );

  useDeviceStore
    .getState()
    .clearDevice();
}