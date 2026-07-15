---
name: page-agent
description: >
  PageAgent skill — in-page GUI agent for browser automation via DOM actions.
  Integrates with MCPBridge for remote browser control. Supports click, type,
  extract, navigate, scroll, hover, wait, screenshot, and evaluate actions.
origin: @whoami/page-agent (Alibaba PageAgent pattern)
---

# PageAgent Skill

Controla páginas web mediante acciones DOM a través de MCPBridge.

## Instalación

El paquete `@whoami/page-agent` ya está en el monorepo. Importar:

```ts
import { PageAgent, MCPBridge, type DomAction } from '@whoami/page-agent';
```

## Uso básico

```ts
const agent = new PageAgent({
  model: 'gpt-4',
  baseURL: 'http://localhost:3100',
  apiKey: process.env.MCP_API_KEY!,
});

// Acción individual
const result = await agent.execute({
  type: 'click',
  target: { text: 'Submit' },
});

// Planificar y ejecutar desde instrucción
const results = await agent.planAndExecute('click the login button then type credentials');
```

## MCPBridge directo

```ts
const bridge = new MCPBridge('http://localhost:3100', apiKey);
await bridge.healthCheck();

const result = await bridge.send({
  type: 'extract',
  target: { css: '.pricing-table' },
  schema: { plan: '.plan-name', price: '.price' },
});
```

## Selectores disponibles

| Selector | Ejemplo | Prioridad |
|----------|---------|-----------|
| text | `{ text: 'Login' }` | Alta (más resiliente) |
| label | `{ label: 'Email address' }` | Alta |
| role | `{ role: 'button' }` | Media |
| testId | `{ testId: 'submit-btn' }` | Media |
| css | `{ css: '.btn-primary' }` | Baja (frágil ante cambios) |
| xpath | `{ xpath: '//button[text()="Login"]' }` | Baja |

## Integración con WHOAMI

Desde cualquier agente WHOAMI, cargar el skill:

```
skill("page-agent")
```

Luego invocar acciones vía el comando `/page`:

```
/page page:execute "navigate to example.com and take a screenshot"
/page page:click "#get-started"
/page page:extract "article" "{\"title\":\"h1\",\"body\":\".content\"}"
```

## Notas

- La extracción por schema retorna JSON estructurado
- Screenshots se capturan en base64 dentro de ActionResult
- Timeout global configurable vía PageAgentConfig.maxSteps (default 30)
- El bridge requiere un MCP server corriendo en el endpoint configurado
