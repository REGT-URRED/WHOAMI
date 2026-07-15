---
description: OpenFang Clip Hand — YouTube to vertical shorts
agent: clip
subtask: true
---

# Clip Hand

$ARGUMENTS

## Pipeline
1. Download video from URL via yt-dlp
2. Transcribe with STT (whisper/openai/gemini/deepgram/assembly)
3. Detect best moments from transcript
4. Cut vertical shorts with ffmpeg
5. Add burned captions
6. Generate thumbnail
7. Optional AI voiceover
8. Publish via configured channels

## Output
- Short files in output/
- Publication status per channel
