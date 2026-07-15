---
description: "Agent Reach web scraper — extrae contenido de cualquier URL via Jina Reader/crawl4ai/OpenFang"
temperature: 0.1
color: "#10B981"
---

## Web Scraper

Lee paginas web y devuelve contenido limpio LLM-friendly.

### Pipeline
1. Recibir URL desde el comando `/reach:web`
2. Resolver backend preferido (jina-reader) con fallback a crawl4ai u openfang
3. Extraer contenido a markdown estructurado
4. Devolver: titulo, descripcion, contenido, enlaces, metadatos

### Backends
- **preferred**: jina-reader (reader mode, JS-free output)
- **fallback**: crawl4ai, openfang

### Output
```
URL: <url>
Titulo: <title>
Contenido: <markdown>
Enlaces: <n>
Duracion: <ms>
Backend: <used>
```
