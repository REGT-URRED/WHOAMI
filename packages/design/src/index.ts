// @whoami/design — DESIGN.md parser (awesome-design-md: 73-brand design token system)
export interface DesignTokens {
  metadata: { name: string; version: string; description: string };
  colors: Record<string, string>;
  typography: Record<string, {
    fontFamily: string; fontSize: string; fontWeight: number;
    lineHeight: string; letterSpacing?: string;
  }>;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
  components: Record<string, {
    backgroundColor: string; textColor: string; borderColor?: string;
    typography: string; rounded: string; padding: string; height: string;
  }>;
}

export function parseDesignMd(raw: string): DesignTokens | null {
  const parts = raw.split('---');
  if (parts.length < 2) return null;

  try {
    const yamlPart = parts[0].trim();
    const tokens: DesignTokens = { metadata: { name: '', version: 'alpha', description: '' }, colors: {}, typography: {}, rounded: {}, spacing: {}, components: {} };

    // Simple YAML-like parser for colors
    let inColors = false, currentKey = '';
    for (const line of yamlPart.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === 'colors:') { inColors = true; continue; }
      if (inColors && trimmed.match(/^\w+:\s*#/)) {
        const [k, v] = trimmed.split(':').map(s => s.trim());
        tokens.colors[k] = v;
        continue;
      }
      if (inColors && !trimmed.startsWith('-') && !trimmed.match(/^\w+:\s*#/)) { inColors = false; }
      if (trimmed.startsWith('name:')) tokens.metadata.name = trimmed.split(':')[1].trim();
      if (trimmed.startsWith('version:')) tokens.metadata.version = trimmed.split(':')[1].trim();
    }

    return tokens;
  } catch {
    return null;
  }
}

export function tokensToCss(tokens: DesignTokens): string {
  let css = ':root {\n';
  for (const [key, value] of Object.entries(tokens.colors)) {
    css += `  --color-${key}: ${value};\n`;
  }
  css += '}';
  return css;
}

// ─── Brand Design Tokens (awesome-design-md: 73-brand system) ───────────────

export const VERCEL_DESIGN_MD = `---
name: Vercel
version: 1.0
description: Vercel design system tokens
colors:
  primary: '#000'
  bg: '#fff'
  accent: '#0070f3'
  secondaryBg: '#fafafa'
  border: '#eaeaea'
  text: '#000'
  textSecondary: '#666'
  error: '#e00'
  success: '#0070f3'
typography:
  fontFamily-body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontFamily-heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontSize-base: '16px'
spacing:
  unit: '4px'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
---`;

export const STRIPE_DESIGN_MD = `---
name: Stripe
version: 1.0
description: Stripe design system tokens
colors:
  primary: '#635bff'
  bg: '#0a2540'
  accent: '#00d4aa'
  secondaryBg: '#1a3a5c'
  border: '#2d4b6e'
  text: '#fff'
  textSecondary: '#8899aa'
  error: '#ef5350'
  success: '#00d4aa'
  warning: '#f6a623'
typography:
  fontFamily-body: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontFamily-heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontSize-base: '16px'
spacing:
  unit: '4px'
rounded:
  sm: '4px'
  md: '8px'
  lg: '16px'
---`;

export const SUPABASE_DESIGN_MD = `---
name: Supabase
version: 1.0
description: Supabase design system tokens
colors:
  primary: '#3ecf8e'
  bg: '#1a1a2e'
  accent: '#24b47e'
  secondaryBg: '#222244'
  border: '#333366'
  text: '#e0e0e0'
  textSecondary: '#8888aa'
  error: '#e74c3c'
  success: '#3ecf8e'
  warning: '#f0ad4e'
  surface: '#16213e'
typography:
  fontFamily-body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontFamily-heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontSize-base: '16px'
spacing:
  unit: '4px'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
---`;

export const LINEAR_DESIGN_MD = `---
name: Linear
version: 1.0
description: Linear design system tokens
colors:
  primary: '#5e6ad2'
  bg: '#0a0a0a'
  accent: '#e2e2e2'
  secondaryBg: '#141414'
  border: '#2a2a2a'
  text: '#e2e2e2'
  textSecondary: '#767676'
  error: '#f44336'
  success: '#5e6ad2'
  warning: '#ff9800'
  surface: '#1a1a1a'
typography:
  fontFamily-body: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  fontFamily-heading: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  fontSize-base: '15px'
spacing:
  unit: '4px'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
---`;

export const NOTION_DESIGN_MD = `---
name: Notion
version: 1.0
description: Notion design system tokens
colors:
  primary: '#000'
  bg: '#fff'
  accent: '#eb5757'
  secondaryBg: '#f7f6f3'
  border: '#e9e9e7'
  text: '#37352f'
  textSecondary: '#9b9a97'
  error: '#eb5757'
  success: '#0f7b6c'
  warning: '#d9730d'
  surface: '#f7f6f3'
typography:
  fontFamily-body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontFamily-heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  fontSize-base: '16px'
spacing:
  unit: '4px'
rounded:
  sm: '3px'
  md: '5px'
  lg: '8px'
---`;

export const APPLE_DESIGN_MD = `---
name: Apple
version: 1.0
description: Apple Human Interface design tokens
colors:
  primary: '#000'
  bg: '#f5f5f7'
  accent: '#0071e3'
  secondaryBg: '#fff'
  border: '#d2d2d7'
  text: '#1d1d1f'
  textSecondary: '#6e6e73'
  error: '#ff3b30'
  success: '#34c759'
  warning: '#ff9500'
  surface: '#fff'
typography:
  fontFamily-body: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
  fontFamily-heading: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
  fontSize-base: '17px'
spacing:
  unit: '4px'
rounded:
  sm: '6px'
  md: '10px'
  lg: '14px'
---`;

export const GITHUB_DESIGN_MD = `---
name: GitHub
version: 1.0
description: GitHub Primer design system tokens
colors:
  primary: '#2da44e'
  bg: '#0d1117'
  accent: '#58a6ff'
  secondaryBg: '#161b22'
  border: '#30363d'
  text: '#c9d1d9'
  textSecondary: '#8b949e'
  error: '#f85149'
  success: '#2da44e'
  warning: '#d29922'
  surface: '#161b22'
typography:
  fontFamily-body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
  fontFamily-heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
  fontSize-base: '14px'
spacing:
  unit: '4px'
rounded:
  sm: '6px'
  md: '8px'
  lg: '12px'
---`;

const BRAND_REGISTRY: Record<string, { name: string; description: string; md: string }> = {
  vercel: { name: 'Vercel', description: 'Frontend deployment platform', md: VERCEL_DESIGN_MD },
  stripe: { name: 'Stripe', description: 'Online payment processing', md: STRIPE_DESIGN_MD },
  supabase: { name: 'Supabase', description: 'Backend-as-a-Service platform', md: SUPABASE_DESIGN_MD },
  linear: { name: 'Linear', description: 'Project management tool', md: LINEAR_DESIGN_MD },
  notion: { name: 'Notion', description: 'All-in-one workspace', md: NOTION_DESIGN_MD },
  apple: { name: 'Apple', description: 'Consumer technology company', md: APPLE_DESIGN_MD },
  github: { name: 'GitHub', description: 'Software development platform', md: GITHUB_DESIGN_MD },
};

/**
 * Get parsed design tokens for a known brand.
 * Returns null if brand is not in the registry.
 */
export function getBrandTokens(brandName: string): DesignTokens | null {
  const entry = BRAND_REGISTRY[brandName.toLowerCase()];
  if (!entry) return null;
  return parseDesignMd(entry.md);
}

/**
 * List all available brand names with metadata.
 */
export function listAvailableBrands(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(BRAND_REGISTRY).map(([id, entry]) => ({
    id,
    name: entry.name,
    description: entry.description,
  }));
}

/**
 * Get the raw DESIGN.md string for a brand.
 */
export function getBrandDesignMd(brandName: string): string | null {
  const entry = BRAND_REGISTRY[brandName.toLowerCase()];
  return entry ? entry.md : null;
}
