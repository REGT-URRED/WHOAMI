---
description: Agent Reach — accede a 14+ plataformas web desde WHOAMI
agent: agent-reach
subtask: true
---

# /reach — Agent Reach Commands

Accede a contenido de multiples plataformas web via un unico comando.

## Subcomandos

### /reach:web <url>
Lee cualquier pagina web y devuelve contenido limpio.
```
/reach:web https://example.com/article
```

### /reach:twitter <query|url>
Busca en Twitter/X o lee un hilo.
```
/reach:twitter langchain announcement
```

### /reach:github <repo>
Obtiene info de un repositorio GitHub.
```
/reach:github owner/repo-name
```

### /reach:youtube <url>
Obtiene la transcripcion de un video de YouTube.
```
/reach:youtube https://youtu.be/VIDEO_ID
```

### /reach:reddit <url>
Lee un post/hilo de Reddit.
```
/reach:reddit https://reddit.com/r/subreddit/comments/...
```

### /reach:rss <url>
Parsea un feed RSS/Atom.
```
/reach:rss https://example.com/feed.xml
```

### /reach:doctor
Diagnostica conectividad de todas las plataformas.
```
/reach:doctor
```

## Plataformas soportadas

| Plataforma    | Backend preferido | Fallback      | Estado  |
|---------------|-------------------|----------------|---------|
| web           | jina-reader       | crawl4ai       | online  |
| twitter       | openfang          | nitter         | online  |
| youtube       | youtube-dl        | openfang       | online  |
| github        | openfang          | —              | online  |
| reddit        | openfang          | crawl4ai       | online  |
| rss           | openfang          | —              | online  |
| bilibili      | openfang          | crawl4ai       | online  |
| linkedin      | openfang          | crawl4ai       | degraded|
| facebook      | openfang          | crawl4ai       | degraded|
| instagram     | openfang          | crawl4ai       | degraded|
| xiaohongshu   | openfang          | crawl4ai       | degraded|
| v2ex          | openfang          | rss, crawl4ai  | online  |
| xueqiu        | openfang          | crawl4ai       | degraded|
| xiaoyuzhou    | openfang          | rss            | online  |

## Modo operativo

1. Parsear el subcomando y argumento
2. Cargar skill("agent-reach") para pipeline completo
3. Resolver backend: preferred → fallback chain
4. Ejecutar extraccion via AgentReachClient
5. Devolver resultado estructurado
