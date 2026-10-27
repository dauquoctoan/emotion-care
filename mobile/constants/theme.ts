/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const themeColors = {
  dark: {
    // Background chính
    background: "#0f0f14",      // Màn hình chính
    backgroundCard: "#1e1e2a",   // Card nền tối hơn
    backgroundCardAlt: "#252530", // Card nền trung bình
    backgroundInput: "#2a2a35",   // Input, button nền
    backgroundElement: "#2d2d38", // Element phụ
    backgroundTag: "#2a2a35",     // Tag, badge nền

    // Text
    textPrimary: "#f0f0f5",      // Text chính
    textSecondary: "#d8d8e5",    // Text phụ
    textMuted: "#a0a0b0",        // Text mờ
    textPlaceholder: "#94a3b8",  // Placeholder input

    // Border
    border: "#3a3a45",           // Viền chính
    borderLight: "#404050",      // Viền sáng hơn
    borderActive: "#7c5cbf",     // Viền active (tím)

    // Primary (màu chủ đạo - tím)
    primary: "#7c5cbf",
    primaryLight: "#9b7fc7",
    primaryLighter: "#a78bfa",
    primaryBg: "#2d2840",        // Nền primary nhẹ
    primaryBgLight: "#323240",   // Nền primary sáng hơn

    // Accent colors
    accentGreen: "#6ee06e",      // Xanh (biết ơn, phát triển)
    accentYellow: "#f0a840",     // Vàng (hy vọng)
    accentBlue: "#7aafef",       // Xanh dương (nặng nề)
    accentPurple: "#c4b5fd",     // Tím nhạt (gợi ý)

    // Status / Feedback
    success: "#6ee06e",
    warning: "#f0a840",
    info: "#7aafef",

    // Avatar / Icon backgrounds
    avatarGreen: "#1a2e1a",
    avatarBlue: "#1a2030",
    avatarYellow: "#2e2510",
    avatarPurple: "#162516",
  },
  
  light: {
    // Background chính
    background: "#ffffff",
    backgroundCard: "#f5f5f5",
    backgroundCardAlt: "#f0f0f0",
    backgroundInput: "#fafafa",
    backgroundElement: "#eeeeee",
    backgroundTag: "#e8e8e8",

    // Text
    textPrimary: "#1a1a1f",
    textSecondary: "#3a3a4a",
    textMuted: "#6b6b80",
    textPlaceholder: "#9ca3af",

    // Border
    border: "#e5e5e5",
    borderLight: "#d4d4d8",
    borderActive: "#7c5cbf",

    // Primary (màu chủ đạo - tím)
    primary: "#7c5cbf",
    primaryLight: "#9b7fc7",
    primaryLighter: "#a78bfa",
    primaryBg: "#f3f0ff",
    primaryBgLight: "#faf8ff",

    // Accent colors
    accentGreen: "#10b981",
    accentYellow: "#f59e0b",
    accentBlue: "#3b82f6",
    accentPurple: "#8b5cf6",

    // Status / Feedback
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",

    // Avatar / Icon backgrounds
    avatarGreen: "#d1fae5",
    avatarBlue: "#dbeafe",
    avatarYellow: "#fef3c7",
    avatarPurple: "#e0e7ff",
  },
};
