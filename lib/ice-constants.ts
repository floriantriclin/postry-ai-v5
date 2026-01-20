import { z } from 'zod';

/**
 * @file Contient toutes les constantes immuables du protocole ICE.
 * @description Ce fichier centralise les données fondamentales du modèle stylistique
 * pour garantir la cohérence à travers toute l'application.
 * Toute modification de ce fichier ne devrait intervenir qu'après une mise à jour
 * de la spécification 'docs/specs/ice_protocol.md'.
 */

// Section 1 : Le Méta-Modèle ($Vstyle$)

/**
 * Les 9 dimensions stylistiques orthogonales du modèle ICE.
 */
export const ICE_DIMENSIONS = {
  CAD: {
    code: 'CAD',
    name: 'CADENCE',
    description: 'Rythme et Respiration',
    bounds: {
      0: {
        label: 'Haché / Staccato',
        definition: "Phrases ultra-courtes (sujet-verbe-point). Suppression des connecteurs. Effet de percussion et d'urgence.",
        example: "C’est fait. On avance. Pas d’excuse.",
      },
      100: {
        label: 'Fluide / Legato',
        definition: "Phrases longues, subordonnées, usage riche de la ponctuation (virgules, point-virgules). Recherche de musicalité.",
        example: "Bien que le projet ait connu des heurts, nous avons finalement réussi, par un effort collectif soutenu, à franchir la ligne d'arrivée.",
      },
    },
  },
  DEN: {
    code: 'DEN',
    name: 'DENSITÉ',
    description: 'Complexité Lexicale',
    bounds: {
      0: {
        label: 'Vulgarisé / Simple',
        definition: 'Vocabulaire de base (niveau collège). Analogies quotidiennes. Zéro jargon technique.',
        example: "C'est comme changer une roue de voiture.",
      },
      100: {
        label: 'Expert / Technique',
        definition: "Terminologie précise, acronymes métier, concepts avancés supposant un lecteur initié.",
        example: "L'implémentation d'une architecture micro-services nécessite une orchestration Kubernetes optimisée.",
      },
    },
  },
  STR: {
    code: 'STR',
    name: 'STRUCTURE',
    description: 'Organisation de la Pensée',
    bounds: {
      0: {
        label: 'Organique / Flux',
        definition: "Style conversationnel. Digressions assumées. Pas de plan apparent (stream of consciousness).",
        example: "Je pensais à ça l'autre jour, et puis en marchant, je me suis dit que peut-être...",
      },
      100: {
        label: 'Logique / Carré',
        definition: "Plan visible. Listes à puces. Connecteurs logiques (D'abord, Ensuite, Enfin). Raisonnement déductif.",
        example: "Voici les 3 leviers de croissance : 1. Le SEO, 2. La Pub, 3. Le CRM.",
      },
    },
  },
  POS: {
    code: 'POS',
    name: 'POSTURE',
    description: 'Hiérarchie Sociale',
    bounds: {
      0: {
        label: 'Humble / Pair',
        definition: 'L\'auteur se met au même niveau. Partage d\'erreurs, utilisation du "Je", vulnérabilité.',
        example: "J'ai longtemps lutté avec ce problème avant de comprendre...",
      },
      100: {
        label: 'Guru / Vertical',
        definition: 'L\'auteur parle depuis une position d\'autorité. Injonctions ("Faites ceci"), vérité générale, utilisation du "Vous".',
        example: "Voici la seule méthode qui fonctionne. Arrêtez de perdre votre temps.",
      },
    },
  },
  TEM: {
    code: 'TEM',
    name: 'TEMPÉRATURE',
    description: 'Charge Émotionnelle',
    bounds: {
      0: {
        label: 'Froid / Clinique',
        definition: "Distanciation. Analyse factuelle. Absence d'adjectifs émotionnels. Ton journalistique ou scientifique.",
        example: "Les résultats indiquent une hausse de 12% des conversions.",
      },
      100: {
        label: 'Chaud / Viscéral',
        definition: "Passion, enthousiasme ou colère. Utilisation d'interjections et d'une ponctuation expressive (!, ?!).",
        example: "C'est une victoire monumentale ! On a enfin brisé le plafond de verre !",
      },
    },
  },
  REG: {
    code: 'REG',
    name: 'REGISTRE',
    description: 'Couleur et Esprit',
    bounds: {
      0: {
        label: 'Sérieux / Solennel',
        definition: 'Sobriété totale. Premier degré. Respect strict des codes professionnels traditionnels.',
        example: "L'intégrité de nos processus garantit la qualité de nos services.",
      },
      100: {
        label: 'Ludique / Décalé',
        definition: "Humour, ironie, sarcasme, références pop-culture, usage d'emojis. Ton \"cool\" ou provocateur.",
        example: "Spoiler alert : notre serveur a rendu l'âme. Oups 💀.",
      },
    },
  },
  INF: {
    code: 'INF',
    name: 'INFLEXION',
    description: 'Mode Narratif',
    bounds: {
      0: {
        label: 'Factuel / Reportage',
        definition: 'Focus sur les données, les dates, les chiffres. Description brute de la réalité.',
        example: "300 personnes étaient présentes au salon de l'immobilier à Paris.",
      },
      100: {
        label: 'Narratif / Storytelling',
        definition: "Mise en scène. Dramaturgie. Transformation d'une info en histoire avec héros et obstacles.",
        example: "Il était 8h, le café était froid, et mon écran affichait une erreur fatale. C'est là que l'aventure a commencé.",
      },
    },
  },
  PRI: {
    code: 'PRI',
    name: 'PRISME',
    description: 'Vision du Monde',
    bounds: {
      0: {
        label: 'Optimiste / Constructif',
        definition: 'Focus sur l\'opportunité, la solution, le progrès. "Le verre à moitié plein".',
        example: "Chaque crise est une occasion de se réinventer.",
      },
      100: {
        label: 'Critique / Sceptique',
        definition: 'Focus sur le risque, le piège, la dénonciation. "Le verre à moitié vide".',
        example: "Attention au mirage de l'IA, beaucoup vont y laisser des plumes.",
      },
    },
  },
  ANC: {
    code: 'ANC',
    name: 'ANCRAGE',
    description: "Niveau d'Abstraction",
    bounds: {
      0: {
        label: 'Abstrait / Conceptuel',
        definition: 'Théorie, vision, philosophie, systèmes globaux. Pourquoi on fait les choses.',
        example: "La transformation digitale est un changement de paradigme culturel.",
      },
      100: {
        label: 'Concret / Pragmatique',
        definition: 'Pratique, outils, actions immédiates, terrain. Comment on fait les choses.',
        example: "Installez cette extension Chrome et cliquez sur le bouton bleu.",
      },
    },
  },
} as const;

/**
 * Ordre des dimensions pour la construction du vecteur.
 * [CAD, DEN, STR, POS, TEM, REG, INF, PRI, ANC]
 */
export const ICE_VECTOR_ORDER: (keyof typeof ICE_DIMENSIONS)[] = [
  'CAD', 'DEN', 'STR', 'POS', 'TEM', 'REG', 'INF', 'PRI', 'ANC'
];

// Section 2 : La Matrice des 15 Archétypes

/**
 * Les 4 familles d'archétypes.
 */
export const ICE_ARCHETYPE_FAMILIES = {
  RATIONALS: 'LES RATIONNELS',
  EMOTIONALS: 'LES ÉMOTIONNELS',
  CREATIVES: 'LES CRÉATIFS',
  IMPACTS: 'LES IMPACTANTS',
} as const;

/**
 * La matrice complète des 16 archétypes avec leurs données de base.
 */
export const ICE_ARCHETYPES = {
  ENGINEER: {
    id: 1,
    name: "L'Ingénieur",
    family: ICE_ARCHETYPE_FAMILIES.RATIONALS,
    binarySignature: '001000',
    signature: 'Pragmatique & Sec',
    description: "Expert focalisé sur la résolution technique. Il utilise un jargon précis et une structure logique. Son écriture est dépourvue d'artifices, visant l'efficacité brute et la transmission de savoir-faire opérationnel sans fioritures marketing ni autorité surjouée.",
    baseVector: [30, 85, 80, 40, 20, 20, 20, 50, 90],
  },
  ARCHITECT: {
    id: 2,
    name: "L'Architecte",
    family: ICE_ARCHETYPE_FAMILIES.RATIONALS,
    binarySignature: '101010',
    signature: 'Visionnaire Systémique',
    description: "Penseur de haut niveau analysant les structures globales. Son ton est docte, utilisant un vocabulaire conceptuel pour dessiner les plans de l'avenir. Il privilégie la hauteur de vue, l'abstraction stratégique et une autorité froide et posée.",
    baseVector: [50, 75, 90, 70, 25, 20, 30, 50, 30],
  },
  STRATEGIST: {
    id: 3,
    name: 'Le Stratège',
    family: ICE_ARCHETYPE_FAMILIES.RATIONALS,
    binarySignature: '101100',
    signature: 'Décideur Tranchant',
    description: "Leader analytique évaluant les risques avec froideur. Son style est percutant, structuré pour la décision. Il utilise des faits denses pour asseoir une autorité naturelle et orienter l'action vers un objectif critique avec un scepticisme protecteur.",
    baseVector: [25, 65, 85, 85, 30, 15, 20, 60, 60],
  },
  ANALYST: {
    id: 4,
    name: "L'Analyste",
    family: ICE_ARCHETYPE_FAMILIES.RATIONALS,
    binarySignature: '001011',
    signature: 'Observateur Curieux',
    description: "Chercheur de vérité qui décortique les mécanismes complexes. Son ton est neutre et fluide, mais il s'autorise une pointe d'esprit (ludique) pour rendre les données digestes. Il lie les causes et effets avec une clarté pédagogique et objective.",
    baseVector: [70, 60, 75, 30, 30, 60, 40, 50, 70],
  },
  CONFIDANT: {
    id: 5,
    name: 'Le Confident',
    family: ICE_ARCHETYPE_FAMILIES.EMOTIONALS,
    binarySignature: '010010',
    signature: 'Doux & Inclusif',
    description: "Accompagnateur bienveillant créant un espace de sécurité. Son langage est simple, empathique et centré sur le ressenti. Il privilégie la proximité et le soutien, utilisant le \"je\" pour partager une humanité commune et rassurante, sans autorité verticale.",
    baseVector: [65, 30, 30, 20, 75, 30, 60, 40, 50],
  },
  MENTOR: {
    id: 6,
    name: 'Le Mentor',
    family: ICE_ARCHETYPE_FAMILIES.EMOTIONALS,
    binarySignature: '110010',
    signature: 'Sage & Bienveillant',
    description: "Figure d'autorité protectrice transmettant les leçons de l'expérience. Son style est fluide, parsemé de conseils avisés et de chaleur. Il guide son audience avec une assurance paternelle, transformant le savoir en sagesse de vie accessible et inspirante.",
    baseVector: [55, 45, 60, 70, 65, 25, 75, 30, 40],
  },
  SCATHED: {
    id: 7,
    name: "L'Écorché",
    family: ICE_ARCHETYPE_FAMILIES.EMOTIONALS,
    binarySignature: '010100',
    signature: 'Brut & Authentique',
    description: "Écrivain sans filtre exposant ses échecs avec une honnêteté radicale. Son style est haché, viscéral, fuyant les structures lisses. Il cherche une connexion profonde par le partage brut des épreuves, adoptant une posture de pair vulnérable et critique.",
    baseVector: [20, 25, 20, 25, 90, 15, 85, 60, 75],
  },
  TRIBUNE: {
    id: 8,
    name: 'Le Tribun',
    family: ICE_ARCHETYPE_FAMILIES.EMOTIONALS,
    binarySignature: '110000',
    signature: 'Charismatique & Vocal',
    description: "Leader passionné haranguant les foules pour défendre une vision. Son ton est épique et affirmatif. Il inspire l'action collective par un discours vibrant, orienté vers la mission et le combat, avec une énergie débordante et une autorité assumée.",
    baseVector: [45, 40, 50, 85, 85, 40, 70, 30, 30],
  },
  EXPLORER: {
    id: 9,
    name: "L'Explorateur",
    family: ICE_ARCHETYPE_FAMILIES.CREATIVES,
    binarySignature: '000011',
    signature: 'Curieux & Narratif',
    description: "Esprit libre voyageant à travers les idées de façon organique. Son style est fluide, ludique et humble. Il raconte ses découvertes avec enthousiasme, sans jargon d'expert, invitant le lecteur à explorer de nouveaux horizons avec une simplicité rafraîchissante.",
    baseVector: [80, 25, 30, 30, 60, 80, 85, 40, 50],
  },
  VISIONARY: {
    id: 10,
    name: 'Le Visionnaire',
    family: ICE_ARCHETYPE_FAMILIES.CREATIVES,
    binarySignature: '111011',
    signature: 'Futuriste & Tech',
    description: "Pionnier vendant le monde de demain avec une excitation contagieuse. Son style mélange expertise technique et lyrisme. Il utilise des images fortes pour dépeindre des ruptures technologiques avec autorité, orientant le regard vers des opportunités optimistes et grandioses.",
    baseVector: [70, 55, 55, 75, 75, 45, 60, 20, 25],
  },
  SATIRIST: {
    id: 12,
    name: 'Le Satirique',
    family: ICE_ARCHETYPE_FAMILIES.CREATIVES,
    binarySignature: '101111',
    signature: 'Ironique & Brillant',
    description: "Observateur cynique utilisant l'humour noir pour souligner les absurdités. Son style est expert, piquant et provocateur. Il manie l'ironie avec précision pour dire des vérités dérangeantes, adoptant une posture d'autorité intellectuelle qui déconstruit les conventions avec esprit.",
    baseVector: [65, 65, 60, 60, 45, 90, 40, 85, 60],
  },
  SNIPER: {
    id: 13,
    name: 'Le Sniper',
    family: ICE_ARCHETYPE_FAMILIES.IMPACTS,
    binarySignature: '100100',
    signature: 'Minimaliste & Clivant',
    description: "Provocateur utilisant des phrases courtes comme des impacts. Il va droit au but, élimine le superflu et polarise pour susciter une réaction. Son style est sec, froid, affirmatif et redoutablement efficace pour percer le bruit ambiant.",
    baseVector: [15, 30, 40, 85, 50, 30, 20, 75, 85],
  },
  MANIFESTO: {
    id: 14,
    name: 'Le Manifeste',
    family: ICE_ARCHETYPE_FAMILIES.IMPACTS,
    binarySignature: '111000',
    signature: 'Solennel & Puissant',
    description: "Auteur de déclarations d'intention denses et sérieuses. Son style est expert, structuré et très autoritaire. Il ne cherche pas à plaire mais à poser des piliers idéologiques et des vérités universelles avec une gravité professionnelle et optimiste.",
    baseVector: [40, 75, 90, 90, 30, 10, 30, 20, 40],
  },
  MOTIVATOR: {
    id: 15,
    name: 'Le Motivateur',
    family: ICE_ARCHETYPE_FAMILIES.IMPACTS,
    binarySignature: '110001',
    signature: 'Énergique & Coach',
    description: "Leader survolté misant sur l'énergie pure et le passage à l'action. Son langage est simple, parsemé d'exclamations et de décalages ludiques. Il cherche à briser l'inertie par un enthousiasme débordant et des mantras courts axés sur la réussite.",
    baseVector: [35, 20, 30, 70, 85, 60, 40, 20, 40],
  },
  CONTRARIAN: {
    id: 16,
    name: 'Le Contrarian',
    family: ICE_ARCHETYPE_FAMILIES.IMPACTS,
    binarySignature: '101101',
    signature: 'Rebelle & Brillant',
    description: "Intellectuel prenant systématiquement le contre-pied de la pensée dominante. Son style est dense, hautain et haché. Il utilise des paradoxes pour prouver sa supériorité analytique, défiant la majorité avec un scepticisme piquant et une autorité provocatrice.",
    baseVector: [45, 85, 70, 85, 40, 55, 30, 90, 65],
  },
} as const;


// Section 3 : Types et Schémas Zod

/**
 * Schémas Zod pour la validation runtime (Tech Stack Standard).
 */
export const vstyleSchema = z.array(z.number().min(0).max(100)).length(9);
export const binarySignatureSchema = z.string().regex(/^[01]{6}$/);

/**
 * Types TypeScript dérivés.
 */
export type Vstyle = number[];
export type BinarySignature = string;
export type DimensionCode = keyof typeof ICE_DIMENSIONS;

export interface Archetype {
  id: number;
  name: string;
  family: string;
  binarySignature: string;
  signature: string;
  description: string;
  baseVector: readonly number[];
}

// Section 4 : Logique du Quiz

/**
 * Séquence ordonnée des 6 dimensions discriminantes pour la Phase 1.
 * [POS, TEM, DEN, PRI, CAD, REG]
 */
export const ICE_PHASE1_DIMENSIONS_ORDER: (keyof typeof ICE_DIMENSIONS)[] = [
  'POS', 'TEM', 'DEN', 'PRI', 'CAD', 'REG'
];

/**
 * Constantes pour la logique d'affinage de la Phase 2.
 */
export const ICE_PHASE2_LOGIC = {
  /**
   * Les 3 dimensions incontournables à tester en priorité.
   */
  MANDATORY_DIMS: ['STR', 'INF', 'ANC'] as (keyof typeof ICE_DIMENSIONS)[],
  /**
   * La force d'attraction (k) de 30% vers la cible choisie.
   */
  ATTRACTION_FORCE: 0.3,
  /**
   * La valeur cible pour l'option A.
   */
  TARGET_A: 0,
  /**
   * La valeur cible pour l'option B.
   */
  TARGET_B: 100,
} as const;
