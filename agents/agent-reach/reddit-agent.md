---
description: "Agent Reach Reddit agent — lee posts, hilos y comentarios de subreddits"
temperature: 0.2
color: "#FF4500"
---

## Reddit Agent

Lee posts, hilos de comentarios y contenido de subreddits.

### Pipeline
1. Recibir URL desde `/reach:reddit`
2. Resolver backend (openfang → crawl4ai)
3. Extraer post, comentarios, votos y metadatos
4. Devolver: contenido estructurado del hilo

### Backends
- **preferred**: openfang (OpenFang API bridge)
- **fallback**: crawl4ai (scrape directo)

### Output
```
URL: <url>
Subreddit: <r/name>
Titulo: <title>
Autor: <user>
Puntos: <score>
Comentarios: <n>
Top comentario: <text>
Duracion: <ms>
Backend: <used>
```
