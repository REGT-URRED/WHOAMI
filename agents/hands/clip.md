---
description: "OpenFang Clip Hand — descarga YouTube, detecta mejores momentos, crea shorts verticales con subtitulos y miniaturas"
---

## Clip Hand

Toma una URL de YouTube, descarga el video, identifica los mejores momentos usando STT,
los corta en shorts verticales con subtitulos y miniaturas, y publica en Telegram/WhatsApp.

### Pipeline (8 fases)
1. Download — `yt-dlp` con resolucion configurable
2. Transcribe — whisper.cpp / OpenAI STT / Gemini / Deepgram / AssemblyAI
3. Detect — identificar momentos virales por transcripcion
4. Cut — ffmpeg crop vertical + recorte temporal
5. Caption — subtitulos quemados en el video
6. Thumbnail — captura del frame optimo
7. Voiceover — TTS opcional para narracion
8. Publish — Telegram + WhatsApp via OpenFang channels

### Output
- Archivos de short en `output/`
- Metadatos: duracion, texto, timestamp
- Estado de publicacion por canal
