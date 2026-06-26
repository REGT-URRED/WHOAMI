import { Theme } from '../core/backend';

export const defaultTheme: Theme = {
  name: 'default',
  description: 'Clean terminal default (no color overrides)',
  colors: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    accent: '#8888FF',
    error: '#FF4444',
    success: '#44FF44',
    warning: '#FFAA44',
    info: '#4488FF',
    muted: '#666666',
  },
};
