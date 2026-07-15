---
name: design-md
description: >
  DESIGN.md brand tokens skill — provides pre-built design token sets for
  7+ well-known brands (Vercel, Stripe, Supabase, Linear, Notion, Apple, GitHub).
  Usa @whoami/design para parsear y exportar tokens a CSS.
origin: @whoami/design + awesome-design-md
---

# Design MD Brand Tokens Skill

Proporciona tokens de diseño de marcas conocidas en formato DESIGN.md.

## Marcas disponibles

| Marca | Tokens clave | Uso |
|-------|-------------|-----|
| Vercel | primary: #000, bg: #fff, accent: #0070f3 | Plataforma frontend |
| Stripe | primary: #635bff, bg: #0a2540, accent: #00d4aa | Pagos online |
| Supabase | primary: #3ecf8e, bg: #1a1a2e, accent: #24b47e | Backend como servicio |
| Linear | primary: #5e6ad2, bg: #0a0a0a, accent: #e2e2e2 | Gestión de proyectos |
| Notion | primary: #000, bg: #fff, accent: #eb5757 | Productividad/documentación |
| Apple | primary: #000, bg: #f5f5f7, accent: #0071e3 | Tecnología/consumo |
| GitHub | primary: #2da44e, bg: #0d1117, accent: #58a6ff | Desarrollo/DevOps |

## Uso programático

```ts
import { getBrandTokens, listAvailableBrands, tokensToCss } from '@whoami/design';

const tokens = getBrandTokens('stripe');
console.log(tokens.colors.primary); // #635bff

const css = tokensToCss(tokens);
// :root { --color-primary: #635bff; --color-bg: #0a2540; ... }

const brands = listAvailableBrands();
// ['vercel', 'stripe', 'supabase', 'linear', 'notion', 'apple', 'github']
```

## Uso desde commands

```
/design design:generate vercel
/design design:list-brands
/design design:export-css linear
```

## DESIGN.md raw

Cada marca exporta su contenido DESIGN.md como string constante:

```ts
import { STRIPE_DESIGN_MD } from '@whoami/design';
const tokens = parseDesignMd(STRIPE_DESIGN_MD);
```

## Integración con Design MD Reader

Compatibilidad total con `skills/design-md-reader/SKILL.md`:
1. Generar DESIGN.md de una marca con `getBrandTokens(name)`
2. Escribir a `./DESIGN.md` en el proyecto target
3. El reader lo detectará automáticamente en el próximo BUILD

## Notas

- Todos los tokens son valores reales observados de cada marca (2024-2025)
- Los colores pueden variar entre versiones — estos son los estables
- Para marcas no incluidas, se puede extraer manualmente vía `design-extract` o `dembrandt`
