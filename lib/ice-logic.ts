import {
  ICE_ARCHETYPES,
  ICE_PHASE1_DIMENSIONS_ORDER,
  ICE_PHASE2_LOGIC,
  ICE_VECTOR_ORDER,
} from './ice-constants';
import {
  type Archetype,
  type BinarySignature,
  type DimensionCode,
  type Vstyle,
} from './types';

/**
 * Calcule la distance de Hamming entre deux chaînes binaires de même longueur.
 * @param s1 Première chaîne binaire
 * @param s2 Deuxième chaîne binaire
 * @returns Le nombre de positions où les bits sont différents
 */
function getHammingDistance(s1: string, s2: string): number {
  let distance = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] !== s2[i]) distance++;
  }
  return distance;
}

/**
 * Retourne l'archétype le plus proche d'une signature binaire donnée.
 * En cas d'égalité, le premier trouvé dans la liste est retourné.
 * 
 * @param userSignature Signature binaire de l'utilisateur (6 bits)
 * @returns L'archétype le plus proche
 */
export function getClosestArchetype(userSignature: BinarySignature): Archetype {
  const archetypes = Object.values(ICE_ARCHETYPES) as unknown as Archetype[];
  let closest = archetypes[0];
  let minDistance = getHammingDistance(userSignature, archetypes[0].binarySignature);

  for (let i = 1; i < archetypes.length; i++) {
    const dist = getHammingDistance(userSignature, archetypes[i].binarySignature);
    if (dist < minDistance) {
      minDistance = dist;
      closest = archetypes[i];
    }
    // Si dist === minDistance, on garde le premier trouvé (comportement déterministe)
  }

  return closest;
}

/**
 * Applique la formule d'affinage ICE pour une dimension donnée.
 * Vnouveau = Vactuel + (Cible - Vactuel) * 0.3
 * 
 * @param currentVector Le vecteur Vstyle actuel
 * @param dimension Le code de la dimension à mettre à jour
 * @param choice Le choix de l'utilisateur ('A' -> Cible 0, 'B' -> Cible 100)
 * @returns Un nouveau vecteur Vstyle mis à jour
 */
export function updateVector(
  currentVector: Vstyle,
  dimension: DimensionCode,
  choice: 'A' | 'B'
): Vstyle {
  const dimensionIndex = ICE_VECTOR_ORDER.indexOf(dimension);
  if (dimensionIndex === -1) {
    throw new Error(`Dimension invalide : ${dimension}`);
  }

  const target = choice === 'A' ? ICE_PHASE2_LOGIC.TARGET_A : ICE_PHASE2_LOGIC.TARGET_B;
  const currentValue = currentVector[dimensionIndex];
  
  const newValue = Math.round(
    currentValue + (target - currentValue) * ICE_PHASE2_LOGIC.ATTRACTION_FORCE
  );

  const newVector = [...currentVector] as Vstyle;
  newVector[dimensionIndex] = newValue;

  return newVector;
}

/**
 * Détermine les 5 dimensions à tester en Phase 2.
 * 1. Les 3 non-testées en Phase 1 (STR, INF, ANC).
 * 2. Les 2 dont la valeur est la plus proche de 50.
 * 3. Tie-breaking : Ordre d'apparition en Phase 1 (PHASE_1_ORDER).
 *
 * @param archetypeVector Le vecteur de base de l'archétype détecté
 * @returns Liste de 5 codes de dimensions à tester
 */
export function getTargetDimensions(archetypeVector: Vstyle): DimensionCode[] {
  // 1. Mandatory dimensions (non-testées en Phase 1)
  const result: DimensionCode[] = [...(ICE_PHASE2_LOGIC.MANDATORY_DIMS as DimensionCode[])];

  // 2. Trouver les 2 dimensions les plus "floues" parmi les 6 testées en Phase 1
  const phase1Dims = ICE_PHASE1_DIMENSIONS_ORDER;
  
  // Calculer les distances à 50 pour les dimensions de Phase 1
  const distances = phase1Dims.map(dim => {
    const index = ICE_VECTOR_ORDER.indexOf(dim);
    const value = archetypeVector[index];
    return {
      dim,
      distance: Math.abs(value - 50)
    };
  });

  // Trier par distance ascendante (plus proche de 50 d'abord)
  // En cas d'égalité, le tri natif de JS (stable depuis ES2019) préserve l'ordre initial (PHASE_1_ORDER)
  distances.sort((a, b) => a.distance - b.distance);

  // Prendre les deux premières
  result.push(distances[0].dim);
  result.push(distances[1].dim);

  return result;
}
