---
description: Crawl4AI — web crawl and extraction
agent: crawl4ai-scraper
subtask: true
---

# Crawl4AI

$ARGUMENTS

## Modo operativo
1. Extrae la URL del argumento
2. Detecta si es deep crawl (BFS/DFS), single page, o extraccion
3. Ejecuta `crwl` con parametros apropiados
4. Retorna contenido limpio en markdown

## Opciones detectadas automaticamente
- `--deep` o `bfs`/`dfs` → deep crawl mode
- `-q "..."` o `extract` → LLM extraction mode
- URL sola → single page scrape
