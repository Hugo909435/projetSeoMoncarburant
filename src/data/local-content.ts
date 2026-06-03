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
  '01': {
    emblem: '/images/flags/departments/01.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Ain",
    nickname: 'De la Bresse au pays de Gex',
    paragraphs: [
      "Entre la Bresse et sa célèbre volaille AOP, les étangs de la Dombes, le vignoble du Bugey et le pays de Gex adossé au Jura, l'Ain offre une grande diversité de paysages aux portes de Lyon et de Genève. Bourg-en-Bresse en est la préfecture.",
      "Le département est traversé par l'A40 (« l'Autoroute Blanche » vers les Alpes et Genève), l'A42 et l'A39. Le pays de Gex, frontalier de la Suisse, est une zone où beaucoup d'automobilistes comparent les prix français et helvétiques avant de faire le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bourg-en-Bresse' },
      { label: 'Grands axes', value: 'A40 · A42 · A39' },
    ],
  },
  '02': {
    emblem: '/images/flags/departments/02.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Aisne",
    nickname: 'Au cœur des Hauts-de-France',
    paragraphs: [
      "Marquée par la mémoire de la Première Guerre mondiale (Chemin des Dames) et un riche patrimoine (Laon et sa cathédrale perchée, Saint-Quentin, Soissons), l'Aisne est un département rural et agricole des Hauts-de-France. Laon en est la préfecture.",
      "Sa position en fait un territoire de transit entre la région parisienne, la Belgique et l'est : l'A26 « des Anglais » et l'A29 le traversent, complétées par la RN2. Sur ces axes de passage, comparer les prix entre aires d'autoroute et stations des villes permet souvent d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Laon' },
      { label: 'Grands axes', value: 'A26 · A29 · RN2' },
    ],
  },
  '2A': {
    emblem: '/images/flags/departments/2A.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Corse-du-Sud',
    nickname: "De la cité impériale à Bonifacio",
    paragraphs: [
      "Berceau de Napoléon à Ajaccio, la Corse-du-Sud séduit par ses golfes, les falaises de Bonifacio, les aiguilles de Bavella et le site de Porto. Ajaccio, la préfecture, est aussi l'un des grands ports de l'île.",
      "Comme partout en Corse, l'absence d'autoroute et l'insularité (approvisionnement maritime, éloignement des raffineries) tirent généralement les prix du carburant au-dessus de la moyenne nationale. Sur des routes de montagne où les stations sont espacées, anticiper son plein avant un long trajet est vivement conseillé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Ajaccio' },
      { label: 'Réseau', value: 'Pas d’autoroute · insularité' },
    ],
  },
  '2B': {
    emblem: '/images/flags/departments/2B.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Corse',
    nickname: 'Du Cap Corse à la Balagne',
    paragraphs: [
      "Entre le Cap Corse, les plages de la Balagne, la châtaigneraie de la Castagniccia et la vieille ville gênoise de Bastia, la Haute-Corse conjugue mer et montagne avec caractère. Bastia, sa préfecture, est la principale porte maritime de l'île.",
      "L'insularité pèse sur le carburant : sans autoroute et avec un approvisionnement par bateau, les prix sont souvent plus élevés que sur le continent. Les distances et le relief rendent la comparaison des stations particulièrement utile avant de s'éloigner des grandes villes.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bastia' },
      { label: 'Réseau', value: 'Pas d’autoroute · insularité' },
    ],
  },
  '03': {
    emblem: '/images/flags/departments/03.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Allier",
    nickname: 'Le pays bourbonnais et Vichy',
    paragraphs: [
      "Ancien duché de Bourbon, l'Allier marie le thermalisme et l'élégance de Vichy, le dynamisme de Montluçon, le bocage bourbonnais et la rivière Allier. Moulins en est la préfecture.",
      "Le département est desservi par l'A71 (Paris-Clermont) et la RN7, ainsi que par la RN79 (RCEA), grand axe est-ouest gratuit très fréquenté par les poids lourds. Sur ces itinéraires de transit, les écarts de prix entre stations méritent d'être comparés.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Moulins' },
      { label: 'Grands axes', value: 'A71 · RN7 · RN79 (RCEA)' },
    ],
  },
  '04': {
    emblem: '/images/flags/departments/04.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Alpes-de-Haute-Provence',
    nickname: 'Lavande et gorges du Verdon',
    paragraphs: [
      "Terre de lumière provençale, les Alpes-de-Haute-Provence déroulent les champs de lavande du plateau de Valensole, les spectaculaires gorges du Verdon et les villages perchés autour de Manosque et Digne-les-Bains, la préfecture.",
      "Peu autoroutier (seule l'A51 dessert l'ouest du département), le territoire repose largement sur des routes de montagne où les stations se font rares. Anticiper son ravitaillement avant de rejoindre les zones touristiques d'altitude est un bon réflexe, surtout en été.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Digne-les-Bains' },
      { label: 'Grands axes', value: 'A51 · routes de montagne' },
    ],
  },
  '05': {
    emblem: '/images/flags/departments/05.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Hautes-Alpes',
    nickname: 'Au pays du soleil et des sommets',
    paragraphs: [
      "Avec Briançon, plus haute ville d'Europe, le parc national des Écrins et les stations de Serre-Chevalier ou Vars, les Hautes-Alpes sont un paradis de la montagne, été comme hiver. Gap en est la préfecture.",
      "Le réseau s'appuie sur l'A51 au sud puis sur des routes de cols (Lautaret, Izoard). Lors des week-ends de ski et des vacances, le trafic grimpe fortement et les stations-service se raréfient en altitude : comparer les prix avant de monter peut faire la différence.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Gap' },
      { label: 'Grands axes', value: 'A51 · cols alpins' },
    ],
  },
  '07': {
    emblem: '/images/flags/departments/07.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Ardèche",
    nickname: 'Gorges, châtaignes et volcans',
    paragraphs: [
      "Réputée pour les gorges de l'Ardèche et le Pont d'Arc, la châtaigne AOP et ses paysages volcaniques, l'Ardèche est un haut lieu du tourisme de pleine nature. Privas en est la préfecture, l'une des rares de France sans autoroute ni gare.",
      "Le département n'a pas d'autoroute traversante : l'A7 longe sa frontière est, le long du Rhône. Sur les routes sinueuses de l'intérieur, où les stations sont espacées, et lors de l'afflux estival vers les gorges, comparer les prix avant de partir est judicieux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Privas' },
      { label: 'Grands axes', value: 'A7 (en limite) · routes de l’intérieur' },
    ],
  },
  '08': {
    emblem: '/images/flags/departments/08.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Ardennes',
    nickname: 'La forêt, la Meuse et la frontière',
    paragraphs: [
      "Pays de forêts profondes et de méandres de la Meuse, patrie de Rimbaud, les Ardennes cultivent une identité forte aux confins de la Belgique. Charleville-Mézières, avec sa place Ducale, en est la préfecture.",
      "Frontalier de la Belgique, le département est desservi par l'A34 vers Reims et l'A203 autour de Charleville. La proximité de la frontière incite de nombreux automobilistes à comparer les prix de part et d'autre avant de faire le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Charleville-Mézières' },
      { label: 'Grands axes', value: 'A34 · A203 · frontière belge' },
    ],
  },
  '09': {
    emblem: '/images/flags/departments/09.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Ariège",
    nickname: 'Pyrénées et châteaux cathares',
    paragraphs: [
      "Entre les châteaux cathares perchés (Montségur), les grottes ornées (Niaux) et les sommets pyrénéens, l'Ariège est un département de montagne authentique et préservé. Foix, dominée par son château comtal, en est la préfecture.",
      "L'axe principal est la RN20, qui relie Toulouse à l'Andorre et à l'Espagne par la montagne. Sur cet itinéraire transfrontalier et sur les routes de cols, les stations sont espacées : comparer les prix avant de s'engager vers les Pyrénées est recommandé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Foix' },
      { label: 'Grands axes', value: 'RN20 (Toulouse-Andorre)' },
    ],
  },
  '10': {
    emblem: '/images/flags/departments/10.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Aube",
    nickname: 'Champagne et cité médiévale de Troyes',
    paragraphs: [
      "Au sud de la Champagne, l'Aube associe le vignoble de la Côte des Bar, les grands lacs (lac d'Orient) et la magnifique cité médiévale de Troyes, célèbre pour ses maisons à colombages et ses magasins d'usine. Troyes en est la préfecture.",
      "Le département est traversé par l'A5 (Paris-Langres) et l'A26, axes de transit vers l'est et le sud. Sur ces autoroutes, l'écart de prix avec les stations de Troyes et des villes-étapes vaut la comparaison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Troyes' },
      { label: 'Grands axes', value: 'A5 · A26' },
    ],
  },
  '11': {
    emblem: '/images/flags/departments/11.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Aude",
    nickname: 'De Carcassonne aux Corbières',
    paragraphs: [
      "Dominée par la cité médiévale de Carcassonne classée à l'UNESCO, l'Aude déroule le vignoble des Corbières, le canal du Midi et les châteaux cathares, entre Méditerranée et Pyrénées. Carcassonne en est la préfecture.",
      "Carrefour du sud, le département est traversé par l'A61 « des Deux Mers » (Toulouse-Méditerranée) et rejoint l'A9 vers l'Espagne. Sur ces axes très fréquentés l'été, comparer les prix entre autoroute et stations de l'intérieur est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Carcassonne' },
      { label: 'Grands axes', value: 'A61 · A9 (à proximité)' },
    ],
  },
  '12': {
    emblem: '/images/flags/departments/12.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Aveyron",
    nickname: 'Viaduc de Millau et grands causses',
    paragraphs: [
      "Terre de caractère, l'Aveyron abrite le célèbre viaduc de Millau, le village de Conques sur le chemin de Compostelle, les caves de Roquefort et les vastes causses du Larzac. Rodez en est la préfecture.",
      "Le département est traversé par l'A75, autoroute gratuite (hormis le péage du viaduc de Millau) qui relie Clermont-Ferrand à Béziers. Sur cet axe touristique très emprunté l'été, et sur les routes des causses, comparer les prix reste utile.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Rodez' },
      { label: 'Grands axes', value: 'A75 (viaduc de Millau)' },
    ],
  },
  '14': {
    emblem: '/images/flags/departments/14.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Calvados',
    nickname: 'Plages du Débarquement et Côte Fleurie',
    paragraphs: [
      "Haut lieu de mémoire avec les plages du Débarquement et la tapisserie de Bayeux, le Calvados séduit aussi par la Côte Fleurie (Deauville, Cabourg), le bocage et le cidre. Caen, marquée par Guillaume le Conquérant, en est la préfecture.",
      "Bien relié à Paris par l'A13 (l'Autoroute de Normandie), complété par l'A84 vers la Bretagne, le département connaît une forte fréquentation touristique l'été et lors des commémorations. Comparer les prix entre l'intérieur et le littoral peut alors être payant.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Caen' },
      { label: 'Grands axes', value: 'A13 · A84' },
    ],
  },
  '15': {
    emblem: '/images/flags/departments/15.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Cantal',
    nickname: 'Au cœur des volcans d’Auvergne',
    paragraphs: [
      "Dominé par le plus grand volcan d'Europe, le Cantal est une terre de moyenne montagne réputée pour ses fromages (cantal, salers), ses estives et ses villages de caractère comme Salers. Aurillac en est la préfecture.",
      "Le département est traversé du nord au sud par l'A75 gratuite, axe majeur vers le Midi. Ailleurs, le relief impose des routes de montagne où les stations sont espacées : faire le plein avant de traverser les zones les plus isolées est conseillé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Aurillac' },
      { label: 'Grands axes', value: 'A75 · routes de montagne' },
    ],
  },
  '16': {
    emblem: '/images/flags/departments/16.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Charente',
    nickname: 'Le pays du cognac et de la BD',
    paragraphs: [
      "Mondialement connue pour son cognac, la Charente l'est aussi pour Angoulême, capitale de la bande dessinée, et pour son fleuve paisible bordé de villages. Angoulême en est la préfecture.",
      "Le département est traversé par la RN10 (Poitiers-Bordeaux), axe gratuit très emprunté, tandis que l'A10 passe à proximité. Sur ces grands itinéraires nord-sud, comparer les prix entre stations de route et aires d'autoroute permet souvent d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Angoulême' },
      { label: 'Grands axes', value: 'RN10 · A10 (à proximité)' },
    ],
  },
  '17': {
    emblem: '/images/flags/departments/17.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Charente-Maritime',
    nickname: 'La Rochelle, Ré et Oléron',
    paragraphs: [
      "Avec La Rochelle et son Vieux-Port, les îles de Ré et d'Oléron, Royan et les huîtres de Marennes-Oléron, la Charente-Maritime est l'une des destinations balnéaires préférées des Français. La Rochelle en est la préfecture.",
      "Le département est desservi par l'A10 et l'A837. L'été, l'afflux touristique vers le littoral et les îles fait grimper la demande de carburant : comparer les prix entre l'intérieur et la côte, et anticiper avant de rejoindre les îles, est particulièrement utile.",
    ],
    facts: [
      { label: 'Préfecture', value: 'La Rochelle' },
      { label: 'Grands axes', value: 'A10 · A837' },
    ],
  },
  '18': {
    emblem: '/images/flags/departments/18.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Cher',
    nickname: 'Bourges, le Berry et le Sancerrois',
    paragraphs: [
      "Au cœur de la France, le Cher abrite la majestueuse cathédrale de Bourges classée à l'UNESCO, le vignoble de Sancerre et les paysages du Berry chers à George Sand. Bourges en est la préfecture.",
      "Le département est desservi par l'A71 (Paris-Clermont) et proche de l'A20. Sur ces axes nord-sud très fréquentés lors des grandes migrations, les écarts de prix entre aires d'autoroute et stations de Bourges valent la comparaison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bourges' },
      { label: 'Grands axes', value: 'A71 · A20 (à proximité)' },
    ],
  },
  '19': {
    emblem: '/images/flags/departments/19.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Corrèze',
    nickname: 'Brive, Tulle et les villages de charme',
    paragraphs: [
      "Entre les plus beaux villages de France (Collonges-la-Rouge, Turenne), le dynamisme de Brive-la-Gaillarde et les hauteurs du plateau de Millevaches, la Corrèze incarne un Limousin authentique. Tulle en est la préfecture.",
      "Le département est bien relié par l'A20 (gratuite, Vierzon-Toulouse) et l'A89 (Bordeaux-Lyon), qui se croisent près de Brive. Sur ces grands axes de transit, comparer les prix entre stations d'autoroute et stations de ville est un bon réflexe.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Tulle' },
      { label: 'Grands axes', value: 'A20 · A89' },
    ],
  },
  '21': {
    emblem: '/images/flags/departments/21.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de la Côte-d'Or",
    nickname: 'Grands crus et capitale des Ducs',
    paragraphs: [
      "Cœur historique de la Bourgogne, la Côte-d'Or aligne les grands crus de la côte de Nuits et de Beaune, le patrimoine ducal de Dijon et sa fameuse moutarde. Dijon en est la préfecture.",
      "Grand carrefour, le département voit se croiser l'A6 (Paris-Lyon), l'A31 (axe nord-sud) et l'A38. Sur ces autoroutes très fréquentées par les vacanciers et les poids lourds, comparer les prix avec les stations de l'agglomération dijonnaise est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Dijon' },
      { label: 'Grands axes', value: 'A6 · A31 · A38' },
    ],
  },
  '22': {
    emblem: '/images/flags/departments/22.svg',
    emblemType: 'blason',
    emblemCaption: "Blason des Côtes-d'Armor",
    nickname: 'Côte de Granit Rose et cité de Dinan',
    paragraphs: [
      "Avec la Côte de Granit Rose, le cap Fréhel, la cité médiévale de Dinan et le port de Paimpol, les Côtes-d'Armor offrent quelques-uns des plus beaux paysages côtiers de Bretagne. Saint-Brieuc en est la préfecture.",
      "Fidèle à la tradition bretonne, le département est desservi par la RN12, voie express gratuite reliant Rennes à Brest. L'afflux touristique estival sur le littoral rend utile la comparaison des prix entre la côte et l'intérieur.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Saint-Brieuc' },
      { label: 'Grands axes', value: 'RN12 (gratuite)' },
    ],
  },
  '23': {
    emblem: '/images/flags/departments/23.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Creuse',
    nickname: 'Aubusson et le plateau de Millevaches',
    paragraphs: [
      "L'un des départements les moins peuplés de France, la Creuse séduit par la tapisserie d'Aubusson classée à l'UNESCO, les paysages vallonnés du plateau de Millevaches et une nature préservée. Guéret en est la préfecture.",
      "Le principal axe est la RN145 (RCEA), liaison gratuite est-ouest très empruntée par les poids lourds entre l'Atlantique et le centre. Dans ce territoire rural où les stations sont espacées, anticiper son plein est recommandé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Guéret' },
      { label: 'Grands axes', value: 'RN145 (RCEA)' },
    ],
  },
  '24': {
    emblem: '/images/flags/departments/24.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Dordogne',
    nickname: 'Le Périgord, ses châteaux et sa gastronomie',
    paragraphs: [
      "Le Périgord, c'est la Dordogne : grottes ornées de Lascaux, cité médiévale de Sarlat, châteaux perchés sur la rivière, foie gras et truffe. Périgueux en est la préfecture.",
      "Le département est traversé par l'A89 (Bordeaux-Lyon), seul grand axe autoroutier. Ailleurs, les routes de campagne desservent un territoire très touristique l'été : comparer les prix entre l'axe autoroutier et les stations des bourgs est judicieux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Périgueux' },
      { label: 'Grands axes', value: 'A89' },
    ],
  },
  '25': {
    emblem: '/images/flags/departments/25.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Doubs',
    nickname: 'Besançon, horlogerie et montagnes du Jura',
    paragraphs: [
      "Dominé par la citadelle Vauban de Besançon, le Doubs est le pays de l'horlogerie, de l'industrie automobile (Montbéliard, Sochaux) et des paysages du massif du Jura. Besançon en est la préfecture.",
      "Le département est structuré par l'A36 « La Comtoise » (Beaune-Mulhouse). Frontalier de la Suisse, il compte de nombreux travailleurs transfrontaliers qui comparent les prix des deux côtés de la frontière avant de faire le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Besançon' },
      { label: 'Grands axes', value: 'A36 · frontière suisse' },
    ],
  },
  '26': {
    emblem: '/images/flags/departments/26.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Drôme',
    nickname: 'Du nougat de Montélimar à la Provence',
    paragraphs: [
      "Porte du Midi, la Drôme déroule la vallée du Rhône, le nougat de Montélimar, les champs de lavande de la Drôme provençale et les reliefs du Vercors. Valence en est la préfecture.",
      "Le département est traversé par l'A7, l'« autoroute du soleil » et l'un des axes les plus fréquentés d'Europe, surtout lors des grands départs en vacances. Sur cet itinéraire, comparer les prix entre aires d'autoroute et stations de Valence ou Montélimar est très rentable.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Valence' },
      { label: 'Grands axes', value: 'A7 (couloir rhodanien)' },
    ],
  },
  '27': {
    emblem: '/images/flags/departments/27.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Eure",
    nickname: 'La Seine, Giverny et la Normandie',
    paragraphs: [
      "Entre les méandres de la Seine, les jardins de Monet à Giverny, Les Andelys et leur Château-Gaillard, l'Eure offre une Normandie verdoyante aux portes de l'Île-de-France. Évreux en est la préfecture.",
      "Le département est desservi par l'A13 (Paris-Caen) et l'A28, axes de transit majeurs vers la Normandie. Sur ces autoroutes, l'écart de prix avec les stations des villes comme Évreux ou Vernon vaut la comparaison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Évreux' },
      { label: 'Grands axes', value: 'A13 · A28 · A154' },
    ],
  },
  '28': {
    emblem: '/images/flags/departments/28.svg',
    emblemType: 'blason',
    emblemCaption: "Blason d'Eure-et-Loir",
    nickname: 'La cathédrale de Chartres et la Beauce',
    paragraphs: [
      "Dominé par la flèche de la cathédrale de Chartres, chef-d'œuvre gothique visible de loin dans la plaine, l'Eure-et-Loir s'étend sur la Beauce, le grenier à blé de la France, et le Perche bocager. Chartres en est la préfecture.",
      "Aux portes de l'Île-de-France, le département est desservi par l'A11 (l'Océane) vers le Mans et Nantes, et par la RN154. Sur l'A11, très empruntée vers l'ouest, comparer les prix entre stations d'autoroute et stations de ville est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Chartres' },
      { label: 'Grands axes', value: 'A11 · RN154 · A10 (à proximité)' },
    ],
  },
  '30': {
    emblem: '/images/flags/departments/30.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Gard',
    nickname: 'Du Pont du Gard à la Camargue',
    paragraphs: [
      "Patrimoine romain exceptionnel (Pont du Gard, arènes de Nîmes), Camargue gardoise, Cévennes et garrigues : le Gard concentre une grande richesse entre Provence et Languedoc. Nîmes en est la préfecture.",
      "Le département est traversé par l'A9 « la Languedocienne » et l'A54, axes majeurs vers l'Espagne et la Provence. L'été, la fréquentation touristique fait grimper la demande : comparer les prix entre l'autoroute et les stations de l'intérieur peut faire la différence.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nîmes' },
      { label: 'Grands axes', value: 'A9 · A54' },
    ],
  },
  '32': {
    emblem: '/images/flags/departments/32.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Gers',
    nickname: 'Le pays de d’Artagnan et de l’Armagnac',
    paragraphs: [
      "Cœur de la Gascogne, le Gers est une terre de douceur de vivre : Armagnac, foie gras, bastides médiévales et collines verdoyantes, sur les pas de d'Artagnan. Auch, dominée par sa cathédrale, en est la préfecture.",
      "Département rural sans autoroute traversante majeure, le Gers s'appuie sur la RN124 vers Toulouse. Les stations y étant plus espacées que dans les zones urbaines, comparer les prix et anticiper son plein sont de bons réflexes.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Auch' },
      { label: 'Grands axes', value: 'RN124 · réseau rural' },
    ],
  },
  '35': {
    emblem: '/images/flags/departments/35.svg',
    emblemType: 'blason',
    emblemCaption: "Blason d'Ille-et-Vilaine",
    nickname: 'De Rennes à la cité corsaire',
    paragraphs: [
      "Porte d'entrée de la Bretagne, l'Ille-et-Vilaine associe le dynamisme de Rennes, la cité corsaire de Saint-Malo, les remparts de Fougères et de Vitré. Rennes en est la préfecture et la capitale régionale.",
      "Fidèle au modèle breton, le département est desservi par des voies express gratuites (RN12, RN137, RN157) et par l'A84 vers la Normandie. L'afflux estival vers Saint-Malo et la côte d'Émeraude rend utile la comparaison des prix entre l'intérieur et le littoral.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Rennes' },
      { label: 'Grands axes', value: 'RN12 · RN137 · A84' },
    ],
  },
  '36': {
    emblem: '/images/flags/departments/36.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Indre",
    nickname: 'Le Berry et les étangs de la Brenne',
    paragraphs: [
      "Au cœur du Berry, l'Indre séduit par le parc naturel de la Brenne et ses milliers d'étangs, les paysages chers à George Sand autour de Nohant et la cité de Châteauroux, sa préfecture.",
      "Le département est traversé par l'A20, autoroute gratuite reliant Vierzon à Limoges et Toulouse, très empruntée lors des départs vers le sud-ouest. Sur cet axe, comparer les prix entre aires et stations de ville est particulièrement intéressant.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Châteauroux' },
      { label: 'Grands axes', value: 'A20 (gratuite) · RN151' },
    ],
  },
  '37': {
    emblem: '/images/flags/departments/37.svg',
    emblemType: 'blason',
    emblemCaption: "Blason d'Indre-et-Loire",
    nickname: 'Le jardin de la France et ses châteaux',
    paragraphs: [
      "Surnommée le « jardin de la France », l'Indre-et-Loire concentre les plus célèbres châteaux de la Loire (Chenonceau, Amboise, Villandry, Azay-le-Rideau) et les vins de Touraine. Tours en est la préfecture.",
      "Le département est un carrefour majeur : l'A10 (Paris-Bordeaux), l'A28 et l'A85 s'y croisent. Sur ces axes très fréquentés par les vacanciers, comparer les prix entre aires d'autoroute et stations de l'agglomération tourangelle est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Tours' },
      { label: 'Grands axes', value: 'A10 · A28 · A85' },
    ],
  },
  '39': {
    emblem: '/images/flags/departments/39.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Jura',
    nickname: 'Vin jaune, comté et reculées',
    paragraphs: [
      "Pays du vin jaune et du comté, le Jura déploie ses vignobles, ses lacs et cascades, ses reculées spectaculaires et la station de Lons-le-Saunier, sa préfecture. La montagne jurassienne y culmine vers la Suisse.",
      "Le département est desservi par l'A39 (Dijon-Bourg-en-Bresse). Proche de la frontière suisse, il voit de nombreux automobilistes comparer les prix des deux côtés, tandis que les routes de montagne, aux stations plus rares, invitent à anticiper le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Lons-le-Saunier' },
      { label: 'Grands axes', value: 'A39 · frontière suisse' },
    ],
  },
  '40': {
    emblem: '/images/flags/departments/40.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Landes',
    nickname: 'La plus grande forêt et l’océan',
    paragraphs: [
      "Couvertes par la plus grande forêt artificielle d'Europe, les Landes offrent un littoral atlantique prisé des surfeurs (Hossegor, Capbreton) et le thermalisme de Dax. Mont-de-Marsan en est la préfecture.",
      "Le département est desservi par l'A63 vers l'Espagne et l'A65 vers Pau. L'été, l'afflux vers les plages fait fortement grimper la demande de carburant sur la côte : comparer les prix entre l'intérieur boisé et le littoral est alors très utile.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Mont-de-Marsan' },
      { label: 'Grands axes', value: 'A63 · A65' },
    ],
  },
  '41': {
    emblem: '/images/flags/departments/41.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de Loir-et-Cher',
    nickname: 'Chambord et la Sologne',
    paragraphs: [
      "Le Loir-et-Cher abrite le plus grand des châteaux de la Loire, Chambord, ainsi que Blois, Chaumont, et les vastes forêts giboyeuses de la Sologne. Blois en est la préfecture.",
      "Le département est traversé par l'A10 (Paris-Bordeaux) et l'A85, axes très empruntés vers le sud-ouest. Sur ces autoroutes, l'écart de prix avec les stations de Blois et de Vendôme vaut largement la comparaison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Blois' },
      { label: 'Grands axes', value: 'A10 · A85 · A71' },
    ],
  },
  '42': {
    emblem: '/images/flags/departments/42.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Loire',
    nickname: 'Saint-Étienne, le Forez et les gorges',
    paragraphs: [
      "Marquée par l'histoire industrielle de Saint-Étienne (manufacture d'armes, design, football), la Loire offre aussi les gorges de la Loire, les monts du Forez et la plaine du Roannais. Saint-Étienne en est la préfecture.",
      "Le département est desservi par l'A72 (vers Clermont-Ferrand), l'A47 (vers Lyon) et l'A89. La métropole stéphanoise applique une ZFE : comparer les prix sur l'ensemble de l'agglomération et le long de ces axes est un bon réflexe.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Saint-Étienne' },
      { label: 'Grands axes', value: 'A72 · A47 · A89' },
    ],
  },
  '43': {
    emblem: '/images/flags/departments/43.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Loire',
    nickname: 'Le Puy-en-Velay et les volcans',
    paragraphs: [
      "Point de départ de la Via Podiensis vers Saint-Jacques, le Puy-en-Velay est célèbre pour ses pitons volcaniques coiffés de chapelles et sa lentille verte AOP. La Haute-Loire déroule autour gorges de l'Allier et plateaux volcaniques. Le Puy-en-Velay en est la préfecture.",
      "Le département s'appuie sur la RN88 et reste proche de l'A75. Sur ce territoire de moyenne montagne aux stations espacées, comparer les prix et anticiper son plein avant les zones isolées est conseillé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Le Puy-en-Velay' },
      { label: 'Grands axes', value: 'RN88 · A75 (à proximité)' },
    ],
  },
  '45': {
    emblem: '/images/flags/departments/45.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Loiret',
    nickname: 'Orléans, la Loire et sa forêt',
    paragraphs: [
      "Lié à la mémoire de Jeanne d'Arc, le Loiret marie le patrimoine d'Orléans, le Val de Loire classé à l'UNESCO, la plus grande forêt domaniale de France et le canal de Briare. Orléans en est la préfecture.",
      "Carrefour autoroutier majeur au sud de Paris, le département voit converger l'A10, l'A71, l'A19 et l'A77. Sur ces axes de grand transit, comparer les prix entre aires d'autoroute et stations de l'agglomération orléanaise est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Orléans' },
      { label: 'Grands axes', value: 'A10 · A71 · A19 · A77' },
    ],
  },
  '46': {
    emblem: '/images/flags/departments/46.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Lot',
    nickname: 'Rocamadour et la vallée du Lot',
    paragraphs: [
      "Joyau du Quercy, le Lot émerveille avec Rocamadour accrochée à sa falaise, Saint-Cirq-Lapopie, le gouffre de Padirac et le vignoble de Cahors. Cahors, lovée dans un méandre du Lot, en est la préfecture.",
      "Le département est traversé par l'A20, autoroute gratuite reliant Vierzon à Toulouse, très empruntée lors des départs en vacances. Sur cet axe et sur les routes touristiques des vallées, comparer les prix avant de s'écarter des grands axes est judicieux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Cahors' },
      { label: 'Grands axes', value: 'A20 (gratuite)' },
    ],
  },
  '47': {
    emblem: '/images/flags/departments/47.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de Lot-et-Garonne",
    nickname: 'Le pays du pruneau et des bastides',
    paragraphs: [
      "Verger de la France, le Lot-et-Garonne est célèbre pour le pruneau d'Agen, ses bastides médiévales et la vallée fertile de la Garonne. Agen en est la préfecture.",
      "Le département est traversé par l'A62 (Bordeaux-Toulouse), grand axe du sud-ouest. Sur cette autoroute fréquentée, l'écart de prix avec les stations d'Agen, Marmande ou Villeneuve-sur-Lot mérite d'être comparé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Agen' },
      { label: 'Grands axes', value: 'A62' },
    ],
  },
  '48': {
    emblem: '/images/flags/departments/48.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Lozère',
    nickname: 'Le département le plus préservé de France',
    paragraphs: [
      "Le moins peuplé de France, la Lozère est un sanctuaire de nature : gorges du Tarn, mont Lozère, Aubrac, causses et Cévennes classés à l'UNESCO. Mende en est la préfecture.",
      "Le département est traversé par l'A75 gratuite, qui culmine à plus de 1 100 m d'altitude. Ailleurs, les routes de causses et de montagne comptent peu de stations : faire le plein avant de s'aventurer dans les zones isolées est fortement conseillé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Mende' },
      { label: 'Grands axes', value: 'A75 (gratuite)' },
    ],
  },
  '49': {
    emblem: '/images/flags/departments/49.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de Maine-et-Loire",
    nickname: 'La douceur angevine',
    paragraphs: [
      "Pays de la « douceur angevine », le Maine-et-Loire associe le château d'Angers et sa tenture de l'Apocalypse, les vignobles d'Anjou et de Saumur, et le Val de Loire. Angers en est la préfecture.",
      "Le département est desservi par l'A11 (vers Paris et Nantes), l'A85 et l'A87. Sur ces axes reliant l'ouest au Bassin parisien, comparer les prix entre aires d'autoroute et stations d'Angers ou Cholet est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Angers' },
      { label: 'Grands axes', value: 'A11 · A85 · A87' },
    ],
  },
  '50': {
    emblem: '/images/flags/departments/50.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Manche',
    nickname: 'Le Mont-Saint-Michel et le Cotentin',
    paragraphs: [
      "Avec le Mont-Saint-Michel, la presqu'île du Cotentin, le port de Cherbourg et la plage d'Utah Beach, la Manche déploie un littoral spectaculaire sur près de 350 km. Saint-Lô en est la préfecture.",
      "Le département est desservi par l'A84 (Caen-Rennes), seul grand axe autoroutier. La forte fréquentation touristique autour du Mont-Saint-Michel et des côtes rend utile la comparaison des prix entre l'intérieur et les sites les plus visités.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Saint-Lô' },
      { label: 'Grands axes', value: 'A84' },
    ],
  },
  '51': {
    emblem: '/images/flags/departments/51.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Marne',
    nickname: 'La Champagne et ses bulles',
    paragraphs: [
      "Berceau du champagne, la Marne déroule ses coteaux classés à l'UNESCO autour de Reims et d'Épernay, ainsi que la cathédrale du sacre des rois de France. Châlons-en-Champagne en est la préfecture.",
      "Le département est un carrefour de l'est : l'A4 (Paris-Strasbourg), l'A26 et l'A34 s'y croisent. Sur ces grands axes de transit, comparer les prix entre aires d'autoroute et stations de Reims ou Châlons est un bon moyen d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Châlons-en-Champagne' },
      { label: 'Grands axes', value: 'A4 · A26 · A34' },
    ],
  },
  '52': {
    emblem: '/images/flags/departments/52.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Marne',
    nickname: 'Colombey, le lac du Der et les forêts',
    paragraphs: [
      "Terre de forêts et de lacs, la Haute-Marne est connue pour Colombey-les-Deux-Églises et le mémorial du général de Gaulle, le grand lac du Der et sa tradition métallurgique. Chaumont en est la préfecture.",
      "Le département est traversé par l'A5 (Paris-Langres) et l'A31 (Nancy-Dijon). Sur ces axes de transit nord-sud et est-ouest, comparer les prix entre aires d'autoroute et stations des villes est recommandé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Chaumont' },
      { label: 'Grands axes', value: 'A5 · A31' },
    ],
  },
  '53': {
    emblem: '/images/flags/departments/53.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Mayenne',
    nickname: 'Le bocage et la rivière Mayenne',
    paragraphs: [
      "Pays de bocage et d'élevage, la Mayenne séduit par sa rivière navigable, ses cités de caractère (Laval, Sainte-Suzanne) et son cadre paisible entre Bretagne et Normandie. Laval en est la préfecture.",
      "Le département est desservi par l'A81 (Le Mans-Rennes) et l'A88. Sur ces axes reliant l'ouest au Bassin parisien, comparer les prix entre stations d'autoroute et stations de Laval ou Mayenne permet souvent d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Laval' },
      { label: 'Grands axes', value: 'A81 · A88' },
    ],
  },
  '54': {
    emblem: '/images/flags/departments/54.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de Meurthe-et-Moselle",
    nickname: 'Nancy et le sillon lorrain',
    paragraphs: [
      "Avec la place Stanislas de Nancy, joyau du XVIIIe siècle classé à l'UNESCO, et un riche passé sidérurgique, la Meurthe-et-Moselle est un cœur historique de la Lorraine. Nancy en est la préfecture.",
      "Le département est structuré par l'A31 (le « sillon lorrain ») et l'A33. Sa proximité avec le Luxembourg, où le carburant est traditionnellement moins cher, pousse de nombreux frontaliers à comparer les prix avant de faire le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nancy' },
      { label: 'Grands axes', value: 'A31 · A33 · proximité Luxembourg' },
    ],
  },
  '55': {
    emblem: '/images/flags/departments/55.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Meuse',
    nickname: 'Verdun et la mémoire',
    paragraphs: [
      "Marquée à jamais par la bataille de Verdun, la Meuse est une terre de mémoire et de forêts, traversée par la rivière du même nom. Bar-le-Duc, à l'élégant quartier Renaissance, en est la préfecture.",
      "Le département est desservi par l'A4 (Paris-Strasbourg) et l'A34. Sur l'A4, l'un des grands axes est-ouest du pays, comparer les prix entre aires d'autoroute et stations des villes est un réflexe payant.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Bar-le-Duc' },
      { label: 'Grands axes', value: 'A4 · A34' },
    ],
  },
  '56': {
    emblem: '/images/flags/departments/56.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Morbihan',
    nickname: 'Le golfe et les mégalithes de Carnac',
    paragraphs: [
      "Autour de son golfe parsemé d'îles, le Morbihan rassemble les alignements mégalithiques de Carnac, la presqu'île de Quiberon, Vannes et le port de Lorient. Vannes en est la préfecture.",
      "Fidèle à la tradition bretonne, le département est desservi par la RN165, voie express gratuite longeant le littoral sud. L'afflux touristique estival vers le golfe et les plages rend utile la comparaison des prix entre la côte et l'intérieur.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Vannes' },
      { label: 'Grands axes', value: 'RN165 (gratuite)' },
    ],
  },
  '57': {
    emblem: '/images/flags/departments/57.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Moselle',
    nickname: 'Metz, l’Allemagne et le Luxembourg',
    paragraphs: [
      "Au carrefour de trois pays, la Moselle marie le patrimoine de Metz (cathédrale, Centre Pompidou-Metz), l'histoire sidérurgique et une forte culture transfrontalière. Metz en est la préfecture.",
      "Frontalier de l'Allemagne et du Luxembourg, le département compte de très nombreux travailleurs frontaliers. Structuré par l'A31, l'A4, l'A30 et l'A320, c'est une zone où la comparaison des prix de part et d'autre de la frontière est une habitude bien ancrée.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Metz' },
      { label: 'Grands axes', value: 'A31 · A4 · A30 · frontières' },
    ],
  },
  '58': {
    emblem: '/images/flags/departments/58.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Nièvre',
    nickname: 'Le Morvan et Magny-Cours',
    paragraphs: [
      "Entre les forêts du Morvan, les bords de Loire et le circuit de Nevers Magny-Cours, la Nièvre est une terre de nature et de sport automobile. Nevers, réputée pour sa faïence, en est la préfecture.",
      "Le département est desservi par l'A77 le long de la Loire et par la RN7 historique. Sur ces axes reliant le Bassin parisien au sud, comparer les prix entre stations de route et aires d'autoroute est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Nevers' },
      { label: 'Grands axes', value: 'A77 · RN7' },
    ],
  },
  '60': {
    emblem: '/images/flags/departments/60.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Oise",
    nickname: 'Chantilly, Compiègne et Senlis',
    paragraphs: [
      "Aux portes nord de Paris, l'Oise aligne le château et les grandes écuries de Chantilly, le palais de Compiègne, la cathédrale de Beauvais et les forêts royales. Beauvais en est la préfecture.",
      "Le département est traversé par l'A1 (Paris-Lille) et l'A16, axes très fréquentés, et accueille l'aéroport low-cost de Beauvais. Sur l'A1 notamment, comparer les prix entre aires d'autoroute et stations des villes permet de réelles économies.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Beauvais' },
      { label: 'Grands axes', value: 'A1 · A16' },
    ],
  },
  '61': {
    emblem: '/images/flags/departments/61.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Orne",
    nickname: 'Le Perche, les haras et le camembert',
    paragraphs: [
      "Terre d'élevage et de chevaux (haras national du Pin), l'Orne est aussi le pays du camembert, des collines du Perche et de la station thermale de Bagnoles-de-l'Orne. Alençon, réputée pour sa dentelle, en est la préfecture.",
      "Le département est desservi par l'A28 (Rouen-Le Mans) et l'A88. Dans ce territoire rural où les stations sont plus espacées qu'en ville, comparer les prix et anticiper son plein sont de bons réflexes.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Alençon' },
      { label: 'Grands axes', value: 'A28 · A88' },
    ],
  },
  '63': {
    emblem: '/images/flags/departments/63.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Puy-de-Dôme',
    nickname: 'La chaîne des Puys et Clermont',
    paragraphs: [
      "Dominé par la chaîne des Puys classée à l'UNESCO, le Puy-de-Dôme marie volcans, thermalisme et le dynamisme de Clermont-Ferrand, berceau de Michelin. Clermont-Ferrand en est la préfecture.",
      "Le département est un carrefour : l'A71 (vers Paris), l'A75 (qui démarre vers le Midi) et l'A89 (Bordeaux-Lyon) s'y rejoignent. Sur ces grands axes, comparer les prix entre aires d'autoroute et stations de l'agglomération clermontoise est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Clermont-Ferrand' },
      { label: 'Grands axes', value: 'A71 · A75 · A89' },
    ],
  },
  '64': {
    emblem: '/images/flags/departments/64.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Pyrénées-Atlantiques',
    nickname: 'Pays basque et Béarn',
    paragraphs: [
      "Entre l'océan et la montagne, les Pyrénées-Atlantiques réunissent le Pays basque (Biarritz, Bayonne, Saint-Jean-de-Luz) et le Béarn (Pau, vallées pyrénéennes). Pau en est la préfecture.",
      "Le département est desservi par l'A63 vers l'Espagne et l'A64 vers Toulouse. Frontalier de l'Espagne et très touristique l'été sur la côte basque, c'est une zone où comparer les prix (y compris de l'autre côté de la frontière) est particulièrement pertinent.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Pau' },
      { label: 'Grands axes', value: 'A63 · A64 · frontière espagnole' },
    ],
  },
  '65': {
    emblem: '/images/flags/departments/65.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Hautes-Pyrénées',
    nickname: 'Lourdes, le Tourmalet et Gavarnie',
    paragraphs: [
      "Hauts lieux des Pyrénées, les Hautes-Pyrénées rassemblent le sanctuaire de Lourdes, le col du Tourmalet, le Pic du Midi et le cirque de Gavarnie classé à l'UNESCO. Tarbes en est la préfecture.",
      "Le département est desservi par l'A64 (Pau-Toulouse) dans sa partie nord. Plus haut, les routes de cols et de stations de ski comptent peu de points de ravitaillement : comparer les prix et faire le plein avant de monter sont vivement conseillés.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Tarbes' },
      { label: 'Grands axes', value: 'A64 · cols pyrénéens' },
    ],
  },
  '66': {
    emblem: '/images/flags/departments/66.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Pyrénées-Orientales',
    nickname: 'La Catalogne française',
    paragraphs: [
      "Baignées de soleil, les Pyrénées-Orientales déroulent la Côte Vermeille (Collioure), le massif du Canigou, la Cerdagne et une forte identité catalane. Perpignan en est la préfecture.",
      "Le département est traversé par l'A9 « la Catalane », principal axe vers l'Espagne, très saturé l'été. La proximité de la frontière et l'afflux touristique rendent la comparaison des prix, des deux côtés de la frontière comme entre côte et intérieur, particulièrement utile.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Perpignan' },
      { label: 'Grands axes', value: 'A9 · frontière espagnole' },
    ],
  },
  '68': {
    emblem: '/images/flags/departments/68.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Haut-Rhin',
    nickname: 'Route des Vins et ballons des Vosges',
    paragraphs: [
      "Cœur de l'Alsace du sud, le Haut-Rhin marie la Route des Vins et ses villages fleuris, Colmar et sa Petite Venise, la cité industrielle de Mulhouse et les ballons des Vosges. Colmar en est la préfecture.",
      "Le département est desservi par l'A35 (le long du Rhin) et l'A36. Frontalier de l'Allemagne et de la Suisse, il voit de nombreux automobilistes comparer les prix des trois pays avant de faire le plein.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Colmar' },
      { label: 'Grands axes', value: 'A35 · A36 · frontières' },
    ],
  },
  '70': {
    emblem: '/images/flags/departments/70.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Saône',
    nickname: 'Vosges saônoises et villages thermaux',
    paragraphs: [
      "Département rural et verdoyant, la Haute-Saône offre les Vosges saônoises, les stations thermales de Luxeuil-les-Bains et un patrimoine discret entre plaine et collines. Vesoul en est la préfecture.",
      "Le département est desservi par les RN19 et RN57, et proche de l'A36. Dans ce territoire où les stations sont espacées, comparer les prix et anticiper son plein avant les zones plus isolées sont de bons réflexes.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Vesoul' },
      { label: 'Grands axes', value: 'RN19 · RN57 · A36 (à proximité)' },
    ],
  },
  '71': {
    emblem: '/images/flags/departments/71.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de Saône-et-Loire",
    nickname: 'Cluny, le Charolais et le Mâconnais',
    paragraphs: [
      "Vaste et variée, la Saône-et-Loire associe le vignoble du Mâconnais, l'abbaye de Cluny, le bœuf charolais et le passé industriel du Creusot. Mâcon en est la préfecture.",
      "Grand carrefour, le département voit se croiser l'A6 (Paris-Lyon), l'A40 vers les Alpes et la RCEA (N79/N80) vers l'Atlantique. Sur ces axes très fréquentés, comparer les prix entre aires d'autoroute et stations de Mâcon ou Chalon-sur-Saône est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Mâcon' },
      { label: 'Grands axes', value: 'A6 · A40 · RCEA' },
    ],
  },
  '72': {
    emblem: '/images/flags/departments/72.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Sarthe',
    nickname: 'Les 24 Heures du Mans',
    paragraphs: [
      "Mondialement connue pour les 24 Heures du Mans, la Sarthe associe l'automobile, la cité Plantagenêt du Mans, les rillettes et de paisibles vallées. Le Mans en est la préfecture.",
      "Le département est un carrefour de l'ouest : l'A11 (Paris-Nantes), l'A28 (Rouen-Tours) et l'A81 (vers Rennes) s'y croisent. Sur ces axes, l'écart de prix entre aires d'autoroute et stations de l'agglomération mancelle vaut la comparaison.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Le Mans' },
      { label: 'Grands axes', value: 'A11 · A28 · A81' },
    ],
  },
  '73': {
    emblem: '/images/flags/departments/73.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Savoie',
    nickname: 'Au pays des grandes stations de ski',
    paragraphs: [
      "Terre des plus grands domaines skiables du monde (Courchevel, Val Thorens, Les Arcs), la Savoie déroule la Tarentaise, la Maurienne et le lac du Bourget. Chambéry en est la préfecture.",
      "Le département est desservi par l'A43 et l'A41, qui mènent vers l'Italie et les vallées alpines. Lors des week-ends de vacances scolaires, le trafic vers les stations explose et les points de ravitaillement se raréfient en altitude : comparer les prix avant de monter est vivement conseillé.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Chambéry' },
      { label: 'Grands axes', value: 'A43 · A41 · A430' },
    ],
  },
  '74': {
    emblem: '/images/flags/departments/74.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Savoie',
    nickname: 'Du Mont-Blanc au lac d’Annecy',
    paragraphs: [
      "Entre le Mont-Blanc et Chamonix, le lac d'Annecy et les rives du Léman (Évian), la Haute-Savoie est un écrin alpin de renommée mondiale, été comme hiver. Annecy en est la préfecture.",
      "Le département est desservi par l'A40 (« l'Autoroute Blanche ») et l'A41. Frontalier de la Suisse, avec de nombreux travailleurs vers Genève, et très touristique, c'est une zone où comparer les prix (y compris côté suisse) et anticiper avant les stations d'altitude sont particulièrement utiles.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Annecy' },
      { label: 'Grands axes', value: 'A40 · A41 · proximité Genève' },
    ],
  },
  '76': {
    emblem: '/images/flags/departments/76.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Seine-Maritime',
    nickname: 'Rouen, Le Havre et les falaises d’Étretat',
    paragraphs: [
      "De la cité aux cent clochers de Rouen au grand port du Havre, en passant par les falaises d'Étretat et les stations de la Côte d'Albâtre, la Seine-Maritime conjugue patrimoine et littoral. Rouen en est la préfecture.",
      "Le département est desservi par l'A13 (vers Paris), l'A28, l'A29 et l'A150. Sur ces axes reliant la vallée de la Seine au littoral, comparer les prix entre aires d'autoroute et stations de Rouen ou du Havre est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Rouen' },
      { label: 'Grands axes', value: 'A13 · A28 · A29 · A150' },
    ],
  },
  '79': {
    emblem: '/images/flags/departments/79.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Deux-Sèvres',
    nickname: 'Le Marais poitevin, la Venise verte',
    paragraphs: [
      "Pays du Marais poitevin, la « Venise verte » sillonnée de canaux, les Deux-Sèvres associent nature préservée, élevage et le pôle des mutuelles de Niort. Niort en est la préfecture.",
      "Le département est desservi par l'A10 (Paris-Bordeaux) et l'A83 (Nantes-Niort). Sur ces axes de transit vers l'Atlantique, comparer les prix entre aires d'autoroute et stations de Niort ou Bressuire permet souvent d'économiser.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Niort' },
      { label: 'Grands axes', value: 'A10 · A83' },
    ],
  },
  '80': {
    emblem: '/images/flags/departments/80.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Somme',
    nickname: 'La baie de Somme et la mémoire',
    paragraphs: [
      "Entre la magnifique baie de Somme et ses phoques, la cathédrale d'Amiens (la plus vaste de France) et les sites de mémoire de la Grande Guerre, la Somme offre nature et histoire. Amiens en est la préfecture.",
      "Le département est traversé par l'A1 (Paris-Lille), l'A16 (littoral) et l'A29. Sur ces grands axes de transit international, comparer les prix entre aires d'autoroute et stations d'Amiens ou Abbeville est un réflexe payant.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Amiens' },
      { label: 'Grands axes', value: 'A1 · A16 · A29' },
    ],
  },
  '81': {
    emblem: '/images/flags/departments/81.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Tarn',
    nickname: 'Albi, Toulouse-Lautrec et le Sidobre',
    paragraphs: [
      "Dominé par la cité épiscopale d'Albi classée à l'UNESCO et son musée Toulouse-Lautrec, le Tarn déroule Cordes-sur-Ciel, les rochers du Sidobre et les Monts de Lacaune. Albi en est la préfecture.",
      "Le département est desservi par l'A68 vers Toulouse et reste proche de l'A75. Sur ces axes et sur les routes des Monts, comparer les prix entre stations d'autoroute et stations d'Albi ou Castres est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Albi' },
      { label: 'Grands axes', value: 'A68 · A75 (à proximité)' },
    ],
  },
  '82': {
    emblem: '/images/flags/departments/82.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de Tarn-et-Garonne",
    nickname: 'Montauban, Moissac et le chasselas',
    paragraphs: [
      "À la confluence du Tarn et de la Garonne, le Tarn-et-Garonne associe la ville rose de Montauban (patrie d'Ingres), l'abbaye de Moissac et le chasselas AOP. Montauban en est la préfecture.",
      "Le département est traversé par l'A62 (Bordeaux-Toulouse) et l'A20 (vers Paris). Sur ces grands axes du sud-ouest, comparer les prix entre aires d'autoroute et stations de Montauban ou Castelsarrasin est intéressant.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Montauban' },
      { label: 'Grands axes', value: 'A62 · A20' },
    ],
  },
  '84': {
    emblem: '/images/flags/departments/84.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Vaucluse',
    nickname: 'Avignon, le Ventoux et le Luberon',
    paragraphs: [
      "Cœur de la Provence, le Vaucluse réunit le palais des Papes d'Avignon, le mont Ventoux, les villages perchés du Luberon et le vignoble de Châteauneuf-du-Pape. Avignon en est la préfecture.",
      "Le département est desservi par l'A7 (« autoroute du soleil ») et proche de l'A9. Très touristique, surtout l'été lors du Festival d'Avignon et des séjours en Provence, c'est une zone où comparer les prix entre l'autoroute et l'arrière-pays est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Avignon' },
      { label: 'Grands axes', value: 'A7 · A9 (à proximité)' },
    ],
  },
  '86': {
    emblem: '/images/flags/departments/86.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Vienne',
    nickname: 'Poitiers et le Futuroscope',
    paragraphs: [
      "Connue pour le parc du Futuroscope et le remarquable art roman de Poitiers, la Vienne déroule vallées paisibles et patrimoine médiéval. Poitiers en est la préfecture.",
      "Le département est desservi par l'A10 (Paris-Bordeaux) et la RN10. Sur ces grands axes nord-sud très empruntés lors des vacances, comparer les prix entre aires d'autoroute et stations de Poitiers ou Châtellerault est un bon réflexe.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Poitiers' },
      { label: 'Grands axes', value: 'A10 · RN10 · RN147' },
    ],
  },
  '87': {
    emblem: '/images/flags/departments/87.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason de la Haute-Vienne',
    nickname: 'Limoges, la porcelaine et le Limousin',
    paragraphs: [
      "Capitale des arts du feu (porcelaine, émaux), Limoges rayonne sur la Haute-Vienne, terre de lacs, de monts du Limousin et de mémoire avec Oradour-sur-Glane. Limoges en est la préfecture.",
      "Le département est desservi par l'A20, autoroute gratuite reliant Vierzon à Toulouse, ainsi que par les RN141 et RN145. Sur ces axes de transit, comparer les prix entre stations de route et aires d'autoroute est avantageux.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Limoges' },
      { label: 'Grands axes', value: 'A20 (gratuite) · RN141 · RN145' },
    ],
  },
  '88': {
    emblem: '/images/flags/departments/88.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason des Vosges',
    nickname: 'Montagnes, thermalisme et Gérardmer',
    paragraphs: [
      "Pays du massif des Vosges, des eaux minérales (Vittel, Contrexéville) et de la station de Gérardmer, le département des Vosges allie nature, thermalisme et tradition (imagerie d'Épinal). Épinal en est la préfecture.",
      "Le département s'appuie sur les RN57 et RN66 et reste proche de l'A31. Sur les routes de montagne menant aux cols et aux stations, les points de ravitaillement se raréfient : comparer les prix et faire le plein avant de monter sont conseillés.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Épinal' },
      { label: 'Grands axes', value: 'RN57 · RN66 · A31 (à proximité)' },
    ],
  },
  '89': {
    emblem: '/images/flags/departments/89.svg',
    emblemType: 'blason',
    emblemCaption: "Blason de l'Yonne",
    nickname: 'Chablis, Vézelay et la Bourgogne du nord',
    paragraphs: [
      "Porte nord de la Bourgogne, l'Yonne réunit le vignoble de Chablis, la colline éternelle de Vézelay classée à l'UNESCO, Auxerre et Sens. Auxerre en est la préfecture.",
      "Le département est traversé par l'A6 (Paris-Lyon) et l'A19. Sur l'A6, l'un des axes les plus fréquentés lors des grands départs, comparer les prix entre aires d'autoroute et stations d'Auxerre ou Sens permet de réelles économies.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Auxerre' },
      { label: 'Grands axes', value: 'A6 · A19 · RN6' },
    ],
  },
  '90': {
    emblem: '/images/flags/departments/90.svg',
    emblemType: 'blason',
    emblemCaption: 'Blason du Territoire de Belfort',
    nickname: 'Le Lion de Belfort et la trouée',
    paragraphs: [
      "Plus petit département de France métropolitaine hors Île-de-France, le Territoire de Belfort est gardé par le célèbre Lion de Bartholdi et occupe la stratégique trouée de Belfort, entre Vosges et Jura. Belfort en est la préfecture, marquée par l'industrie (Alstom, General Electric).",
      "Compact et industriel, le département est desservi par l'A36 « La Comtoise ». Proche de la Suisse et de l'Allemagne, il s'inscrit dans une zone où la comparaison des prix de part et d'autre des frontières est courante.",
    ],
    facts: [
      { label: 'Préfecture', value: 'Belfort' },
      { label: 'Grands axes', value: 'A36' },
    ],
  },
};
