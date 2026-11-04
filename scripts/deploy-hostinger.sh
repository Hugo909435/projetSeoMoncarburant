#!/usr/bin/env bash
set -euo pipefail

# Le compte FTP est déjà enraciné dans le dossier public du site.
# Les appelants partagent le verrou GitHub "hostinger-deploy".
phase="${1:-}"
case "$phase" in
  core)
    # Les noms _astro sont des empreintes du contenu : même nom et même taille
    # signifient ressource identique. Les conserver évite de casser les pages
    # encore servies par la version précédente pendant le transfert.
    # Les deux JSON de collecte horaire ont leur propre publication atomique :
    # un build plus ancien ne doit pas les écraser pendant un long déploiement.
    commands='mirror -R --no-perms --ignore-time --verbose _astro _astro;
      mirror -R --no-perms --delete --verbose --exclude ^_astro/ --exclude ^prix-carburants/station/ --exclude ^data/meta[.]json$ --exclude ^data/stations-light[.]json$ . .;'
    ;;
  stations)
    commands='mirror -R --no-perms --delete --verbose prix-carburants/station prix-carburants/station;'
    ;;
  *)
    echo 'Usage : deploy-hostinger.sh core|stations' >&2
    exit 2
    ;;
esac

: "${FTP_USER:?FTP_USER manquant}"
: "${FTP_PASSWORD:?FTP_PASSWORD manquant}"
: "${FTP_HOST:?FTP_HOST manquant}"
test -d dist || { echo 'Le dossier dist est absent.' >&2; exit 1; }
if [ "$phase" = stations ] && [ ! -d dist/prix-carburants/station ]; then
  echo 'Aucune fiche station à publier.'
  exit 0
fi

# Un seul niveau de retry, pour ne pas multiplier les connexions Hostinger.
max_attempts=3
for attempt in $(seq 1 "$max_attempts"); do
  echo "::group::Déploiement $phase, tentative $attempt/$max_attempts"
  if lftp -u "$FTP_USER","$FTP_PASSWORD" -p 21 \
    -e "set cmd:fail-exit yes;
        set ftp:ssl-allow no;
        set ftp:passive-mode true;
        set net:timeout 30;
        set net:max-retries 1;
        set net:persist-retries 0;
        set mirror:parallel-transfer-count 2;
        set mirror:parallel-directories no;
        lcd dist;
        $commands
        quit" "$FTP_HOST"; then
    echo '::endgroup::'
    echo "Déploiement $phase terminé."
    exit 0
  fi
  echo '::endgroup::'
  echo "Échec de la phase $phase, tentative $attempt."
  if [ "$attempt" -lt "$max_attempts" ]; then
    backoff=$((30 * (2 ** (attempt - 1))))
    echo "Nouvelle tentative dans ${backoff}s."
    sleep "$backoff"
  fi
done

echo "Échec du déploiement $phase après $max_attempts tentatives." >&2
exit 1
