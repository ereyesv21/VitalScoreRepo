/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: {
    dark: '#1D6B4F',
    medium: '#43A047',
  },
  secondary: {
    yellow: '#F4C542',
    orange: '#F28C38',
  },
  neutral: {
    dark: '#37474F',
    medium: '#78909C',
    light: '#ECEFF1',
  },
  background: {
    light: '#FFFFFF',
    dark: '#F5F5F5',
  },
  text: {
    light: '#FFFFFF',
    dark: '#37474F',
  },
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
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
} as const;
