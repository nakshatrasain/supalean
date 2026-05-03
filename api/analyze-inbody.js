// api/analyze-inbody.js — Reads InBody scan photo and extracts all metrics

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: `This is an InBody body composition scan report. Extract ALL visible metrics and return ONLY valid JSON with no markdown, no backticks, no explanation:

{
  "weight": number or null,
  "body_fat_mass": number or null,
  "muscle_mass": number or null,
  "body_fat_percent": number or null,
  "visceral_fat_level": number or null,
  "bmi": number or null,
  "bmr": number or null,
  "waist_hip_ratio": number or null,
  "abdomen_cm": number or null,
  "inbody_score": number or null,
  "test_date": "string or null",
  "height": number or null,
  "age": number or null,
  "total_body_water": number or null,
  "protein_kg": number or null,
  "minerals_kg": number or null
}`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI error' });
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    try {
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, data: parsed });
    } catch {
      // Try to extract JSON if wrapped in anything
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ success: true, data: parsed });
      }
      return res.status(200).json({ success: false, rawText: text, error: 'Could not parse response as JSON' });
    }

  } catch (error) {
    console.error('InBody analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
