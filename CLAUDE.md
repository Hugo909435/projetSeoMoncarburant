# Consignes pour Claude — projet mon-carburant.com

## Règles de rédaction (NON NÉGOCIABLES)

### ❌ JAMAIS de tirets longs

N'utilise **jamais** de tiret cadratin `—` (em dash) ni de tiret demi-cadratin `–`
(en dash) dans le contenu rédigé (articles Markdown, frontmatter, FAQ, JSON-LD,
textes d'interface, commits, etc.).

Remplace-les toujours par une ponctuation classique selon le contexte :

- Incise / parenthèse → des **virgules** ou des **parenthèses**
  - ❌ `Le blocage — début mars — a tout changé.`
  - ✅ `Le blocage, début mars, a tout changé.` ou `Le blocage (début mars) a tout changé.`
- Rupture / explication → **deux-points** ou **virgule**
  - ❌ `La mécanique s'inverse — le Brent reflue.`
  - ✅ `La mécanique s'inverse : le Brent reflue.`
- Plage de chiffres → **trait d'union** simple `-`
  - ❌ `2,03–2,05 €/L`, `10–15 c/L`
  - ✅ `2,03-2,05 €/L`, `10-15 c/L`

Seul le **trait d'union** `-` (clavier) est autorisé, et uniquement pour les mots
composés et les plages de chiffres.

Avant tout commit de contenu, vérifier l'absence de tirets longs, par exemple :
`grep -rn $'—\|–' src/content/`

### ❌ Limites de caractères dans le frontmatter

Les champs suivants ont des **limites strictes** imposées par le schéma Astro.
Un dépassement fait planter le build.

| Champ            | Limite max |
|------------------|-----------|
| `metaTitle`      | 60 caractères |
| `metaDescription`| 160 caractères |

**Avant tout commit d'article**, vérifier les longueurs :
```bash
# Vérifier metaTitle (max 60 car.)
grep '^metaTitle:' src/content/blog/*.md src/content/piliers/*.md | while IFS= read -r line; do
  val=$(echo "$line" | sed 's/^[^:]*:metaTitle: *"\{0,1\}//;s/"\{0,1\} *$//')
  len=${#val}
  [ "$len" -gt 60 ] && echo "ERREUR ($len car.) : $line"
done

# Vérifier metaDescription (max 160 car.)
grep '^metaDescription:' src/content/blog/*.md src/content/piliers/*.md | while IFS= read -r line; do
  val=$(echo "$line" | sed 's/^[^:]*:metaDescription: *"\{0,1\}//;s/"\{0,1\} *$//')
  len=${#val}
  [ "$len" -gt 160 ] && echo "ERREUR ($len car.) : $line"
done
```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
