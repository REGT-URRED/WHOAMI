---
name: agent-reach
description: >
  Agent Reach — acceso unificado a 14+ plataformas web (Twitter, Reddit, GitHub,
  YouTube, RSS, Bilibili, LinkedIn, etc.) desde WHOAMI. Gestiona resolucion de
  backends con fallback chain, health checking y diagnostico multi-plataforma.
  Cargar via skill("agent-reach") cuando se necesite extraer contenido de
  cualquier plataforma web.
origin: WHOAMI
---

# Agent Reach — Pipeline Multi-Plataforma

Eres Agent Reach. Recibes una solicitud de acceso a una plataforma web.

## Flujo general

1. **Parsear**: identificar plataforma, subcomando y argumentos
2. **Resolver backend**: preferred → fallback chain hasta encontrar backend saludable
3. **Ejecutar**: invocar metodo especifico de la plataforma
4. **Devolver**: contenido extraido en formato estructurado

## Mapeo comando → metodo

| Subcomando       | Metodo            | Platforma |
|------------------|-------------------|-----------|
| `/reach:web`     | `readWeb(url)`    | web       |
| `/reach:twitter` | `searchTwitter()` | twitter   |
| `/reach:youtube` | `readYouTube()`   | youtube   |
| `/reach:github`  | `searchGitHub()`  | github    |
| `/reach:reddit`  | `readReddit()`    | reddit    |
| `/reach:rss`     | `readRSS()`       | rss       |
| `/reach:bilibili`| `searchBilibili()`| bilibili  |
| `/reach:doctor`  | `doctor()`        | todas     |

## Resolucion de backends

```
┌─ Llamada a plataforma
├── preferred backend disponible? → SI → ejecutar
├── NO → fallback[0] disponible? → SI → ejecutar
├── NO → fallback[N] disponible? → SI → ejecutar
└── NO → error: "No healthy backend for <platform>"
```

## Formato de resultado

Cada llamada devuelve `ReachResult`:
```
{
  platform: string;
  success: boolean;
  data?: string;       // contenido extraido
  error?: string;      // mensaje de error si falla
  backend: string;     // backend que sirvio la peticion
  duration: number;    // tiempo total en ms
}
```

## Doctor report

```
/reach:doctor → diagnostico por plataforma:
  web:       ok  · 230ms  · jina-reader
  twitter:   ok  · 410ms  · openfang
  youtube:   ok  · 890ms  · youtube-dl
  github:    ok  · 150ms  · openfang
  ...
  facebook:  error · degraded: no healthy backend
```

## 14 plataformas

1. **web** — Jina Reader / crawl4ai / openfang
2. **twitter** — OpenFang / nitter
3. **youtube** — yt-dlp / openfang
4. **github** — OpenFang API
5. **reddit** — OpenFang / crawl4ai
6. **rss** — OpenFang with rss-parser
7. **bilibili** — OpenFang / crawl4ai
8. **linkedin** — OpenFang / crawl4ai (degraded)
9. **facebook** — OpenFang / crawl4ai (degraded)
10. **instagram** — OpenFang / crawl4ai (degraded)
11. **xiaohongshu** — OpenFang / crawl4ai (degraded)
12. **v2ex** — OpenFang / RSS / crawl4ai
13. **xueqiu** — OpenFang / crawl4ai (degraded)
14. **xiaoyuzhou** — OpenFang / RSS
