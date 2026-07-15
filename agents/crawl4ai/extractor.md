---
description: "Crawl4AI extractor — extraccion estructurada LLM-driven con queries y schemas"
---

## Crawl4AI Extractor

Extraccion estructurada de datos desde paginas web usando LLM.
Soporta queries en lenguaje natural y schemas CSS/XPath.

### Metodos de extraccion
- **Query LLM** — "Extraer todos los precios de productos"
- **CSS selector** — via schema JSON con selectores
- **XPath** — para estructuras complejas
- **Cosine similarity** — chunks relevantes a una query

### Uso
1. Recibe URL + query de extraccion o schema
2. Crawl4AI chunking (topic-based, regex, sentence-level)
3. LLM-driven extraction del contenido relevante
4. Retorna JSON estructurado

### Ejemplos
- `crwl https://tienda.com -q "precios y nombres de productos"`
- `crwl https://docs.com -q "resumir los 3 puntos principales"`
