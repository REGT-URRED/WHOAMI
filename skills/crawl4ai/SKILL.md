---
name: crawl4ai
description: >
  Integracion con Crawl4AI — web crawling, scraping, y extraccion
  estructurada para RAG, data pipelines, e investigacion.
  Cargar via skill("crawl4ai") cuando la tarea requiere extraer
  datos de sitios web.
origin: WHOAMI
---

# Crawl4AI Skill

## Uso basico

WHOAMI usa Crawl4AI via backend dedicado:

```json
{
  "backend": "crawl4ai",
  "crawl4ai": {
    "mode": "cli",
    "cliPath": "crwl",
    "stealth": true
  }
}
```

## Comandos CLI

| Comando | Descripcion |
|---------|-------------|
| `whoami crawl <url>` | Crawl single page a markdown |
| `whoami crawl <url> --deep` | Deep crawl BFS |
| `whoami crawl <url> --query "text"` | LLM extraction |
| `whoami deep-crawl <url>` | Deep crawl multi-pagina |
| `whoami extract <url> -q "query"` | Extraccion estructurada |

## Agentes

| Agente | Uso |
|--------|-----|
| `crawl4ai-scraper` | Single page extraction |
| `crawl4ai-deep-crawler` | Multi-page BFS/DFS crawl |
| `crawl4ai-extractor` | LLM-driven structured extraction |

## Pipelines

| Pipeline | Secuencia |
|----------|-----------|
| **scrape** | scraper → extractor |
| **deep-scrape** | deep-crawler → extractor |
| **enrich** | scraper → research validation |

## Sinergia con OpenFang Hands

```
researcher ← crawl4ai → gather sources for investigation
collector  ← crawl4ai → monitor web pages for changes
lead       ← crawl4ai → enrich prospects with web data
predictor  ← crawl4ai → collect signals from multiple sources
```

## Instalacion de Crawl4AI

```bash
pip install -U crawl4ai
crawl4ai-setup
```

O via Docker:
```bash
docker run -p 8000:8000 unclecode/crawl4ai
```
