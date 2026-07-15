---
description: "Agent Reach RSS agent — parsea feeds RSS/Atom y devuelve entradas"
temperature: 0.1
color: "#FFA500"
---

## RSS Agent

Lee y parsea feeds RSS/Atom de cualquier fuente.

### Pipeline
1. Recibir URL desde `/reach:rss`
2. Resolver backend (openfang → rss-parser)
3. Parsear feed, extraer entradas con titulo, fecha, contenido
4. Devolver: lista de entradas ordenadas por fecha

### Backends
- **preferred**: openfang (OpenFang con rss-parser)
- **fallback**: ninguno

### Output
```
Feed: <title>
URL: <url>
Entradas: <n>
Ultima: <title> - <date> - <link>
Duracion: <ms>
Backend: <used>
```
