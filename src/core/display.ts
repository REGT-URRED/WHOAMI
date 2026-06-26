import { Theme, ThemeColors } from './backend';
import { getTheme, applyCustomColors } from '../themes';
import { loadConfig } from './config';
import chalk from 'chalk';

let colors: ThemeColors;

export async function initDisplay(): Promise<void> {
  const config = await loadConfig();
  let theme = getTheme(config.theme);
  if (config.colors) {
    theme = applyCustomColors(theme, config.colors);
  }
  colors = theme.colors;
}

function hexToChalk(hex: string): ReturnType<typeof chalk.rgb> {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return chalk.rgb(r, g, b);
}

export function banner(): string {
  const p = hexToChalk(colors.primary);
  const s = hexToChalk(colors.secondary);
  const a = hexToChalk(colors.accent);
  return [
    p('██╗    ██╗██╗  ██╗ ██████╗  █████╗ ███╗   ███╗██╗'),
    p('██║    ██║██║  ██║██╔═══██╗██╔══██╗████╗ ████║██║'),
    p('██║ █╗ ██║███████║██║   ██║███████║██╔████╔██║██║'),
    p('██║███╗██║██╔══██║██║   ██║██╔══██║██║╚██╔╝██║██║'),
    p('╚███╔███╔╝██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║'),
    p(' ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝'),
    '',
    s('                Autonomous Multi-Agent Orchestrator'),
    a('                      v2.0 — Modular Framework'),
    '',
  ].join('\n');
}

export function primary(text: string): string { return hexToChalk(colors.primary)(text); }
export function secondary(text: string): string { return hexToChalk(colors.secondary)(text); }
export function accent(text: string): string { return hexToChalk(colors.accent)(text); }
export function error(text: string): string { return hexToChalk(colors.error)(text); }
export function success(text: string): string { return hexToChalk(colors.success)(text); }
export function warning(text: string): string { return hexToChalk(colors.warning)(text); }
export function info(text: string): string { return hexToChalk(colors.info)(text); }
export function muted(text: string): string { return hexToChalk(colors.muted)(text); }
