export type FuelStatKey = 'Gazole' | 'SP95' | 'SP98' | 'E10' | 'E85' | 'GPLc';

export type FuelConfig = {
  key: FuelStatKey;
  label: string;
  color: string;
  description: string;
  forVehicles: string;
};

export const FUEL_KEYS = ['Gazole', 'SP95', 'SP98', 'E10', 'E85', 'GPLc'] as const;

export const FUEL_COLORS: Record<FuelStatKey, string> = {
  Gazole: '#374151',
  SP95: '#16a34a',
  SP98: '#2563eb',
  E10: '#15803d',
  E85: '#E87722',
  GPLc: '#ca8a04',
};

export const FUEL_CONFIGS = {
  gazole: {
    key: 'Gazole',
    label: 'Gazole',
    color: '#374151',
    description: `Le gazole (ou diesel) est le carburant le plus utilisé en France, représentant plus de la moitié des véhicules en circulation.
Il est produit par raffinage du pétrole brut et contient un mélange de gazole fossile et d'ester méthylique d'acide gras (EMAG, dit B7 ou B10).
Les moteurs diesel offrent une meilleure efficacité thermique que les moteurs essence, ce qui explique leur popularité pour les longs trajets.
En France, le gazole est légèrement taxé différemment de l'essence : la TICPE (Taxe Intérieure de Consommation sur les Produits Énergétiques) représente environ 45% du prix à la pompe.
Pour trouver le meilleur prix, comparez les stations avant votre départ, notamment les grandes surfaces qui pratiquent souvent des tarifs inférieurs aux stations-service de bord de route.`,
    forVehicles: 'Véhicules diesel (voitures, camions, utilitaires)',
  },
  sp95: {
    key: 'SP95',
    label: 'Sans-Plomb 95 (SP95)',
    color: '#16a34a',
    description: `Le Sans-Plomb 95 (SP95) est un carburant essence à indice d'octane 95, contenant jusqu'à 5% d'éthanol (E5).
C'est l'un des carburants essence les plus répandus en France, adapté à la majorité des véhicules essence fabriqués depuis les années 1990.
Son indice d'octane de 95 le rend compatible avec la plupart des moteurs à allumage commandé.
Contrairement à l'E10, il convient également aux véhicules anciens et aux deux-roues, qui peuvent avoir des problèmes de compatibilité avec les taux d'éthanol plus élevés.
La différence de prix avec l'E10 est généralement de 5 à 8 centimes par litre, ce qui représente une économie notable sur un plein.`,
    forVehicles: 'Véhicules essence, motos, véhicules anciens',
  },
  sp98: {
    key: 'SP98',
    label: 'Sans-Plomb 98 (SP98)',
    color: '#2563eb',
    description: `Le Sans-Plomb 98 (SP98) est un carburant premium à haut indice d'octane (98 RON).
Ce carburant est recommandé pour les moteurs à haut rapport de compression, les voitures sportives et les véhicules haute performance.
Son indice d'octane supérieur permet une meilleure résistance au cliquetis (détonation prématurée), ce qui peut améliorer les performances et réduire la consommation sur certains moteurs optimisés pour ce type de carburant.
En pratique, son utilisation dans des moteurs conçus pour du SP95 n'apporte généralement pas de bénéfice significatif et représente un surcoût injustifié (environ 10 à 15 centimes de plus par litre).
Vérifiez les recommandations du constructeur dans votre carnet d'entretien.`,
    forVehicles: 'Voitures sportives, moteurs haute compression',
  },
  e10: {
    key: 'E10',
    label: 'E10 (Sans-Plomb 95-E10)',
    color: '#15803d',
    description: `L'E10 est un carburant essence contenant 10% d'éthanol, biosourcé à partir de céréales ou de betterave sucrière.
C'est le carburant essence le moins cher en France, généralement 5 à 8 centimes moins cher que le SP95.
Il est compatible avec la grande majorité des voitures essence vendues depuis 2000 (vérifiez l'autocollant sur votre bouchon de réservoir).
L'éthanol qu'il contient est d'origine renouvelable, ce qui réduit les émissions de CO2 sur le cycle de vie par rapport aux carburants fossiles purs.
Attention toutefois : sa teneur énergétique est légèrement inférieure au SP95, ce qui peut entraîner une consommation marginalement plus élevée (1 à 2%). La plupart des conducteurs ne perçoivent pas cette différence dans leur usage quotidien.`,
    forVehicles: 'Voitures essence compatibles E10 (post-2000)',
  },
  e85: {
    key: 'E85',
    label: 'E85 (Superéthanol)',
    color: '#E87722',
    description: `Le superéthanol E85 contient entre 65% et 85% d'éthanol selon la saison (moins en hiver pour faciliter le démarrage à froid).
C'est de loin le carburant le moins cher à l'usage : affiché autour de 0,80 à 0,90 €/L, son coût aux 100 km est compétitif malgré une consommation plus élevée (environ 30% de plus qu'avec du SP95).
Il est disponible pour les véhicules FlexFuel (conçus pour fonctionner avec n'importe quel mélange essence-éthanol), ainsi que pour les véhicules équipés d'un boîtier de conversion E85 homologué.
La conversion E85 d'un véhicule essence coûte généralement entre 500 et 1 500 €, avec une rentabilité atteinte en 1 à 2 ans selon le kilométrage annuel.
L'E85 émet significativement moins de CO2 et de particules fines que les carburants fossiles, ce qui en fait un choix écologique et économique.`,
    forVehicles: 'Véhicules FlexFuel, voitures équipées d\'un boîtier E85',
  },
  gpl: {
    key: 'GPLc',
    label: 'GPL (Gaz de Pétrole Liquéfié)',
    color: '#ca8a04',
    description: `Le GPL carburant (GPLc) est un mélange de propane et de butane utilisé comme carburant pour les véhicules particuliers.
Avec un prix moyen autour de 1,00 à 1,10 €/L, c'est l'un des carburants les moins chers à l'usage.
Malgré une consommation supérieure d'environ 20% par rapport à l'essence (en énergie équivalente), son faible prix le rend économique.
Les véhicules GPL émettent moins de NOx et de particules fines que les diesels, et moins de CO2 que les véhicules essence classiques.
Le GPL est disponible dans environ 1 800 stations en France, ce qui est moins dense que l'essence ou le diesel. Les zones rurales peuvent présenter des contraintes de ravitaillement.
L'investissement pour convertir un véhicule essence au GPL bi-carburation coûte de 1 500 à 3 000 € selon le modèle.`,
    forVehicles: 'Véhicules bi-carburation GPL/essence, taxi',
  },
} as const satisfies Record<string, FuelConfig>;

export type FuelSlug = keyof typeof FUEL_CONFIGS;
