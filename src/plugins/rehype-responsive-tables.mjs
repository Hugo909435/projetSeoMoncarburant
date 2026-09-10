/**
 * Rend les tableaux du contenu Markdown utilisables sur mobile.
 *
 * Deux transformations, appliquées à chaque <table> des articles et des piliers :
 *
 * 1. Le tableau est enveloppé dans <div class="table-scroll"> : sur les écrans
 *    intermédiaires, le tableau défile horizontalement dans son propre conteneur
 *    au lieu de faire déborder toute la page.
 * 2. Chaque <td> reçoit un data-label reprenant l'intitulé de sa colonne. En
 *    dessous de 640 px, le CSS masque le <thead> et affiche ce label devant la
 *    valeur, ce qui transforme chaque ligne en fiche lisible sans défilement.
 *
 * Le rendu desktop est inchangé : tout le responsive est porté par le CSS.
 */

function texte(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(texte).join('');
}

function estElement(node, nom) {
  return node && node.type === 'element' && node.tagName === nom;
}

/** Intitulés de colonnes, lus sur la première ligne d'en-tête. */
function intitules(table) {
  const thead = (table.children ?? []).find((n) => estElement(n, 'thead'));
  const ligne = (thead?.children ?? []).find((n) => estElement(n, 'tr'));
  if (!ligne) return [];
  return (ligne.children ?? [])
    .filter((n) => estElement(n, 'th'))
    .map((th) => texte(th).trim());
}

function etiqueterCellules(table, labels) {
  if (labels.length === 0) return;
  for (const section of table.children ?? []) {
    if (!estElement(section, 'tbody')) continue;
    for (const ligne of section.children ?? []) {
      if (!estElement(ligne, 'tr')) continue;
      let i = 0;
      for (const cellule of ligne.children ?? []) {
        if (!estElement(cellule, 'td')) continue;
        const label = labels[i];
        if (label) {
          cellule.properties = { ...(cellule.properties ?? {}), 'data-label': label };
        }
        i++;
      }
    }
  }
}

function envelopper(table) {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['table-scroll'],
      // Conteneur défilable atteignable au clavier. Pas de role="region" :
      // les tableaux Markdown n'ont pas de légende, et une région sans nom
      // accessible pollue la navigation par repères des lecteurs d'écran.
      tabindex: '0',
    },
    children: [table],
  };
}

export default function rehypeResponsiveTables() {
  return (tree) => {
    const parcourir = (node) => {
      if (!Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const enfant = node.children[i];
        if (estElement(enfant, 'table')) {
          etiqueterCellules(enfant, intitules(enfant));
          node.children[i] = envelopper(enfant);
          continue; // le tableau lui-même n'a plus de tableau à l'intérieur
        }
        parcourir(enfant);
      }
    };
    parcourir(tree);
  };
}
