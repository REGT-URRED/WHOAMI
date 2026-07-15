import { Theme, ThemeColors } from '../backend';
import { defaultTheme } from './default';
import { neonTheme } from './neon';

const BUILTIN: Record<string, Theme> = {
  default: defaultTheme,
  neon: neonTheme,
};

export function getTheme(name: string): Theme {
  const theme = BUILTIN[name];
  if (!theme) return defaultTheme;
  return theme;
}

export function applyCustomColors(base: Theme, custom: Partial<ThemeColors>): Theme {
  return {
    ...base,
    name: 'custom',
    description: `Custom variant of ${base.name}`,
    colors: { ...base.colors, ...custom },
  };
}
