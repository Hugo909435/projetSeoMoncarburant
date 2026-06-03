// Contenu éditorial unique par région et département : identité locale (emblème,
// surnom, repères) + contexte mobilité / carburant. Sert à enrichir les pages
// /prix-carburants/region/* et /prix-carburants/* pour éviter le « contenu mince ».
//
// emblem : chemin du SVG dans /public (drapeau ou blason récupéré depuis Wikimedia
// Commons via scripts/fetch-flags.mjs). emblemType pilote le libellé affiché.

export interface LocalFact {
  label: string;
  value: string;
}

export interface LocalContent {
  emblem?: string;
  emblemType?: 'drapeau' | 'blason';
  emblemCaption?: string;
  nickname?: string;
  paragraphs: string[];
  facts?: LocalFact[];
}

// ── RÉGIONS (clé = regionSlug) ────────────────────────────────────────────────
export const regionContent: Record<string, LocalContent> = {
  'auvergne-rhone-alpes': {
    emblem: '/images/flags/regions/auvergne-rhone-alpes.svg',
    emblemType: 'drapeau',
    emblemCaption: "Drapeau de l'Auvergne-Rhône-Alpes",
    nickname: 'Des volcans aux sommets alpins',
    paragraphs: [
      "Deuxième région la plus peuplée de France, l'Auvergne-Rhône-Alpes s'étend des volcans de la chaîne des Puys aux plus hauts sommets des Alpes, en passant par la gastronomie lyonnaise et les vignobles de la vallée du Rhône. Lyon, sa capitale, en est le cœur économique et le grand carrefour du sud-est.",
      "Côté carburant, la région est traversée par le « couloir rhodanien », l'un des axes les plus fréquentés d'Europe : l'A6 et l'A7 y concentrent un trafic intense, complétées par l'A43 et l'A40 vers les Alpes et l'A75 vers le Massif central. Les métropoles de Lyon et Grenoble appliquent une ZFE, ce qui pousse de nombreux automobilistes à comparer les prix en périphérie avant de prendre la route.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Lyon' },
      { label: 'Grands axes', value: 'A6 · A7 · A43 · A40 · A75' },
    ],
  },
  'bourgogne-franche-comte': {
    emblem: '/images/flags/regions/bourgogne-franche-comte.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Bourgogne-Franche-Comté',
    nickname: 'Vignobles, moutarde et montagnes du Jura',
    paragraphs: [
      "Terre de grands crus et de la célèbre moutarde de Dijon, la Bourgogne-Franche-Comté marie les coteaux viticoles de la Côte-d'Or aux reliefs boisés du Jura. C'est une région de passage stratégique entre Paris, Lyon et la Suisse.",
      "Son réseau routier est dominé par l'A6 (Paris-Lyon), l'A31 (axe nord-sud Nancy-Dijon-Beaune) et l'A36 « La Comtoise » qui relie Beaune à Mulhouse. Ces grands axes de transit, très empruntés par les poids lourds et les vacanciers, expliquent une forte présence de stations d'autoroute où il est utile de comparer les tarifs avant de s'engager.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Dijon' },
      { label: 'Grands axes', value: 'A6 · A31 · A36 · A39' },
    ],
  },
  'bretagne': {
    emblem: '/images/flags/regions/bretagne.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Bretagne (Gwenn ha du)',
    nickname: 'Le pays du Gwenn ha du',
    paragraphs: [
      "Identifiable entre toutes grâce à son drapeau Gwenn ha du (« blanc et noir ») et ses onze mouchetures d'hermine, la Bretagne cultive une forte identité celtique, un littoral spectaculaire et une gastronomie réputée (crêpes, fruits de mer, beurre salé). Rennes en est la capitale régionale.",
      "Particularité bretonne très concrète pour les automobilistes : la région ne compte quasiment pas d'autoroutes payantes. L'héritage des « routes gratuites » voulu dans les années 1960 fait que les grands axes comme la RN12 et la RN165 sont des voies express sans péage, où l'on croise surtout des stations de bord de route plutôt que des aires d'autoroute concédées.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Rennes' },
      { label: 'Grands axes', value: 'RN12 · RN165 (2×2 voies gratuites)' },
    ],
  },
  'centre-val-de-loire': {
    emblem: '/images/flags/regions/centre-val-de-loire.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau du Centre-Val de Loire',
    nickname: 'Le jardin de la France et ses châteaux',
    paragraphs: [
      "Réputée pour ses châteaux de la Loire classés au patrimoine mondial (Chambord, Chenonceau, Amboise) et ses vignobles de Loire, la région Centre-Val de Loire est surnommée le « jardin de la France ». Orléans en est la préfecture.",
      "Sa position au sud de l'Île-de-France en fait un grand couloir de circulation vers le sud-ouest et le centre du pays. L'A10 (l'Aquitaine), l'A71 et l'A20 (en partie gratuite vers Limoges) la traversent, drainant un trafic vacancier important : autant d'occasions de surveiller les écarts de prix entre aires d'autoroute et stations des villes-étapes comme Tours, Orléans ou Bourges.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Orléans' },
      { label: 'Grands axes', value: 'A10 · A71 · A20 · A85' },
    ],
  },
  'corse': {
    emblem: '/images/flags/regions/corse.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Corse (tête de Maure)',
    nickname: "L'Île de Beauté",
    paragraphs: [
      "Reconnaissable à sa tête de Maure, la Corse, l'« Île de Beauté », offre des paysages uniques entre montagne et Méditerranée. Ajaccio et Bastia en sont les deux pôles principaux, reliés par des routes souvent sinueuses qui traversent un relief escarpé.",
      "L'insularité a un impact direct sur le carburant : l'absence d'autoroute, l'approvisionnement par voie maritime et l'éloignement des raffineries continentales tirent généralement les prix vers le haut par rapport à la moyenne nationale. Comparer les stations avant un long trajet sur l'île, où les points de ravitaillement sont plus espacés, est particulièrement utile.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Ajaccio' },
      { label: 'Réseau', value: 'Pas d’autoroute · routes de montagne' },
    ],
  },
  'grand-est': {
    emblem: '/images/flags/regions/grand-est.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau du Grand Est',
    nickname: "Aux portes de l'Europe",
    paragraphs: [
      "Née de la fusion de l'Alsace, de la Champagne-Ardenne et de la Lorraine, la région Grand Est partage ses frontières avec quatre pays (Belgique, Luxembourg, Allemagne, Suisse). Strasbourg, siège du Parlement européen, en est la capitale, entre vignobles de Champagne et Route des Vins d'Alsace.",
      "Cette situation frontalière est déterminante pour le carburant : de nombreux automobilistes comparent les prix français avec ceux du Luxembourg ou de l'Allemagne voisine, traditionnellement attractifs. La région est structurée par l'A4 (Paris-Strasbourg), l'A31 (le « sillon lorrain ») et l'A35 le long du Rhin.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Strasbourg' },
      { label: 'Grands axes', value: 'A4 · A31 · A35' },
    ],
  },
  'hauts-de-france': {
    emblem: '/images/flags/regions/hauts-de-france.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau des Hauts-de-France',
    nickname: 'Beffrois, Flandre et Côte d’Opale',
    paragraphs: [
      "Entre les beffrois inscrits à l'UNESCO, la culture flamande et ch'ti, les plages de la Côte d'Opale et l'héritage minier, les Hauts-de-France forment la principale porte d'entrée terrestre vers le Royaume-Uni et le Benelux. Lille en est la métropole.",
      "C'est l'une des régions les plus denses en infrastructures : l'A1 (Paris-Lille), l'A16 (littoral), l'A26 (« l'Autoroute des Anglais ») et l'A23 y canalisent un trafic international permanent. La proximité de la Belgique influence aussi les habitudes de plein, beaucoup d'automobilistes comparant les prix de part et d'autre de la frontière.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Lille' },
      { label: 'Grands axes', value: 'A1 · A16 · A26 · A23 · A25' },
    ],
  },
  'ile-de-france': {
    emblem: '/images/flags/regions/ile-de-france.svg',
    emblemType: 'drapeau',
    emblemCaption: "Drapeau de l'Île-de-France",
    nickname: 'La région capitale',
    paragraphs: [
      "Cœur politique et économique du pays, l'Île-de-France concentre plus de douze millions d'habitants autour de Paris. C'est la région la plus dense de France, organisée en couronnes autour de la capitale et de son réseau de transports.",
      "Pour le carburant, la donne y est singulière : les stations sont rares dans Paris intra-muros, la Zone à Faibles Émissions (ZFE) du Grand Paris restreint la circulation des véhicules les plus anciens, et les prix figurent souvent parmi les plus élevés de France. Beaucoup de Franciliens font le plein en grande couronne ou le long de l'A86 et de la Francilienne (N104), moins onéreuses que le centre.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Paris' },
      { label: 'Grands axes', value: 'A1 · A4 · A6 · A13 · A86 · périphérique' },
    ],
  },
  'normandie': {
    emblem: '/images/flags/regions/normandie.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Normandie (les léopards)',
    nickname: 'Les deux léopards',
    paragraphs: [
      "Symbolisée par ses léopards d'or sur fond rouge, la Normandie évoque le Mont-Saint-Michel, les plages du Débarquement, le bocage et un patrimoine maritime de premier plan. Rouen en est la préfecture, entre vallée de la Seine et façade Manche.",
      "Bien reliée à Paris, la région s'appuie sur l'A13 (l'Autoroute de Normandie), complétée par l'A28 et l'A29. Ses grands ouvrages (pont de Normandie et pont de Tancarville) sont à péage, et les flux touristiques vers la côte fleurie rendent utile la comparaison des prix entre l'intérieur et le littoral, notamment l'été.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Rouen' },
      { label: 'Grands axes', value: 'A13 · A28 · A29' },
    ],
  },
  'nouvelle-aquitaine': {
    emblem: '/images/flags/regions/nouvelle-aquitaine.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Nouvelle-Aquitaine',
    nickname: 'La plus vaste région de France',
    paragraphs: [
      "Plus grande région de France métropolitaine, la Nouvelle-Aquitaine déploie une diversité remarquable : vignobles bordelais, forêt des Landes, côte atlantique et ses spots de surf, Pays basque et Périgord. Bordeaux en est la capitale.",
      "Son étendue impose de longues distances et un réseau structurant : l'A10 vers Paris, l'A63 le long de la côte landaise vers l'Espagne, l'A89 (Bordeaux-Lyon) et l'A62 vers Toulouse. Sur ces grands trajets, l'écart entre stations d'autoroute et stations de centre-ville peut représenter plusieurs euros par plein, d'où l'intérêt d'anticiper son ravitaillement.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bordeaux' },
      { label: 'Grands axes', value: 'A10 · A63 · A89 · A62' },
    ],
  },
  'occitanie': {
    emblem: '/images/flags/regions/occitanie.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de l’Occitanie (croix occitane)',
    nickname: 'De la croix occitane à la Méditerranée',
    paragraphs: [
      "Marquée par la croix occitane et l'étoile à sept branches, l'Occitanie s'étire des Pyrénées à la Méditerranée, du pays cathare aux plages du Languedoc. Toulouse, la « ville rose » et capitale européenne de l'aéronautique, en est le pôle majeur avec Montpellier.",
      "La région est un carrefour autoroutier du sud : l'A61 « des Deux Mers » relie l'Atlantique à la Méditerranée, l'A9 « la Languedocienne » longe le littoral vers l'Espagne, et l'A75, gratuite et franchissant le spectaculaire viaduc de Millau, descend du Massif central. Le tourisme estival y fait grimper la fréquentation des stations littorales.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Toulouse' },
      { label: 'Grands axes', value: 'A61 · A9 · A75 · A20 · A62' },
    ],
  },
  'pays-de-la-loire': {
    emblem: '/images/flags/regions/pays-de-la-loire.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau des Pays de la Loire',
    nickname: 'De Nantes au littoral vendéen',
    paragraphs: [
      "Entre l'estuaire de la Loire, le vignoble nantais, le Puy du Fou et le littoral vendéen, les Pays de la Loire associent dynamisme économique et forte attractivité touristique. Nantes en est la capitale régionale.",
      "Comme en Bretagne voisine, une partie importante du réseau rapide est constituée de voies express gratuites (axes vers la Vendée et le littoral), aux côtés des autoroutes A11 (vers Paris), A83 (Nantes-Niort) et A87. L'afflux estival vers les plages des Sables-d'Olonne ou de La Baule accentue la demande de carburant sur la côte en haute saison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nantes' },
      { label: 'Grands axes', value: 'A11 · A83 · A87 · A28' },
    ],
  },
  'provence-alpes-cote-d-azur': {
    emblem: '/images/flags/regions/provence-alpes-cote-d-azur.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau de la Provence',
    nickname: 'Du Luberon à la Côte d’Azur',
    paragraphs: [
      "Champs de lavande, calanques, villages perchés et glamour de la Côte d'Azur : la région Provence-Alpes-Côte d'Azur est l'une des plus touristiques d'Europe. Marseille, plus ancienne ville de France, en est la capitale, entre Méditerranée et Alpes du Sud.",
      "Le réseau s'articule autour de l'A7 (la « vallée de l'autoroute du soleil »), de l'A8 « la Provençale » vers l'Italie, de l'A50, de l'A51 et de l'A9. La saison estivale provoque une affluence considérable et tire fréquemment les prix à la hausse sur le littoral : comparer les stations de l'arrière-pays peut alors faire une vraie différence.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Marseille' },
      { label: 'Grands axes', value: 'A7 · A8 · A50 · A51 · A9' },
    ],
  },
};

// ── DÉPARTEMENTS (clé = numéro) ───────────────────────────────────────────────
export const deptContent: Record<string, LocalContent> = {
  '85': {
    emblem: '/images/flags/departments/85.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Drapeau vendéen (les deux cœurs)',
    nickname: 'Le pays des deux cœurs',
    paragraphs: [
      "La Vendée arbore l'un des emblèmes régionaux les plus identifiables de France : le double cœur vendéen surmonté d'une couronne et d'une croix, héritage des guerres de Vendée. Le département conjugue un littoral très prisé (Les Sables-d'Olonne et le départ du Vendée Globe, l'île de Noirmoutier, Saint-Jean-de-Monts), le Marais poitevin et le célèbre Puy du Fou. La Roche-sur-Yon en est la préfecture.",
      "Destination touristique majeure, la Vendée voit sa population, et la demande de carburant, exploser l'été sur la côte. Le département est desservi par l'A83 (Nantes-Niort) et l'A87 vers Angers, complétées par un réseau de voies express gratuites typique de l'ouest. Aux abords des stations balnéaires en haute saison, les écarts de prix entre stations peuvent être marqués : la comparaison est alors particulièrement payante.",
    ],
    facts: [
      { label: 'Préfecture', value: 'La Roche-sur-Yon' },
      { label: 'Grands axes', value: 'A83 · A87 · voies express gratuites' },
    ],
  },
  '75': {
    emblem: '/images/flags/departments/75.svg',
    emblemType: 'drapeau',
    emblemCaption: 'Emblème de Paris (Fluctuat nec mergitur)',
    nickname: 'La capitale',
    paragraphs: [
      "Paris, à la fois ville et département, est le territoire le plus dense de France. Sa devise « Fluctuat nec mergitur » et son navire emblématique ornent ses armes depuis des siècles.",
      "Faire le plein dans Paris intra-muros relève souvent du défi : les stations y sont peu nombreuses et les prix comptent parmi les plus élevés du pays. La Zone à Faibles Émissions du Grand Paris restreint en outre la circulation des véhicules les plus anciens. Beaucoup d'automobilistes parisiens préfèrent se ravitailler en proche couronne ou le long du boulevard périphérique.",
    ],
    facts: [
      { label: 'Statut', value: 'Ville-département' },
      { label: 'À noter', value: 'ZFE · stations rares · prix élevés' },
    ],
  },
  '59': {
    emblem: '/images/flags/departments/59.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du département du Nord',
    nickname: 'Le plus peuplé de France',
    paragraphs: [
      "Département le plus peuplé de France, le Nord mêle culture flamande et ch'ti, beffrois, géants des fêtes et héritage minier du bassin houiller. Lille, sa préfecture, est une grande métropole transfrontalière.",
      "Frontalier de la Belgique, le Nord est un cas d'école pour la comparaison des prix : nombre d'automobilistes regardent de part et d'autre de la frontière avant de faire le plein. Le département est sillonné par l'A1, l'A23 et l'A25, axes très denses entre Lille, la Belgique et le reste de la France.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Lille' },
      { label: 'Grands axes', value: 'A1 · A23 · A25 · frontière belge' },
    ],
  },
  '13': {
    emblem: '/images/flags/departments/13.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Bouches-du-Rhône',
    nickname: 'Entre Marseille et la Provence',
    paragraphs: [
      "Des calanques de Marseille à la Camargue en passant par Aix-en-Provence et l'étang de Berre, les Bouches-du-Rhône concentrent un patrimoine méditerranéen exceptionnel et la plus grande ville du sud, Marseille, premier port de France.",
      "Le département est un nœud routier majeur : l'A7 y arrive du nord, l'A50 et l'A55 desservent la côte, l'A8 file vers la Côte d'Azur. Forte densité urbaine, ZFE marseillaise et tourisme estival se conjuguent pour rendre la comparaison des prix utile, en particulier en juillet-août.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Marseille' },
      { label: 'Grands axes', value: 'A7 · A50 · A55 · A8' },
    ],
  },
  '69': {
    emblem: '/images/flags/departments/69.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Rhône',
    nickname: 'Le carrefour rhodanien',
    paragraphs: [
      "Capitale des Gaules et haut lieu de la gastronomie française, Lyon rayonne sur le département du Rhône, à la confluence du Rhône et de la Saône. C'est l'un des principaux pôles économiques du pays.",
      "Sur le plan routier, le Rhône est un carrefour incontournable du « couloir rhodanien » : l'A6 et l'A7 s'y rejoignent, l'A43 ouvre vers les Alpes. La métropole de Lyon applique une ZFE, et la densité du trafic incite de nombreux conducteurs à comparer les prix en périphérie plutôt qu'au cœur de l'agglomération.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Lyon' },
      { label: 'Grands axes', value: 'A6 · A7 · A43 · A46' },
    ],
  },
  '33': {
    emblem: '/images/flags/departments/33.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Gironde',
    nickname: 'Le plus vaste département de métropole',
    paragraphs: [
      "Plus grand département de France métropolitaine, la Gironde est mondialement connue pour ses vignobles bordelais, la dune du Pilat et le bassin d'Arcachon. Bordeaux, sa préfecture, est une métropole en plein essor.",
      "Son étendue et son attractivité touristique structurent le réseau : l'A10 vers Paris, l'A63 vers les Landes et l'Espagne, l'A89 vers Lyon et la rocade bordelaise souvent saturée. Entre l'agglomération et les longues distances vers le littoral, anticiper son plein permet d'éviter les stations les plus chères.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bordeaux' },
      { label: 'Grands axes', value: 'A10 · A63 · A89 · rocade' },
    ],
  },
  '62': {
    emblem: '/images/flags/departments/62.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Pas-de-Calais',
    nickname: 'La porte de l’Angleterre',
    paragraphs: [
      "De la Côte d'Opale aux champs de bataille de la Grande Guerre, le Pas-de-Calais est la principale porte d'entrée vers le Royaume-Uni via le tunnel sous la Manche et le port de Calais. Arras en est la préfecture.",
      "Le département est traversé par l'A1, l'A16 littorale et l'A26 « des Anglais », avec un trafic international permanent de voyageurs et de poids lourds. La proximité de la Belgique et le flux transmanche en font une zone où la comparaison des prix avant le grand départ est particulièrement pertinente.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Arras' },
      { label: 'Grands axes', value: 'A1 · A16 · A26 · tunnel sous la Manche' },
    ],
  },
  '92': {
    emblem: '/images/flags/departments/92.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Hauts-de-Seine',
    nickname: 'Le poumon économique du Grand Paris',
    paragraphs: [
      "Adossés à l'ouest parisien, les Hauts-de-Seine abritent le quartier d'affaires de La Défense, premier pôle économique de ce type en Europe. Nanterre en est la préfecture, dans un territoire très urbanisé et densément peuplé.",
      "La circulation y est dense et la ZFE du Grand Paris s'y applique. L'A86, deuxième rocade francilienne, traverse le département. Stations peu nombreuses et prix élevés y sont la norme : comparer les tarifs d'une commune à l'autre permet souvent d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nanterre' },
      { label: 'À noter', value: 'La Défense · ZFE · A86' },
    ],
  },
  '93': {
    emblem: '/images/flags/departments/93.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Seine-Saint-Denis',
    nickname: 'Au nord-est de la capitale',
    paragraphs: [
      "Jeune et populaire, la Seine-Saint-Denis borde Paris au nord-est et accueille de grands équipements comme le Stade de France. Bobigny en est la préfecture, dans un département au tissu urbain dense.",
      "Proche des aéroports et des grands axes du nord parisien (A1, A3, A86), le territoire connaît une circulation intense et relève de la ZFE du Grand Paris. La densité y limite l'offre de stations : la comparaison des prix entre communes voisines reste un bon réflexe.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bobigny' },
      { label: 'Grands axes', value: 'A1 · A3 · A86 · proximité Roissy' },
    ],
  },
  '78': {
    emblem: '/images/flags/departments/78.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Yvelines',
    nickname: 'Du château de Versailles à la vallée de la Seine',
    paragraphs: [
      "Marquées par le château de Versailles et de vastes espaces de forêts et de plaines, les Yvelines forment l'ouest résidentiel et industriel de l'Île-de-France (avec notamment le pôle automobile de Flins-Poissy). Versailles en est la préfecture.",
      "Le département est desservi par l'A13 vers la Normandie, l'A12 et l'A86. Plus étendu et moins dense que la petite couronne, il offre davantage de stations de proximité : comparer les prix entre les pôles urbains et les zones plus rurales peut réserver de bonnes surprises.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Versailles' },
      { label: 'Grands axes', value: 'A13 · A12 · A86' },
    ],
  },
  '77': {
    emblem: '/images/flags/departments/77.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Seine-et-Marne',
    nickname: 'Le grand département francilien',
    paragraphs: [
      "Plus vaste département d'Île-de-France, la Seine-et-Marne couvre près de la moitié de la superficie régionale, entre la forêt de Fontainebleau, la Brie agricole et le parc Disneyland Paris. Melun en est la préfecture.",
      "Son étendue en fait un territoire de transit majeur : l'A4 vers l'est, l'A5 et l'A6 vers le sud le traversent. Moins dense que la petite couronne, la Seine-et-Marne compte de nombreuses stations le long de ces axes, où les écarts de prix entre aires d'autoroute et stations de ville méritent d'être comparés.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Melun' },
      { label: 'Grands axes', value: 'A4 · A5 · A6' },
    ],
  },
  '44': {
    emblem: '/images/flags/departments/44.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Loire-Atlantique',
    nickname: 'Entre Loire et océan',
    paragraphs: [
      "De l'estuaire de la Loire au littoral de La Baule, la Loire-Atlantique conjugue le dynamisme de la métropole nantaise, un riche héritage breton et de grandes stations balnéaires. Nantes en est la préfecture.",
      "Comme dans tout l'ouest, une part importante du réseau rapide est gratuite (voies express vers le littoral), aux côtés de l'A11 vers Paris et de l'A83 vers le sud. L'afflux touristique estival sur la côte (La Baule, Pornic) accentue la demande de carburant en haute saison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nantes' },
      { label: 'Grands axes', value: 'A11 · A83 · voies express gratuites' },
    ],
  },
  '38': {
    emblem: '/images/flags/departments/38.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de l’Isère',
    nickname: 'Des portes des Alpes aux massifs',
    paragraphs: [
      "Entre la plaine grenobloise et les massifs du Vercors, de la Chartreuse et de l'Oisans, l'Isère est une terre alpine par excellence, prisée des amateurs de montagne et de sports d'hiver. Grenoble en est la préfecture.",
      "Le relief structure la mobilité : l'A48, l'A41 et l'A480 desservent l'agglomération grenobloise, qui applique une ZFE. En période de migrations vers les stations de ski, le trafic s'intensifie fortement sur les axes alpins ; comparer les prix avant de monter en altitude, où les stations se raréfient, est judicieux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Grenoble' },
      { label: 'Grands axes', value: 'A48 · A41 · A480' },
    ],
  },
  '31': {
    emblem: '/images/flags/departments/31.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Garonne',
    nickname: 'La ville rose et la Garonne',
    paragraphs: [
      "Dominée par Toulouse, la « ville rose » et capitale européenne de l'aéronautique, la Haute-Garonne s'étire de la vallée de la Garonne jusqu'aux contreforts des Pyrénées. C'est l'un des départements les plus dynamiques de France.",
      "Toulouse est un grand carrefour autoroutier du sud-ouest : l'A61 vers la Méditerranée, l'A62 vers Bordeaux, l'A64 vers l'Atlantique et l'A68 s'y rejoignent autour d'un périphérique très fréquenté. La métropole applique une ZFE, ce qui pousse à comparer les prix sur l'ensemble de l'agglomération.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Toulouse' },
      { label: 'Grands axes', value: 'A61 · A62 · A64 · A68' },
    ],
  },
  '67': {
    emblem: '/images/flags/departments/67.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Bas-Rhin',
    nickname: 'Au cœur de l’Alsace',
    paragraphs: [
      "Cœur historique de l'Alsace, le Bas-Rhin marie la Route des Vins, les villages à colombages et le rayonnement européen de Strasbourg, siège du Parlement européen. Le Rhin y marque la frontière avec l'Allemagne.",
      "Cette proximité frontalière est décisive pour le carburant : les automobilistes comparent régulièrement les prix français et allemands. Le département est desservi par l'A4 (vers Paris) et l'A35 qui longe le Rhin du nord au sud de l'Alsace.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Strasbourg' },
      { label: 'Grands axes', value: 'A4 · A35 · frontière allemande' },
    ],
  },
  '34': {
    emblem: '/images/flags/departments/34.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de l’Hérault',
    nickname: 'Le littoral languedocien',
    paragraphs: [
      "Entre les plages du golfe du Lion, les garrigues et les vignobles du Languedoc, l'Hérault est l'un des départements les plus attractifs du sud. Montpellier, sa préfecture, figure parmi les villes françaises les plus dynamiques.",
      "L'A9 « la Languedocienne » longe le littoral vers l'Espagne et l'A75 (gratuite) descend du Massif central via le viaduc de Millau. L'afflux estival massif sur la côte (Cap d'Agde, Palavas) tire la demande de carburant à la hausse : comparer les stations de l'arrière-pays peut alors être avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Montpellier' },
      { label: 'Grands axes', value: 'A9 · A75 · A750' },
    ],
  },
  '94': {
    emblem: '/images/flags/departments/94.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Val-de-Marne',
    nickname: 'Au sud-est de Paris',
    paragraphs: [
      "Au sud-est de la capitale, le Val-de-Marne associe zones résidentielles, bords de Marne et grands équipements comme le marché de Rungis, premier marché de produits frais au monde. Créteil en est la préfecture.",
      "Traversé par l'A4 et l'A86, le département connaît une circulation dense et relève de la ZFE du Grand Paris. Comme dans toute la petite couronne, l'offre de stations est limitée et les prix élevés : la comparaison entre communes voisines reste pertinente.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Créteil' },
      { label: 'Grands axes', value: 'A4 · A86 · Rungis' },
    ],
  },
  '91': {
    emblem: '/images/flags/departments/91.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de l’Essonne',
    nickname: 'Le plateau de Saclay et la grande couronne sud',
    paragraphs: [
      "Au sud de Paris, l'Essonne mêle pôle scientifique du plateau de Saclay, vallées de la Seine et de l'Essonne et espaces ruraux du Hurepoix. Évry-Courcouronnes en est la préfecture.",
      "Le département est structuré par l'A6, l'A10 et la Francilienne (N104). Située en grande couronne, l'Essonne offre davantage de stations de proximité que le centre francilien : comparer les prix entre les pôles urbains et les zones plus rurales y est souvent rentable.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Évry-Courcouronnes' },
      { label: 'Grands axes', value: 'A6 · A10 · N104 (Francilienne)' },
    ],
  },
  '95': {
    emblem: '/images/flags/departments/95.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Val-d’Oise',
    nickname: 'Aux portes de Roissy',
    paragraphs: [
      "Au nord de Paris, le Val-d'Oise abrite l'aéroport Roissy-Charles-de-Gaulle, premier aéroport de France, ainsi que des espaces préservés comme le Vexin français. Pontoise et l'agglomération de Cergy en forment le pôle administratif.",
      "Desservi par l'A1, l'A15 et l'A115, le département est un grand carrefour de circulation lié à l'activité aéroportuaire. Entre zones denses et secteurs plus ruraux du Vexin, les écarts de prix entre stations méritent d'être comparés.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Pontoise' },
      { label: 'Grands axes', value: 'A1 · A15 · A115 · Roissy-CDG' },
    ],
  },
  '06': {
    emblem: '/images/flags/departments/06.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Alpes-Maritimes',
    nickname: 'Le cœur de la Côte d’Azur',
    paragraphs: [
      "Entre mer et montagne, les Alpes-Maritimes incarnent le glamour de la Côte d'Azur (Nice, Cannes, Antibes) tout en s'élevant rapidement vers l'arrière-pays alpin et le Mercantour. Nice, cinquième ville de France, en est la préfecture.",
      "L'A8 « la Provençale » traverse le département d'ouest en est vers l'Italie, souvent saturée en saison. L'attractivité touristique exceptionnelle, notamment l'été et lors des grands événements, tire fréquemment les prix du carburant vers le haut sur le littoral : comparer les stations de l'arrière-pays peut faire la différence.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nice' },
      { label: 'Grands axes', value: 'A8 · frontière italienne' },
    ],
  },
  '29': {
    emblem: '/images/flags/departments/29.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Finistère',
    nickname: 'La pointe de la Bretagne',
    paragraphs: [
      "À l'extrême ouest de la Bretagne, le Finistère, « la fin des terres », offre un littoral spectaculaire, des ports de caractère (Brest, Concarneau) et une identité bretonne très vivace. Quimper en est la préfecture.",
      "Fidèle à la tradition bretonne, le département est desservi par des voies express gratuites (RN12, RN165) plutôt que par des autoroutes à péage. Les longues distances vers la pointe et l'afflux estival sur la côte rendent utile la comparaison des prix avant de s'éloigner des grandes agglomérations.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Quimper' },
      { label: 'Grands axes', value: 'RN12 · RN165 (gratuites)' },
    ],
  },
  '83': {
    emblem: '/images/flags/departments/83.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Var',
    nickname: 'De Toulon au golfe de Saint-Tropez',
    paragraphs: [
      "Avec ses calanques, ses îles d'Or et le célèbre golfe de Saint-Tropez, le Var est l'un des départements les plus touristiques de France. Toulon, sa préfecture et grand port militaire, en est le pôle principal.",
      "L'A8 le traverse d'ouest en est, complétée par l'A50 et l'A57 autour de Toulon. L'été, la fréquentation explose sur le littoral varois et les prix du carburant suivent souvent la même tendance : anticiper son plein dans l'arrière-pays peut permettre d'éviter les stations les plus chères de la côte.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Toulon' },
      { label: 'Grands axes', value: 'A8 · A50 · A57' },
    ],
  },
};
