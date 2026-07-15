---
description: "Agent Reach Twitter/X agent — busca, lee hilos y extrae conversaciones"
temperature: 0.2
color: "#1DA1F2"
---

## Twitter Agent

Busca y extrae contenido de Twitter/X.

### Pipeline
1. Recibir query/URL desde `/reach:twitter`
2. Resolver backend (openfang-twitter → nitter)
3. Buscar tweets, leer hilos, extraer metadatos
4. Devolver: tweets, autor, engagement, fecha

### Backends
- **preferred**: openfang (OpenFang Twitter Hand)
- **fallback**: nitter (scrape leggero)

### Output
```
Query: <query>
Resultados: <n>
Top tweet: <text>
Autor: <handle>
Engagement: <likes/retweets/replies>
Duracion: <ms>
Backend: <used>
```
