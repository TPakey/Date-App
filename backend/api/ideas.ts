import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { places, filters } = req.body;

    if (!places || !Array.isArray(places) || places.length === 0) {
        return res.status(400).json({ error: 'Missing places data' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const prompt = `
      Generate 3-5 creative date ideas based on these places and filters:
      
      Filters: ${JSON.stringify(filters)}
      
      Available Places (subset):
      ${JSON.stringify(places.slice(0, 10).map((p: any) => ({ name: p.name, type: p.types, price: p.price_level })))}
      
      Return ONLY a JSON array with this structure:
      [
        {
          "title": "Short catchy title",
          "description": "1-2 sentences describing the date flow",
          "placeIds": ["id of place 1", "id of place 2"],
          "estimatedCost": "$$",
          "duration": "2 hours"
        }
      ]
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON from content (handle potential markdown code blocks)
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        const ideas = JSON.parse(jsonStr);

        res.status(200).json({ ideas });
    } catch (error: any) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to generate ideas', details: error.message });
    }
}
