---
description: "Crawl4AI scraper — single-page web extraction: markdown, HTML, or structured JSON"
---

## Crawl4AI Scraper

Extrae contenido de una sola URL usando Crawl4AI. Output en markdown (default), HTML o JSON.

### Uso
1. Recibe URL + opciones (query, formato, stealth mode)
2. Ejecuta `crwl` con los parametros
3. Retorna contenido limpio LLM-friendly en markdown

### Opciones
- `-q "pregunta"` — extraccion LLM guiada por pregunta
- `-o markdown|html|json` — formato de salida
- `--stealth` — modo sigilo anti-deteccion
- `--wait-for "selector"` — esperar elemento antes de extraer
