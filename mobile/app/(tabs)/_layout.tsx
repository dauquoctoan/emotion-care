import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";

const { Icon, Label } = NativeTabs.Trigger;

const TABS = [
  {
    name: "index",
    title: "Khám Phá",
    sf: "sparkles",
    src: require("../../assets/images/house.png"),
  },
  {
    name: "explore",
    title: "Chủ Đề",
    sf: "square.grid.2x2",
    src: require("../../assets/images/list_bullet.png"),
  },
  {
    name: "write",
    title: "Studio",
    sf: "plus.circle.fill",
    src: require("../../assets/images/pencil.png"),
    prominent: true,
  },
  {
    name: "nearby",
    title: "Lân Cận",
    sf: "location",
    src: require("../../assets/images/house.png"),
  },
  {
    name: "library",
    title: "Thư Viện",
    sf: "bookmark",
    src: require("../../assets/images/list_bullet.png"),
  },
] as const;

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#0E1017"
      blurEffect="systemChromeMaterialDark"
      disableTransparentOnScrollEdge={true}
      shadowColor="#000000"
      tintColor="#C084FC"
      iconColor={{
        default: "#64748B",
        selected: "#C084FC",
      }}
      labelStyle={{
        default: {
          color: "#94A3B8",
          fontSize: 10,
          fontWeight: "600",
        },
        selected: {
          color: "#C084FC",
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      {TABS.map((tab) => (
        <NativeTabs.Trigger
          key={tab.name}
          name={tab.name}
          prominent={'prominent' in tab ? tab.prominent : undefined}
        >
          {Platform.OS === "ios" ? (
            <Icon
              selectedColor="#C084FC"
              sf={tab.sf as any}
            />
          ) : (
            <Icon
              selectedColor="#C084FC"
              src={tab.src}
            />
          )}
          <Label>{tab.title}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
