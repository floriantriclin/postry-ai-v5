async function testProfileAPI() {
  console.log("Starting API Test: /api/quiz/profile");
  
  const payload = {
    baseArchetype: "Le Stratège",
    finalVector: [25, 65, 85, 85, 90, 15, 85, 60, 60], 
    // Drift: Heat (TEM) 30 -> 90, Storytelling (INF) 20 -> 85
  };

  const start = Date.now();
  try {
    const response = await fetch('http://localhost:3000/api/quiz/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': 'demo-profile-1-7'
      },
      body: JSON.stringify(payload)
    });

    const duration = (Date.now() - start) / 1000;
    console.log(`Response Time: ${duration.toFixed(2)}s`);

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error:", error);
      return;
    }

    const data = await response.json();
    console.log("Synthesized Profile:");
    console.log(JSON.stringify(data, null, 2));

    const wordCount = data.definition_longue.split(/\s+/).filter(Boolean).length;
    console.log(`Word Count: ${wordCount}`);

    if (duration < 12) {
      console.log("✅ Performance Target Met (< 12s)");
    } else {
      console.warn("⚠️ Performance Target Exceeded (> 12s)");
    }

    if (wordCount >= 45 && wordCount <= 75) {
      console.log("✅ Word Count Target Met (45-75)");
    } else {
      console.warn("⚠️ Word Count Target Not Met");
    }

  } catch (error) {
    console.error("Fatal Error during fetch:", error.message);
  }
}

testProfileAPI();
