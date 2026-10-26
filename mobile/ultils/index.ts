import { useLocationStore } from "@/stores/location.store";
import * as Location from "expo-location";

export async function getCurrentLocation() {
  const store = useLocationStore.getState();

  if (store.latitude !== null && store.longitude !== null) {
    return {
      latitude: store.latitude,
      longitude: store.longitude,
      city: store.city,
      district: store.district,
      region: store.region,
    };
  }

  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low,
  });

  const [address] = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    city: address.city,
    district: address.district,
    region: address.region,
  };

  store.setLocation(location);

  return location;
}
