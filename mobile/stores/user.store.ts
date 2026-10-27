import { Device, DeviceSetting } from "@/types/type";
import { create } from "zustand";

interface DeviceStore {
  deviceId: string | null;
  device: Device | null;
  setting: DeviceSetting | null;

  setDeviceId: (deviceId: string) => void;
  setDevice: (device: Device) => void;
  setSetting: (setting: DeviceSetting | null) => void;
  clearDevice: () => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceId: null,
  device: null,
  setting: null,

  setDeviceId: (deviceId) =>
    set({
      deviceId,
    }),

  setDevice: (device) =>
    set({
      device,
      deviceId: device.device_token,
      setting: device.setting ?? null,
    }),

  setSetting: (setting) =>
    set({
      setting,
    }),

  clearDevice: () =>
    set({
      deviceId: null,
      device: null,
      setting: null,
    }),
}));

export const useDeviceId = () =>
  useDeviceStore((state) => state.deviceId);

export const useDeviceSetting = () =>
  useDeviceStore((state) => state.setting);

export const useDevice = () =>
  useDeviceStore((state) => state.device);