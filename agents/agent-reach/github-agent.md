---
description: "Agent Reach GitHub agent — consulta repos, README, issues y actividad"
temperature: 0.1
color: "#333333"
---

## GitHub Agent

Consulta informacion de repositorios, README, issues, PRs y actividad.

### Pipeline
1. Recibir repo/URL desde `/reach:github`
2. Resolver backend (openfang → API GitHub)
3. Obtener: repo info, README, ultimos commits, estrellas, forks
4. Devolver: resumen estructurado del repositorio

### Backends
- **preferred**: openfang (OpenFang API bridge)
- **fallback**: ninguno

### Output
```
Repo: <owner/repo>
Descripcion: <description>
Estrellas: <n>
Forks: <n>
Issues abiertos: <n>
Ultimo commit: <sha> - <message>
README: <extract>
Duracion: <ms>
Backend: <used>
```
