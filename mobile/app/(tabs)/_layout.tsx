import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

const TABS = [
  {
    name: "index",
    title: "Trang chủ",
    icon: "house.fill",
    src: require(`../../assets/images/house.png`),
  },
  {
    name: "explore",
    title: "Khám phá",
    icon: "list.bullet",
    src: require(`../../assets/images/list_bullet.png`),
  },
  {
    name: "write",
    title: "Soạn",
    icon: "pencil",
    src: require(`../../assets/images/pencil.png`),
  },
] as const;

export default function TabLayout() {
  return (
    <NativeTabs>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          {Platform.OS === "ios" ? (
            <Icon selectedColor="#5A3E7B" sf={tab.icon} />
          ) : (
            <Icon selectedColor="#5A3E7B" src={tab.src} />
          )}
          <Label>{tab.title}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
