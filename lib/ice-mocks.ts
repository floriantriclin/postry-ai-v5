/**
 * @file Générateur de données mock pour le protocole ICE.
 * @description Ce fichier fournit des fonctions pour simuler les réponses de l'API
 * et les états de données dynamiques du quiz ICE. Essentiel pour le développement
 * et les tests du front-end sans dépendre des appels réels à Gemini.
 */

import {
  ICE_DIMENSIONS,
  ICE_PHASE1_DIMENSIONS_ORDER,
  ICE_ARCHETYPES,
} from './ice-constants';

// Tipos de datos para las preguntas y el perfil, para asegurar la coherencia
export type IceQuestion = {
  id: string;
  dimension: keyof typeof ICE_DIMENSIONS;
  option_A: string;
  option_B: string;
};

export type AugmentedProfile = {
  label_final: string;
  definition_longue: string;
};

/**
 * Génère un ensemble de 6 questions mock pour la Phase 1.
 * @param theme - Le thème choisi par l'utilisateur, pour rendre les questions plus pertinentes.
 * @returns Un tableau de 6 objets questions.
 */
export const generatePhase1Mocks = (theme: string): IceQuestion[] => {
  return ICE_PHASE1_DIMENSIONS_ORDER.map((dim, index) => {
    const dimensionInfo = ICE_DIMENSIONS[dim];
    return {
      id: `Q${index + 1}`,
      dimension: dim,
      option_A: `Option A pour ${dim} sur le thème "${theme}" (${dimensionInfo.bounds[0]})`,
      option_B: `Option B pour ${dim} sur le thème "${theme}" (${dimensionInfo.bounds[100]})`,
    };
  });
};

/**
 * Génère un ensemble de 5 questions mock pour la Phase 2.
 * @param theme - Le thème choisi.
 * @param targetDimensions - Les 5 dimensions spécifiques à tester.
 * @returns Un tableau de 5 objets questions.
 */
export const generatePhase2Mocks = (
  theme: string,
  targetDimensions: (keyof typeof ICE_DIMENSIONS)[]
): IceQuestion[] => {
  if (targetDimensions.length !== 5) {
    console.warn('generatePhase2Mocks attend un tableau de 5 dimensions cibles.');
    return [];
  }
  return targetDimensions.map((dim, index) => {
    const dimensionInfo = ICE_DIMENSIONS[dim];
    return {
      id: `Q${index + 7}`,
      dimension: dim,
      option_A: `Option A nuancée pour ${dim} sur "${theme}" (${dimensionInfo.bounds[0]})`,
      option_B: `Option B nuancée pour ${dim} sur "${theme}" (${dimensionInfo.bounds[100]})`,
    };
  });
};

/**
 * Simule la détection d'un archétype basé sur des réponses.
 * Pour ce mock, nous retournons simplement un archétype au hasard.
 * @returns Un archétype mock.
 */
export const mockDetectArchetype = () => {
  const archetypes = Object.values(ICE_ARCHETYPES);
  const randomIndex = Math.floor(Math.random() * archetypes.length);
  return archetypes[randomIndex];
};

/**
 * Génère un profil augmenté mock.
 * @param baseArchetype - L'archétype de base détecté.
 * @returns Un objet de profil augmenté.
 */
export const generateAugmentedProfileMock = (
  baseArchetype: typeof ICE_ARCHETYPES[keyof typeof ICE_ARCHETYPES]
): AugmentedProfile => {
  const adjectives = ['Intuitif', 'Radical', 'Lumineux', 'Pragmatique', 'Vibrant'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  return {
    label_final: `${baseArchetype.name} ${randomAdjective}`,
    definition_longue: `Ceci est une définition mock de 50 à 60 mots qui explique la force unique de ce mélange stylistique. Elle valorise la manière dont vous équilibrez votre côté ${baseArchetype.family} et votre nuance ${randomAdjective} pour impacter brillamment votre audience.`,
  };
};

// --- Exemple d'utilisation ---

/**
 * Génère un jeu de données complet pour un parcours de quiz.
 */
export const generateFullQuizMocks = (theme: string) => {
  // 1. Génération des questions de la Phase 1
  const phase1Questions = generatePhase1Mocks(theme);

  // 2. Simulation de la détection d'un archétype
  const detectedArchetype = mockDetectArchetype();

  // 3. Simulation de la sélection des dimensions pour la Phase 2
  // (Pour le mock, on prend les 3 obligatoires + 2 au hasard)
  const mandatoryDims: (keyof typeof ICE_DIMENSIONS)[] = ['STR', 'INF', 'ANC'];
  const remainingDims = ICE_PHASE1_DIMENSIONS_ORDER.filter(d => !mandatoryDims.includes(d));
  const phase2TargetDims: (keyof typeof ICE_DIMENSIONS)[] = [
    ...mandatoryDims,
    remainingDims[0],
    remainingDims[1],
  ];

  // 4. Génération des questions de la Phase 2
  const phase2Questions = generatePhase2Mocks(theme, phase2TargetDims);

  // 5. Génération du profil final
  const finalProfile = generateAugmentedProfileMock(detectedArchetype);

  return {
    theme,
    phase1Questions,
    detectedArchetype,
    phase2Questions,
    finalProfile,
  };
};
