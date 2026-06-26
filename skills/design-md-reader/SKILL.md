---
name: design-md-reader
description: >
  Detecta, parsea y aplica DESIGN.md en proyectos frontend. Extrae tokens
  de diseno (colores, tipografia, espaciado, sombras, breakpoints) y los
  convierte en variables CSS, Tailwind config o styled-components theme.
  Garantiza consistencia visual entre componentes generados.
origin: VoltAgent/awesome-design-md + WHOAMI
---

# Design MD Reader

Lee DESIGN.md desde la raiz del proyecto y aplica sus tokens a todo el frontend generado.

## Deteccion

Al iniciar cualquier BUILD frontend:
1. Buscar `DESIGN.md` en la raiz del proyecto
2. Si existe:
   a. Extraer secciones: paleta de colores, tipografia, espaciado, sombras, breakpoints
   b. Convertir tokens al formato del stack detectado (Tailwind, CSS vars, styled-components)
   c. Validar consistencia visual post-build (los colores/tipografias coinciden con el DESIGN.md)
3. Si NO existe:
   a. Detectar stack frontend (React, Vue, Tailwind, CSS modules, etc.)
   b. Si el proyecto ya tiene UI: proponer DESIGN.md basado en codigo existente
   c. Si es proyecto nuevo: continuar sin DESIGN.md (aplicar reglas atomic-design + a11y)

## Tokens a Extraer

De DESIGN.md, extraer obligatoriamente:

```yaml
Visual Theme: dark | light | mixed
Colors:
  primary: #hex
  secondary: #hex
  accent: #hex
  surface: #hex (bg)
  text: #hex
  error: #hex
  success: #hex
Typography:
  fontFamily-body: string
  fontFamily-heading: string
  fontSize-base: px
  fontSize-h1-h6: px/rem
Spacing:
  unit: px (ej: 4)
Shadows:
  levels: sm, md, lg
Breakpoints:
  sm, md, lg, xl
Radii:
  sm, md, lg, full
```

## Aplicacion por Stack

| Stack | Formato de salida |
|-------|------------------|
| Tailwind CSS | tailwind.config.js con extended theme |
| CSS Modules / Plain CSS | :root { --token: value } variables nativas |
| styled-components | ThemeProvider con objeto theme |
| Stitches/CSS-in-JS | tokens config directa |

## Reglas

- NUNCA hardcodear un color que ya existe en DESIGN.md
- Si DESIGN.md especifica tipografia, usarla en lugar de system fonts
- Si DESIGN.md especifica espaciado, usar multiples de la unidad base
- Si DESIGN.md especifica border-radius, no usar valores arbitrarios
- Reportar violaciones: "Este color #xxx no esta en DESIGN.md. Usar --color-primary."

## Extraccion de Diseno

Si el usuario pide "clonar el diseno de X" o no existe DESIGN.md:

### Con herramienta
npx design-extract <url> → extrae sistema completo (tokens + componentes)
npx dembrandt <url> → extrae logo, colores, tipografia, borders

### Extraccion manual
1. Fetch CSS → extraer custom properties
2. Identificar colores → mapear a semantic names
3. Identificar font-family → fontFamily-body/heading
4. Identificar espaciado → space scale (multiplos de 4)
5. Identificar breakpoints → sm/md/lg/xl
6. Generar DESIGN.md con lo detectado

### Validacion
- Colores mapeados a nombres semanticos (--color-primary, no --blue-500)
- Tipografia: fontFamily-body + fontFamily-heading
- Space scale consistente (multiplos de 4)
- Breakpoints estandar (40em, 52em, 64em)
