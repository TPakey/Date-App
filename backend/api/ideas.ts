import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_PLACES_TO_SEND = 8;

function safePlacesForPrompt(places: any[]) {
    return places.slice(0, MAX_PLACES_TO_SEND).map((p: any) => ({
        id: p.place_id || p.id || null,
        name: p.name,
        types: p.types || [],
        price_level: typeof p.price_level === 'number' ? p.price_level : null,
        rating: typeof p.rating === 'number' ? p.rating : null,
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).send('OK');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { places, filters } = req.body || {};

    if (!places || !Array.isArray(places) || places.length === 0) {
        return res.status(400).json({ error: 'Missing places data' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const subset = safePlacesForPrompt(places);

        const systemPrompt = `You are a helpful assistant that returns a small JSON array (3-5 items) of creative, concise date ideas. Each item must be a JSON object with: title, description (1-2 sentences), placeIds (array of place ids), estimatedCost ($/$$/$$$), duration (short text). Return ONLY valid JSON (no markdown, no explanation).`;

        const userPrompt = `Filters: ${JSON.stringify(filters || {})}\nAvailable Places: ${JSON.stringify(subset)}`;

        const body = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 350,
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        const raw = data?.choices?.[0]?.message?.content || '';

        // Try to extract JSON robustly
        let jsonStr = raw.replace(/```json\n?|\n?```/g, '').trim();
        // If the assistant wrapped JSON inside backticks or text, attempt to find the first '[' and last ']'
        if (!jsonStr.startsWith('[')) {
            const first = jsonStr.indexOf('[');
            const last = jsonStr.lastIndexOf(']');
            if (first !== -1 && last !== -1 && last > first) {
                jsonStr = jsonStr.slice(first, last + 1);
            }
        }

        let ideas = [];
        try {
            ideas = JSON.parse(jsonStr);
        } catch (parseErr) {
            console.error('Failed to parse JSON from OpenAI response', parseErr, 'raw:', raw);
            return res.status(502).json({ error: 'Failed to parse AI response', details: raw });
        }

        // Optionally validate shape
        if (!Array.isArray(ideas)) {
            return res.status(502).json({ error: 'AI returned unexpected shape', details: ideas });
        }

        // Short cache headers
        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        return res.status(200).json({ ideas });
    } catch (error: any) {
        console.error('Proxy error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to generate ideas', details: error?.message || String(error) });
    }
}
