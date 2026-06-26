---
name: fsm-components
description: >
  Componentes con estados explicitos como Finite State Machines usando
  data-state attributes. Basado en Radix UI philosophy: composition over
  configuration, 1-to-1 DOM strategy, controlled vs uncontrolled.
origin: radix-ui/primitives philosophy.md
---

# FSM Components — Finite State Machines para UI

Cada componente DEBE definir sus estados como un finite set de strings, usando
el atributo `data-state` en el DOM. NUNCA usar booleans para trackear estado.

## Estados por Tipo de Componente

### Dropdown / Select / Combobox
```
data-state="closed"    → cerrado (default)
data-state="open"      → abierto
data-state="opening"   → transicion de apertura (opcional)
data-state="closing"   → transicion de cierre (opcional)
```
NUNCA: `data-open="true"` o `isOpen={true}`

### Checkbox / Toggle / Switch
```
data-state="unchecked"       → no marcado (default)
data-state="checked"         → marcado
data-state="indeterminate"   → estado mixto (checkbox)
```
NUNCA: `isChecked={true}`

### Accordion / Disclosure
```
data-state="closed"    → colapsado (default)
data-state="open"      → expandido
```
NUNCA: `expanded={true}`

### Tabs
```
data-state="active"    → tab activo
data-state="inactive"  → tab inactivo
```
NUNCA: `selected={true}`, `current={true}`

### Modal / Dialog
```
data-state="closed"    → cerrado (default)
data-state="open"      → abierto
```

### Toast / Notification
```
data-state="visible"   → mostrando
data-state="hidden"    → oculto
data-state="entering"  → animando entrada
data-state="exiting"   → animando salida
```

### Data Components (list, table, card grid)
```
data-state="loading"   → cargando datos
data-state="loaded"    → datos cargados
data-state="empty"     → sin datos
data-state="error"     → error al cargar
```

## Reglas de Finite State

1. Cada componente tiene un numero FINITO de estados predefinidos
2. Estados se expresan como STRINGS enumerados, NO booleans
3. Las transiciones entre estados son explicitas y deterministicas
4. El estado se expone al DOM via `data-state` attribute
5. CSS usa selectores de atributo: `[data-state="open"]`

## 1-to-1 DOM Strategy

Cada componente React renderiza UN solo elemento DOM (si renderiza alguno):

```tsx
// BIEN: el componente es directamente el elemento DOM
const Button = (props) => <button {...props} />

// BIEN: si necesita wrapper, usa Fragment o pasa props al child
const Tooltip = ({ children, content }) => (
  <div data-state="closed">
    {children}
    <span role="tooltip" hidden>{content}</span>
  </div>
)
```
Evitar: wrappers innecesarios, divs extra, componentes que renderizan 2+ elementos sin proposito semantico.

## Composition over Configuration

Preferir composicion sobre props de configuracion:

```tsx
// MAL: demasiadas props de configuracion
<Select options={[...]} value={val} onChange={fn} placeholder="..." isSearchable isMulti />

// BIEN: composicion con children
<Select value={val} onValueChange={fn}>
  <SelectTrigger placeholder="..." />
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```

## Controlled vs Uncontrolled

Todo componente con estado interno soporta ambos modos:

```tsx
// Uncontrolled: el componente maneja su propio estado
<Accordion defaultValue="item-1" />

// Controlled: el consumidor maneja el estado
const [value, setValue] = useState("item-1")
<Accordion value={value} onValueChange={setValue} />
```

Patron: prop `default*` para uncontrolled, prop `value` + `onChange` para controlled.

## Validacion Post-Build

- Todos los data-state usan strings, no booleans
- Estados documentados en comentarios del componente
- CSS usa selectores de atributo en vez de clases para estados
- Componente renderiza 1 DOM element (o Fragment si es necesario)
