/**
 * Déclencheur externe des workflows GitHub Actions de mon-carburant.com
 * À déployer sur Google Apps Script (script.google.com), pas dans le build.
 *
 * POURQUOI CE SCRIPT EXISTE
 *
 * Le trigger "schedule" de GitHub Actions n'honore pas la cadence demandée sur
 * ce dépôt. Relevé sur l'API Actions en septembre 2026 : 4 à 6 runs créés par
 * jour alors que le cron en demandait 24, et déjà le même plafond quand le cron
 * était à 3 h. Les heures manquantes n'apparaissent ni annulées ni en échec,
 * l'événement n'est jamais créé. C'est le comportement documenté du trigger
 * schedule, qui peut être retardé ou abandonné en période de forte charge, et
 * aucun réglage de minute n'y change quoi que ce soit.
 *
 * Un appel à l'API workflow_dispatch, lui, est toujours honoré. Ce script
 * appelle donc GitHub depuis l'infrastructure Google, qui tient l'horaire.
 *
 * INSTALLATION (une seule fois)
 *
 * 1. Créer un fine-grained token sur GitHub :
 *    github.com/settings/personal-access-tokens
 *    - Repository access : Only select repositories, projetSeoMoncarburant
 *    - Permissions > Repository permissions > Actions : Read and write
 *      (cette permission ne donne aucun droit d'écriture sur le code)
 *    - Expiration : penser à la renoter, le script alerte si le token expire.
 *
 * 2. Sur script.google.com, Nouveau projet, coller ce fichier.
 *
 * 3. Paramètres du projet > Propriétés du script > Ajouter une propriété :
 *    nom GITHUB_TOKEN, valeur le token créé à l'étape 1.
 *    Le token n'est donc jamais écrit dans le code.
 *
 * 4. Sélectionner la fonction installerDeclencheurs et l'exécuter une fois.
 *    Google demande l'autorisation d'appeler un service externe et d'envoyer
 *    des mails, c'est normal : accepter.
 *
 * 5. Vérifier dans l'onglet Déclencheurs qu'une entrée majPrixHoraire existe,
 *    déclenchée par horloge, toutes les heures.
 */

var CONFIG = {
  owner: 'Hugo909435',
  repo: 'projetSeoMoncarburant',
  branche: 'main',
  workflowPrix: 'update-fuel-data.yml',
  workflowSite: 'rebuild-site.yml',
  // Délai minimal entre deux reconstructions complètes. 2 h 45 et non 3 h
  // pile : un déclencheur horaire Google se déclenche quelque part dans
  // l'heure, pas à la minute près, donc un passage un peu en avance repousse
  // sinon le rebuild d'une heure entière à chaque fois.
  delaiEntreRebuildsMs: 2.75 * 60 * 60 * 1000,
  // Une alerte mail au plus toutes les 6 h : si GitHub refuse les appels, par
  // exemple après expiration du token, on veut être prévenu sans recevoir
  // vingt-quatre mails dans la journée.
  delaiEntreAlertesMs: 6 * 60 * 60 * 1000,
};

/**
 * Rafraîchit les prix. Appelée toutes les heures par le déclencheur.
 * Le workflow récupère le flux gouvernemental, commite les données et envoie
 * stations-light.json sur Hostinger, ce qui met à jour la carte, la recherche
 * et le comparateur sans reconstruire le site.
 */
function majPrixHoraire() {
  declencherWorkflow_(CONFIG.workflowPrix);
  rebuildSiSuffisammentAncien_();
}

/**
 * Reconstruit le site complet si le dernier rebuild date d'assez longtemps.
 *
 * Le rythme est porté par un horodatage stocké plutôt que par un second
 * déclencheur toutes les 3 h : l'interface Apps Script ne propose que 1, 2, 4,
 * 6, 8 ou 12 heures, et everyHours(3) n'est pas un intervalle garanti. Cette
 * approche a un autre avantage, elle se rattrape toute seule. Si un passage
 * horaire est manqué, le rebuild part au passage suivant au lieu d'être perdu.
 *
 * Les pages ville, département et station figent les prix au build, elles ont
 * donc besoin d'un vrai rebuild. Cadence volontairement plus lente que les
 * prix : le mirror FTP dure une vingtaine de minutes et Hostinger bloque
 * temporairement les connexions répétées.
 */
function rebuildSiSuffisammentAncien_() {
  var proprietes = PropertiesService.getScriptProperties();
  var dernier = Number(proprietes.getProperty('DERNIER_REBUILD') || 0);
  var maintenant = Date.now();

  if (maintenant - dernier < CONFIG.delaiEntreRebuildsMs) {
    return;
  }

  // L'horodatage est posé avant l'appel : si GitHub refuse, on ne veut pas
  // réessayer un rebuild complet à chaque passage horaire, l'alerte mail
  // suffit à signaler le problème.
  proprietes.setProperty('DERNIER_REBUILD', String(maintenant));
  declencherWorkflow_(CONFIG.workflowSite);
}

/**
 * Reconstruction complète à la demande, sans attendre le délai de 3 h.
 * À lancer à la main après une modification de contenu ou de code.
 */
function rebuildSiteMaintenant() {
  PropertiesService.getScriptProperties().setProperty('DERNIER_REBUILD', String(Date.now()));
  Logger.log(declencherWorkflow_(CONFIG.workflowSite));
}

/**
 * Crée ou recrée le déclencheur horaire. Idempotent : les anciens
 * déclencheurs du script sont supprimés avant, pour ne pas empiler les
 * doublons si la fonction est relancée.
 */
function installerDeclencheurs() {
  verifierToken_();

  var existants = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existants.length; i++) {
    var nom = existants[i].getHandlerFunction();
    if (nom === 'majPrixHoraire' || nom === 'rebuildSite' || nom === 'rebuildSiteMaintenant') {
      ScriptApp.deleteTrigger(existants[i]);
    }
  }

  ScriptApp.newTrigger('majPrixHoraire').timeBased().everyHours(1).create();

  Logger.log('Déclencheur installé : prix toutes les heures, rebuild complet toutes les 3 h.');
}

/**
 * Test manuel : déclenche les deux workflows tout de suite et journalise le
 * résultat. À lancer après l'installation pour vérifier que le token marche,
 * sans attendre le premier passage automatique.
 */
function testerMaintenant() {
  Logger.log('Prix : ' + declencherWorkflow_(CONFIG.workflowPrix));
  Logger.log('Site : ' + declencherWorkflow_(CONFIG.workflowSite));
  PropertiesService.getScriptProperties().setProperty('DERNIER_REBUILD', String(Date.now()));
}

/**
 * Poste sur l'API workflow_dispatch de GitHub.
 * Renvoie un libellé lisible du résultat, et alerte par mail en cas d'échec.
 */
function declencherWorkflow_(fichierWorkflow) {
  var url = 'https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo +
            '/actions/workflows/' + fichierWorkflow + '/dispatches';

  var reponse = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + verifierToken_(),
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: CONFIG.branche }),
    // Sans cette option, une erreur HTTP lève une exception avant qu'on ait pu
    // lire le corps de la réponse, qui contient justement la raison du refus.
    muteHttpExceptions: true,
  });

  var code = reponse.getResponseCode();
  // GitHub répond 204 sans corps quand le run est accepté.
  if (code === 204) {
    return 'OK (' + fichierWorkflow + ')';
  }

  var message = 'GitHub a refusé le déclenchement de ' + fichierWorkflow +
                '\nCode HTTP : ' + code +
                '\nRéponse : ' + reponse.getContentText() +
                '\n\nCauses les plus fréquentes :' +
                '\n- 401 : le token a expiré ou a été révoqué, en recréer un.' +
                '\n- 403 : le token n\'a pas la permission Actions en écriture.' +
                '\n- 404 : le fichier de workflow n\'existe pas sur la branche ' +
                CONFIG.branche + ', ou le token ne voit pas le dépôt.' +
                '\n- 422 : la branche indiquée n\'existe pas.';

  alerter_('Mise à jour des prix carburant bloquée', message);
  return 'ECHEC ' + code + ' (' + fichierWorkflow + ')';
}

/**
 * Lit le token dans les propriétés du script et échoue explicitement s'il
 * manque, plutôt que de laisser partir un appel non authentifié qui
 * produirait un 404 trompeur.
 */
function verifierToken_() {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error(
      'Propriété GITHUB_TOKEN absente. Paramètres du projet > Propriétés du ' +
      'script > Ajouter une propriété, nom GITHUB_TOKEN, valeur le fine-grained ' +
      'token GitHub avec la permission Actions : Read and write.'
    );
  }
  return token;
}

/**
 * Envoie une alerte mail, au plus une fois par fenêtre définie dans CONFIG.
 */
function alerter_(sujet, corps) {
  var proprietes = PropertiesService.getScriptProperties();
  var derniere = Number(proprietes.getProperty('DERNIERE_ALERTE') || 0);
  var maintenant = Date.now();

  Logger.log(corps);

  if (maintenant - derniere < CONFIG.delaiEntreAlertesMs) {
    return;
  }

  proprietes.setProperty('DERNIERE_ALERTE', String(maintenant));
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), sujet, corps);
}
