import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const MAX_RADIUS_METERS = 50000; // 50km max for safety

function clampRadius(r: number) {
    if (!Number.isFinite(r) || r <= 0) return 5000;
    return Math.min(Math.max(500, Math.round(r)), MAX_RADIUS_METERS);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lat, lng } = req.query;
    let radius = Number(req.query.radius || 5000);
    const type = typeof req.query.type === 'string' ? req.query.type : 'restaurant';
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng parameters' });
    }

    if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Clamp radius to prevent accidental huge queries
        radius = clampRadius(radius);

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${encodeURIComponent(
            String(lat)
        )},${encodeURIComponent(String(lng))}&radius=${radius}&type=${encodeURIComponent(type)}&key=${GOOGLE_PLACES_API_KEY}${
            keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''
        }`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places error', data);
            throw new Error(data.error_message || 'Google Places API error');
        }

        // Transform data to be lighter for the app and limit results
        const places = (data.results || []).slice(0, 40).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            vicinity: place.vicinity,
            geometry: place.geometry,
            photos: place.photos ? place.photos.slice(0, 1).map((p: any) => p.photo_reference) : [],
            types: place.types || [],
            opening_hours: place.opening_hours,
        }));

        // Suggest caching on CDN / edge for short durations to reduce billing
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        return res.status(200).json({ places });
    } catch (error: any) {
        console.error('Proxy error:', error?.message || error);
        return res.status(500).json({ error: 'Failed to fetch places', details: error?.message || String(error) });
    }
}
