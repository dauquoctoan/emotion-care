import { create } from "zustand";

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  district: string | null;
  region: string | null;
}

interface LocationStore extends LocationState {
  setLocation: (location: LocationState) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  latitude: null,
  longitude: null,
  city: null,
  district: null,
  region: null,

  setLocation: (location) => set(location),

  clearLocation: () =>
    set({
      latitude: null,
      longitude: null,
      city: null,
      district: null,
      region: null,
    }),
}));
