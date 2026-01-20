
async function demo() {
  const BASE_URL = 'http://localhost:3000';

  console.log('--- Phase 1: Archetype Calculation ---');
  const archetypePayload = {
    answers: {
      POS: 'A', // Humble
      TEM: 'B', // Chaud
      DEN: 'A', // Vulgarisé
      PRI: 'B', // Critique
      CAD: 'A', // Haché
      REG: 'B'  // Ludique
    }
  };
  
  console.log('Payload:', JSON.stringify(archetypePayload, null, 2));
  
  try {
    const archResponse = await fetch(`${BASE_URL}/api/quiz/archetype`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(archetypePayload)
    });
    
    if (!archResponse.ok) {
      const error = await archResponse.json();
      console.error('Error archetype:', error);
    } else {
      const archData = await archResponse.json();
      console.log('Response:', JSON.stringify(archData, null, 2));
      
      const currentVector = archData.archetype.baseVector;
      
      console.log('\n--- Phase 2: Vector Refinement ---');
      const refinePayload = {
        currentVector: currentVector,
        dimension: 'STR',
        answer: 'B' // Logique
      };
      
      console.log('Payload:', JSON.stringify(refinePayload, null, 2));
      
      const refineResponse = await fetch(`${BASE_URL}/api/quiz/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refinePayload)
      });
      
      if (!refineResponse.ok) {
        const error = await refineResponse.json();
        console.error('Error refine:', error);
      } else {
        const refineData = await refineResponse.json();
        console.log('Response:', JSON.stringify(refineData, null, 2));
        
        console.log('\nSummary:');
        console.log(`Initial Archetype: ${archData.archetype.name} (${archData.archetype.family})`);
        console.log(`Initial STR value: ${currentVector[2]}`); // STR is index 2 in ICE_VECTOR_ORDER
        console.log(`Refined STR value: ${refineData.newVector[2]} (after choosing B/Logique)`);
      }
    }
  } catch (err) {
    console.error('Network error. Is the server running on http://localhost:3000 ?', err.message);
  }
}

demo();
