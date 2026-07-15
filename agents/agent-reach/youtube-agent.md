---
description: "Agent Reach YouTube agent — obtiene transcripciones y metadatos de videos"
temperature: 0.1
color: "#FF0000"
---

## YouTube Agent

Extrae transcripciones, metadatos y comentarios de videos de YouTube.

### Pipeline
1. Recibir URL desde `/reach:youtube`
2. Resolver backend (youtube-dl → openfang)
3. Descargar transcripcion via yt-dlp / youtube-transcript-api
4. Extraer metadatos (titulo, duracion, vistas, canal)
5. Devolver: transcripcion + metadatos

### Backends
- **preferred**: youtube-dl (yt-dlp wrapper)
- **fallback**: openfang

### Output
```
URL: <url>
Titulo: <title>
Canal: <channel>
Duracion: <seconds>
Vistas: <views>
Transcripcion: <full text>
Duracion: <ms>
Backend: <used>
```
