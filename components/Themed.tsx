import React from 'react';
import {
  Text as DefaultText,
  useColorScheme,
  View as DefaultView,
  Button as DefaultButton,
  StyleSheet,
} from 'react-native';

import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = ThemeProps & DefaultButton['props'];

/**
 * Возвращает цвет на основе текущей темы.
 */
export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  return colorFromProps ? colorFromProps : Colors[theme][colorName];
}

/**
 * Компонент текст с поддержкой темной и светлой темы.
 */
export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

/**
 * Компонент View с поддержкой темной и светлой темы.
 */
export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'background',
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

/**
 * Компонент Button с поддержкой темной и светлой темы.
 */
export function Button(props: ButtonProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'button');

  return <DefaultButton color={color} {...otherProps} />;
}

const styles = StyleSheet.create({
  // Место для общих стилей, если они понадобятся
});
