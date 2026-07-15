---
description: "Agent Reach — 14-platform web access bridge (Twitter, Reddit, GitHub, YouTube, RSS, etc.)"
temperature: 0.1
color: "#00FF88"
---

## Agent Reach

Orquestador multi-plataforma. Recibe un subcomando y argumento,
resuelve la plataforma correspondiente y ejecuta la extraccion.

### Pipeline

1. Parsear comando: `/reach:<plataforma> <argumento>`
2. Cargar skill("agent-reach") para pipeline completo
3. Resolver plataforma y backend via AgentReachClient
4. Delegar a subagente especifico via `task()` si es necesario
5. Devolver resultado estructurado

### Plataformas

- `/reach:web <url>` — web-scraper: lee cualquier pagina web
- `/reach:twitter <query>` — twitter-agent: busca en Twitter/X
- `/reach:youtube <url>` — youtube-agent: transcripciones de video
- `/reach:github <repo>` — github-agent: info de repositorio
- `/reach:reddit <url>` — reddit-agent: lee posts de Reddit
- `/reach:rss <url>` — rss-agent: parsea feeds RSS/Atom
- `/reach:doctor` — diagnostico de todas las plataformas

### Output

```
Platform: <platforma>
Backend: <backend usado>
Duracion: <ms>
Resultado: <contenido extraido>
```
