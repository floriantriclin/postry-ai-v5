import { generateWithGemini } from '../lib/gemini';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGemini() {
  console.log('Testing Gemini Phase 1 Generation...');
  
  const systemInstruction = `Tu es le moteur de calibration de postry.ai. Ta mission est de générer 6 questions binaires A/B pour identifier l'identité scripturale d'un utilisateur. Tu dois impérativement respecter les dimensions stylistiques du protocole ICE.`;
  
  const userPrompt = `ACTION : Génère 6 questions A/B de polarisation pour le thème : Intelligence Artificielle.

### RÉFÉRENTIEL DES DIMENSIONS (PHASE 1)

Q1 : POSTURE (Hiérarchie)
Q2 : TEMPÉRATURE (Émotion)
Q3 : DENSITÉ (Complexité)
Q4 : PRISME (Vision)
Q5 : CADENCE (Rythme)
Q6 : REGISTRE (Couleur)

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q1", "dimension": "POS", "option_A": "...", "option_B": "..."}, ...]`;

  try {
    const result = await generateWithGemini(systemInstruction, userPrompt);
    console.log('Gemini Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.length === 6) {
      console.log('✅ Success: Received 6 questions.');
    } else {
      console.log(`❌ Failure: Received ${result.length} questions instead of 6.`);
    }
  } catch (error) {
    console.error('❌ Error testing Gemini:', error);
  }
}

testGemini();
