// api/analyze-meal.js — AI meal analysis with optional photo
// Handles both text descriptions and image uploads

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, imageBase64, userProfile } = req.body;

  if (!description && !imageBase64) {
    return res.status(400).json({ error: 'description or imageBase64 required' });
  }

  const content = [];

  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
    });
  }

  const profileContext = userProfile
    ? `User profile: weight ${userProfile.weight}kg, target ${userProfile.target_weight}kg, visceral fat level ${userProfile.visceral_fat_level || 'unknown'} (normal is 1-9, theirs is dangerously high). Daily protein target: ${userProfile.daily_protein_target || 130}g.`
    : '';

  content.push({
    type: 'text',
    text: `Analyse this meal${description ? ': ' + description : ' from the image'}.
${profileContext}

Return EXACTLY this format (no extra text):
**Meal:** [name]
**Calories:** [number] kcal
**Protein:** [number]g
**Carbs:** [number]g
**Fat:** [number]g
**Rating:** [X/10]
**Coach note:** [1 strict but helpful sentence — reference their visceral fat and protein targets]`
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [{ role: 'user', content }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI error' });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Parse numbers from response
    const calMatch = text.match(/Calories[:\s]+(\d+)/i);
    const protMatch = text.match(/Protein[:\s]+(\d+)/i);
    const carbsMatch = text.match(/Carbs[:\s]+(\d+)/i);
    const fatMatch = text.match(/Fat[:\s]+(\d+)/i);

    return res.status(200).json({
      text,
      parsed: {
        calories: calMatch ? parseInt(calMatch[1]) : null,
        protein: protMatch ? parseInt(protMatch[1]) : null,
        carbs: carbsMatch ? parseInt(carbsMatch[1]) : null,
        fat: fatMatch ? parseInt(fatMatch[1]) : null
      }
    });

  } catch (error) {
    console.error('Meal analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
