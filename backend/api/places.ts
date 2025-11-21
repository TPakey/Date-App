import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { lat, lng, radius = '5000', type = 'restaurant', keyword } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng parameters' });
    }

    if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}${keyword ? `&keyword=${keyword}` : ''}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(data.error_message || 'Google Places API error');
        }

        // Transform data to be lighter for the app
        const places = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            vicinity: place.vicinity,
            geometry: place.geometry,
            photos: place.photos ? place.photos.slice(0, 1).map((p: any) => p.photo_reference) : [],
            types: place.types,
            opening_hours: place.opening_hours,
        }));

        res.status(200).json({ places });
    } catch (error: any) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch places', details: error.message });
    }
}
