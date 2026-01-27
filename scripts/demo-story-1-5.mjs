
async function demo() {
  const BASE_URL = 'http://localhost:3000';
  const topic = 'Le Futur du Travail';

  console.log('--- Phase 1: Generation of Polarization Questions (6 questions) ---');
  
  const p1System = `Tu es le moteur de calibration de postry.ai. Ta mission est de générer 6 questions binaires A/B pour identifier l'identité scripturale d'un utilisateur. Tu dois impérativement respecter les dimensions stylistiques du protocole ICE.`;
  const p1User = `ACTION : Génère 6 questions A/B de polarisation pour le thème : ${topic}.

### RÉFÉRENTIEL DES DIMENSIONS (PHASE 1)

Q1 : POSTURE (Hiérarchie)
- Borne 0 (Humble/Pair) : Partage d'expérience, doute, 'Je', vulnérabilité. Ex: 'J'ai fait cette erreur au début.'
- Borne 100 (Guru/Vertical) : Affirmation, vérité générale, 'Vous', autorité. Ex: 'Voici la seule méthode qui fonctionne.'

Q2 : TEMPÉRATURE (Émotion)
- Borne 0 (Froid/Clinique) : Constat objectif, neutre, sans adjectif émotionnel. Ex: 'Le résultat est de 12%.'
- Borne 100 (Chaud/Viscéral) : Passion, exclamation, ressenti fort, tripes. Ex: 'C'est une victoire incroyable !'

Q3 : DENSITÉ (Complexité)
- Borne 0 (Simple/Vulgarisé) : Mots courants, analogies accessibles, zéro jargon. Ex: 'C'est comme un moteur de vélo.'
- Borne 100 (Expert/Technique) : Jargon précis, acronymes, niveau professionnel. Ex: 'L'architecture micro-services permet la scalabilité.'

Q4 : PRISME (Vision)
- Borne 0 (Optimiste/Opportunité) : Focus sur le positif, l'avenir, la solution. Ex: 'L'IA est une chance pour nous.'
- Borne 100 (Critique/Sceptique) : Focus sur le risque, le danger, la mise en garde. Ex: 'L'IA est une menace pour l'emploi.'

Q5 : CADENCE (Rythme)
- Borne 0 (Haché/Percutant) : Phrases très courtes. Sujet-Verbe-Point. Impact. Ex: 'C'est fait. On avance.'
- Borne 100 (Fluide/Lié) : Phrases longues, virgules, connecteurs, musicalité. Ex: 'Une fois la tâche finie, nous progressons sereinement.'

Q6 : REGISTRE (Couleur)
- Borne 0 (Sérieux/Pro) : Gravité, sobriété, premier degré, respect des codes. Ex: 'Il faut respecter les délais.'
- Borne 100 (Ludique/Décalé) : Humour, second degré, emojis, décalage. Ex: 'Houston, on a un (petit) problème 🚀.'

### CONSIGNES DE GÉNÉRATION
1. Reste strictement dans le thème : ${topic}.
2. Chaque paire A/B doit traiter du MÊME sujet thématique (ex: Q1 sur l'apprentissage, Q2 sur un résultat, etc.).
3. Les options doivent être claires, contrastées mais crédibles (pas de caricature grossière).
4. Longueur maximale par option : 15 mots.

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q1", "dimension": "POSTURE", "option_A": "...", "option_B": "..."}, ...]`;

  console.log('--- PROMPT SYSTEM (PHASE 1) ---');
  console.log(p1System);
  console.log('\n--- PROMPT USER (PHASE 1) ---');
  console.log(p1User);

  const phase1Payload = {
    phase: 1,
    topic: topic
  };
  
  try {
    const p1Response = await fetch(`${BASE_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phase1Payload)
    });
    
    if (!p1Response.ok) {
      const error = await p1Response.json();
      console.error('Error Phase 1:', error);
    } else {
      const p1Data = await p1Response.json();
      console.log('\n--- RESPONSE (PHASE 1) ---');
      console.log(JSON.stringify(p1Data, null, 2));
      
      console.log('\n\n--- Phase 2: Generation of Refinement Questions (5 questions) ---');
      
      const archetypeName = 'Le Mentor Bienveillant';
      const targetDimensions = ['STR', 'INF', 'ANC', 'TEM', 'REG'];
      const vectorObj = {
        "CAD": 50, "DEN": 0, "STR": 50, "POS": 20, "TEM": 80, "REG": 50, "INF": 50, "PRI": 30, "ANC": 70
      };

      const p2System = `Tu es le moteur de nuance de postry.ai. Ta mission est de générer 5 questions binaires d'affinage pour un utilisateur dont le profil de base est : ${archetypeName}.`;
      const p2User = `ACTION : Génère 5 questions A/B d'affinage pour le thème : ${topic}.

### RÉFÉRENTIEL COMPLET DES 9 DIMENSIONS (ICE PROTOCOL)

1. CADENCE (CAD) : 0 (Haché, impactant) vs 100 (Fluide, musical). Ex: 'C'est fait. On avance.' vs 'Une fois terminé, nous progressons.'
2. DENSITÉ (DEN) : 0 (Simple, vulgarisé) vs 100 (Expert, jargon). Ex: 'On change la roue.' vs 'On remplace l'unité pneumatique.'
3. STRUCTURE (STR) : 0 (Organique, flux libre) vs 100 (Logique, carré). Ex: 'Je pensais à ça...' vs 'Voici les 3 points :'
4. POSTURE (POS) : 0 (Humble, partage) vs 100 (Guru, autorité). Ex: 'J'apprends encore.' vs 'Faites comme ceci.'
5. TEMPÉRATURE (TEM) : 0 (Froid, clinique) vs 100 (Chaud, viscéral). Ex: 'Le CA monte de 5%.' vs 'Quelle fierté de voir ce résultat !'
6. REGISTRE (REG) : 0 (Sérieux, solennel) vs 100 (Ludique, décalé). Ex: 'C'est crucial.' vs 'Houston, petit souci 🚀.'
7. INFLEXION (INF) : 0 (Factuel, chiffres) vs 100 (Narratif, histoire). Ex: '50 inscrits hier.' vs 'Quand j'ai ouvert la liste, j'ai vu...'
8. PRISME (PRI) : 0 (Optimiste, opportunité) vs 100 (Critique, sceptique). Ex: 'L'IA est une chance.' vs 'Attention aux dérives de l'IA.'
9. ANCRAGE (ANC) : 0 (Abstrait, vision) vs 100 (Concret, pragmatique). Ex: 'Le futur est digital.' vs 'Installez cet outil.'

### CONTEXTE UTILISATEUR
- Archétype détecté : ${archetypeName}
- Vecteur actuel (V6) : ${JSON.stringify(vectorObj)}
- Dimensions à tester impérativement : ${targetDimensions.join(', ')}

### CONSIGNES DE GÉNÉRATION
1. Pour chaque dimension listée, génère une paire A/B. 
2. L'option A doit correspondre à la borne 0, l'option B à la borne 100.
3. **Nuance cruciale** : Ne sois pas caricatural. Les phrases doivent refléter le style de l'archétype ${archetypeName}. 
4. Chaque paire doit traiter d'un sujet différent lié au thème ${topic} pour éviter la répétition.
5. Longueur maximale par option : 15 mots.

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objects : [{"id": "Q7", "dimension": "...", "option_A": "...", "option_B": "..."}, ...]`;

      console.log('--- PROMPT SYSTEM (PHASE 2) ---');
      console.log(p2System);
      console.log('\n--- PROMPT USER (PHASE 2) ---');
      console.log(p2User);

      const phase2Payload = {
        phase: 2,
        topic: topic,
        context: {
          archetypeName: archetypeName,
          archetypeVector: [50, 0, 50, 20, 80, 50, 50, 30, 70],
          targetDimensions: targetDimensions
        }
      };
      
      const p2Response = await fetch(`${BASE_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phase2Payload)
      });
      
      if (!p2Response.ok) {
        const error = await p2Response.json();
        console.error('Error Phase 2:', error);
      } else {
        const p2Data = await p2Response.json();
        console.log('\n--- RESPONSE (PHASE 2) ---');
        console.log(JSON.stringify(p2Data, null, 2));
        
        console.log('\n✅ Demonstration completed successfully.');
      }
    }
  } catch (err) {
    console.error('Network error. Is the server running on http://localhost:3000 ?', err.message);
  }
}

demo();
