---
name: atomic-design
description: >
  Organiza componentes frontend siguiendo la metodologia Atomic Design:
  Atomos → Moleculas → Organismos → Templates → Paginas. Cada capa tiene
  reglas estrictas de composicion y responsabilidades.
origin: danilowoz/react-atomic-design + Brad Frost
---

# Atomic Design

Organiza y construye componentes siguiendo la jerarquia Atomos → Moleculas → Organismos → Templates → Paginas.

## Jerarquia de Componentes

### Layer 1: Atomos (atoms/)
Componentes mas pequenos, sin margenes ni posicionamiento propio.

```
atoms/
  Button.tsx        → <button> con variantes (primary, secondary, ghost)
  Input.tsx         → <input> con estados (default, error, disabled)
  Label.tsx         → <label> asociado a input
  Icon.tsx          → SVG icon wrapper
  Badge.tsx         → etiqueta/indicador
  Spinner.tsx       → loading indicator
  Avatar.tsx        → imagen de perfil
  Heading.tsx       → h1-h6 semantico
  Text.tsx          → p, span semantico
  Checkbox.tsx      → <input type="checkbox"> con label
```

**Regla de atomo:** Sin margin, sin padding externo, sin posicion absoluta. Solo estilos propios (color, font, border, background). El espaciado lo define el contenedor.

### Layer 2: Moleculas (molecules/)
Combinacion de 2+ atomos que forman una unidad funcional.

```
molecules/
  SearchBar.tsx        → Input + Button + Icon
  FormField.tsx        → Label + Input + ErrorMessage
  MenuItem.tsx         → Icon + Text + Badge
  CardHeader.tsx       → Heading + Badge + IconButton
  Pagination.tsx       → Button + Text + Button
```

**Regla de molecula:** Posiciona atomos con gap/flex/grid. NO tiene margins/padding hacia afuera. NO tiene contenido real (props inyectan datos).

### Layer 3: Organismos (organisms/)
Componentes complejos compuestos de moleculas, atomos, y otros organismos.

```
organisms/
  Header.tsx           → Logo + Nav + SearchBar + UserMenu
  Sidebar.tsx          → Logo + MenuItems + UserInfo
  DataTable.tsx        → SearchBar + Table + Pagination
  ProductCard.tsx      → Image + Badge + Heading + Text + Button
  Modal.tsx            → Overlay + Card + Heading + Text + Buttons
  Form.tsx             → FormFields + Buttons + ErrorSummary
```

**Regla de organismo:** Forma final visible del componente. Puede comunicarse con stores/context. Carga sus propios datos via props/hooks.

### Layer 4: Templates (templates/)
Wireframes que definen layout sin contenido real.

```
templates/
  DashboardLayout.tsx  → Sidebar + Header + Main + Footer slots
  AuthLayout.tsx       → Centered card + Logo + Form slot
  SettingsLayout.tsx   → Tabs + Content area
```

**Regla de template:** Solo grid: sidebar width, header height, main area, gaps. Sin contenido especifico. Usa React children o slots.

### Layer 5: Paginas (pages/)
Paginas reales que conectan templates con contenido y datos.

```
pages/
  HomePage.tsx         → DashboardLayout + widgets reales
  LoginPage.tsx        → AuthLayout + LoginForm + validacion
  SettingsPage.tsx     → SettingsLayout + formularios
```

**Regla de pagina:** Punto de entrada. Conecta datos (API, store, props) con componentes. Renderiza contenido dentro del template.

## Reglas Globales de Atomic Design

1. Un atomo NUNCA tiene margins propios
2. Una molecula/organismo puede posicionar sus hijos pero NUNCA tiene margins externos
3. Un template solo define el grid, nunca que componente va en cada slot
4. Una pagina es el unico lugar que conecta datos reales con componentes
5. Los imports solo van hacia abajo: pagina → template → organismo → molecula → atomo
6. Nunca un atomo importa un organismo (crearia dependencia circular)
7. Si un componente necesita ser reutilizado en otro proyecto, debe ser atomo o molecula

## Validacion Post-Build

Despues de construir, verificar:
- Los atomos no tienen margins en su CSS/componente
- Los templates no tienen referencias a componentes especificos
- No hay imports de capas superiores en capas inferiores
- Cada componente esta en el directorio correcto segun su complejidad
