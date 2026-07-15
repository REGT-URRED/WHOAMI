---
description: "Crawl4AI deep crawler — multi-page BFS/DFS crawling con max-pages y same-domain"
---

## Crawl4AI Deep Crawler

Crawleo multi-pagina usando estrategias BFS (default) o DFS.
Respeta same-domain, max-pages, y profundidad configurable.

### Estrategias
- **BFS** — explora nivel por nivel, mejor para sitios amplios
- **DFS** — profundiza primero, mejor para documentacion jerarquica

### Uso
1. Recibe URL semilla + opciones
2. Descubre URLs via prefetch mode (5-10x mas rapido)
3. Crawlea hasta max-pages respetando same-domain
4. Retorna arbol de paginas con contenido en markdown

### Opciones
- `--deep-crawl bfs|dfs` — estrategia de crawleo
- `--max-pages N` — limite de paginas (default: 10)
- `--stealth` — evade deteccion anti-bot
