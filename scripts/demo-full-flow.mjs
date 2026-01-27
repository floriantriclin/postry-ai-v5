
async function demo() {
  const BASE_URL = 'http://localhost:3000';
  const topic = 'Le Futur de l\'IA Générative';

  console.log('=== FULL QUIZ FLOW DEMO (Story 5 & 6) ===\n');

  // --- STEP 1: GENERATE PHASE 1 QUESTIONS ---
  console.log('--- Step 1: Generating Phase 1 Questions (Polarization) ---');
  const p1Payload = { phase: 1, topic: topic };
  
  const p1Response = await fetch(`${BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p1Payload)
  });

  if (!p1Response.ok) {
    throw new Error(`Phase 1 generation failed: ${await p1Response.text()}`);
  }

  const p1Questions = await p1Response.json();
  console.log(`Successfully generated ${p1Questions.length} questions.`);
  p1Questions.forEach(q => {
    console.log(`[${q.id}] ${q.dimension}: A) ${q.option_A.substring(0, 30)}... VS B) ${q.option_B.substring(0, 30)}...`);
  });

  // --- STEP 2: SIMULATE ANSWERS & CALCULATE ARCHETYPE ---
  console.log('\n--- Step 2: Simulating Answers & Calculating Archetype ---');
  // We'll simulate a "Humble/Chaud/Simple/Optimiste/Haché/Ludique" profile (mostly A except REG)
  const simulatedP1Answers = {
    POS: 'A', // Humble
    TEM: 'B', // Chaud
    DEN: 'A', // Simple
    PRI: 'A', // Optimiste
    CAD: 'A', // Haché
    REG: 'B'  // Ludique
  };

  const archResponse = await fetch(`${BASE_URL}/api/quiz/archetype`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: simulatedP1Answers })
  });

  if (!archResponse.ok) {
    throw new Error(`Archetype calculation failed: ${await archResponse.text()}`);
  }

  const archData = await archResponse.json();
  const archetype = archData.archetype;
  const targetDimensions = archData.targetDimensions;
  let currentVector = [...archetype.baseVector];

  console.log(`Detected Archetype: ${archetype.name} (${archetype.family})`);
  console.log(`Target Dimensions for Phase 2: ${targetDimensions.join(', ')}`);
  console.log(`Base Vector: [${currentVector.join(', ')}]`);

  // --- STEP 3: GENERATE PHASE 2 QUESTIONS ---
  console.log('\n--- Step 3: Generating Phase 2 Questions (Refinement) ---');
  
  const p2Payload = {
    phase: 2,
    topic: topic,
    context: {
      archetypeName: archetype.name,
      archetypeVector: currentVector,
      targetDimensions: targetDimensions
    }
  };

  const p2Response = await fetch(`${BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p2Payload)
  });

  if (!p2Response.ok) {
    throw new Error(`Phase 2 generation failed: ${await p2Response.text()}`);
  }

  const p2Questions = await p2Response.json();
  console.log(`Successfully generated ${p2Questions.length} refinement questions.`);

  // --- STEP 4: PROGRESSIVE REFINEMENT ---
  console.log('\n--- Step 4: Simulating Refinement Answers (One by one) ---');
  
  // Dimensions order: ['CAD', 'DEN', 'STR', 'POS', 'TEM', 'REG', 'INF', 'PRI', 'ANC']
  const dimToIndex = {
    'CAD': 0, 'DEN': 1, 'STR': 2, 'POS': 3, 'TEM': 4, 'REG': 5, 'INF': 6, 'PRI': 7, 'ANC': 8
  };

  const nameToCode = {
    'CADENCE': 'CAD',
    'DENSITÉ': 'DEN',
    'STRUCTURE': 'STR',
    'POSTURE': 'POS',
    'TEMPÉRATURE': 'TEM',
    'REGISTRE': 'REG',
    'INFLEXION': 'INF',
    'PRISME': 'PRI',
    'ANCRAGE': 'ANC'
  };

  for (const q of p2Questions) {
    let dim = q.dimension;
    // Map name to code if necessary (LLM might return the full name)
    const dimCode = nameToCode[dim] || dim;
    
    const answer = Math.random() > 0.5 ? 'A' : 'B'; // Random choice for demo
    
    console.log(`\nRefining ${dim} (${dimCode}):`);
    console.log(`Q: ${q.option_A.substring(0, 30)}... OR ${q.option_B.substring(0, 30)}...`);
    console.log(`User chose: ${answer}`);

    const refineResponse = await fetch(`${BASE_URL}/api/quiz/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentVector: currentVector,
        dimension: dimCode,
        answer: answer
      })
    });

    if (!refineResponse.ok) {
        console.error(`Refinement failed for ${dim} (${dimCode}): ${await refineResponse.text()}`);
        continue;
    }

    const refineData = await refineResponse.json();
    const oldVal = currentVector[dimToIndex[dimCode]];
    const newVal = refineData.newVector[dimToIndex[dimCode]];
    
    console.log(`Value for ${dimCode} moved from ${oldVal} to ${newVal}`);
    currentVector = refineData.newVector;
  }

  console.log('\n--- FINAL RESULT ---');
  console.log(`Archetype: ${archetype.name}`);
  console.log(`Final Vector: [${currentVector.join(', ')}]`);
  console.log('\n✅ Full Flow Demo Completed.');
}

demo().catch(err => {
  console.error('ERROR during demo:', err.message);
  process.exit(1);
});
