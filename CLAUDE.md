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
