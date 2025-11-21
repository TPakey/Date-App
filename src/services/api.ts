import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Toggle mock/offline mode here. When true, the app will NEVER call network APIs.
const USE_MOCK_API = true;

// API URL resolution order (kept for future real-backend usage):
// 1. `Constants.expoConfig.extra.API_URL` (recommended via app config / EAS)
// 2. `process.env.EXPO_PUBLIC_API_URL` (if using env replacement)
// 3. fallback placeholder
const API_URL =
    (Constants?.expoConfig as any)?.extra?.API_URL ||
    process.env?.EXPO_PUBLIC_API_URL ||
    '';

export interface Place {
    id: string;
    name: string;
    rating: number;
    user_ratings_total: number;
    price_level?: number;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos: string[];
    types: string[];
    opening_hours?: {
        open_now: boolean;
    };
}

// Mock data for offline mode: centered around Berlin (52.5200, 13.4050)
const MOCK_PLACES: Place[] = [
    {
        id: 'ber-1',
        name: 'Café Himmel',
        rating: 4.6,
        user_ratings_total: 210,
        price_level: 1,
        vicinity: 'Mitte, Berlin',
        geometry: { location: { lat: 52.5208, lng: 13.4045 } },
        photos: [],
        types: ['cafe', 'food'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-2',
        name: 'Riverside Walkway',
        rating: 4.8,
        user_ratings_total: 150,
        price_level: 0,
        vicinity: 'Spreeufer, Berlin',
        geometry: { location: { lat: 52.5189, lng: 13.4062 } },
        photos: [],
        types: ['park', 'walk', 'nature'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-3',
        name: 'Brauhaus 21',
        rating: 4.4,
        user_ratings_total: 320,
        price_level: 2,
        vicinity: 'Kreuzberg, Berlin',
        geometry: { location: { lat: 52.5195, lng: 13.4010 } },
        photos: [],
        types: ['bar', 'restaurant'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-4',
        name: 'Skyview Terrace',
        rating: 4.7,
        user_ratings_total: 90,
        price_level: 3,
        vicinity: 'Alexanderplatz, Berlin',
        geometry: { location: { lat: 52.5215, lng: 13.4095 } },
        photos: [],
        types: ['viewpoint', 'tourist_attraction'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-5',
        name: 'Urban Climb Center',
        rating: 4.3,
        user_ratings_total: 60,
        price_level: 2,
        vicinity: 'Prenzlauer Berg, Berlin',
        geometry: { location: { lat: 52.5250, lng: 13.4120 } },
        photos: [],
        types: ['activity', 'indoor'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-6',
        name: 'Gallery Moderne',
        rating: 4.5,
        user_ratings_total: 240,
        price_level: 2,
        vicinity: 'Mitte, Berlin',
        geometry: { location: { lat: 52.5179, lng: 13.4033 } },
        photos: [],
        types: ['museum', 'culture'],
        opening_hours: { open_now: false },
    },
    {
        id: 'ber-7',
        name: 'Sweet Treats',
        rating: 4.2,
        user_ratings_total: 80,
        price_level: 1,
        vicinity: 'Kreuzberg, Berlin',
        geometry: { location: { lat: 52.5180, lng: 13.4078 } },
        photos: [],
        types: ['bakery', 'food'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-8',
        name: 'Green Meadow Park',
        rating: 4.7,
        user_ratings_total: 410,
        price_level: 0,
        vicinity: 'Tiergarten, Berlin',
        geometry: { location: { lat: 52.5145, lng: 13.3501 } },
        photos: [],
        types: ['park', 'nature', 'walk'],
        opening_hours: { open_now: true },
    },
    {
        id: 'ber-9',
        name: 'Indie Theater',
        rating: 4.1,
        user_ratings_total: 55,
        price_level: 2,
        vicinity: 'Friedrichshain, Berlin',
        geometry: { location: { lat: 52.5201, lng: 13.4260 } },
        photos: [],
        types: ['theater', 'culture', 'indoor'],
        opening_hours: { open_now: false },
    },
    {
        id: 'ber-10',
        name: 'Evening Jazz Club',
        rating: 4.6,
        user_ratings_total: 180,
        price_level: 3,
        vicinity: 'Mitte, Berlin',
        geometry: { location: { lat: 52.5222, lng: 13.4048 } },
        photos: [],
        types: ['music', 'bar', 'indoor'],
        opening_hours: { open_now: true },
    },
];

export const fetchPlaces = async (lat: number, lng: number, radius: number = 5000, type: string = 'restaurant'): Promise<Place[]> => {
    // Simple in-memory cache to reduce duplicate requests during a session
    try {
        const useMock = USE_MOCK_API || !API_URL || API_URL === '' || API_URL.includes('your-vercel-project');
        const round = (v: number) => Math.round(v * 1000) / 1000; // ~100m precision
        const key = `${round(lat)}|${round(lng)}|${radius}|${type}`;

        // initialize cache map on module
        (fetchPlaces as any)._cache = (fetchPlaces as any)._cache || new Map<string, { ts: number; data: Place[] }>();
        const cache: Map<string, { ts: number; data: Place[] }> = (fetchPlaces as any)._cache;
        const TTL = 60 * 1000; // 60 seconds

        const now = Date.now();
        const entry = cache.get(key);
        if (entry && now - entry.ts < TTL) {
            return entry.data;
        }

        if (useMock) {
            // Offline mock filtering logic (no network calls)
            console.log('MOCK MODE: fetchPlaces filtering locally');
            await new Promise(resolve => setTimeout(resolve, 200));

            // convert radius param (meters) to km
            const radiusKm = Math.max(0.1, radius / 1000);

            // haversine distance
            const toRad = (v: number) => v * Math.PI / 180;
            const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 6371; // km
                const dLat = toRad(lat2 - lat1);
                const dLon = toRad(lon2 - lon1);
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                return R * c;
            };

            // Basic filter by type and distance
            const filtered = MOCK_PLACES.filter(p => {
                const d = distanceKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng);
                if (d > radiusKm) return false;
                if (type && type !== 'point_of_interest') {
                    // treat type as a keyword: match if any of p.types includes type or vice versa
                    const t = type.toLowerCase();
                    const has = (p.types || []).some((pt: string) => pt.toLowerCase().includes(t) || t.includes(pt.toLowerCase()));
                    if (!has) return false;
                }
                return true;
            });

            cache.set(key, { ts: Date.now(), data: filtered });
            return filtered;
        }

        const url = `${API_URL}/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`;
        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Network response was not ok: ${response.status} ${text}`);
        }
        const data = await response.json();
        const places = data.places || [];
        cache.set(key, { ts: Date.now(), data: places });
        return places;
    } catch (error) {
        console.error('Error fetching places:', error);
        // If we're using a real backend, bubble up the error so the UI can show a message.
        if (!API_URL.includes('your-vercel-project')) throw error;
        // Otherwise (mock mode) return mocked places so dev continues smoothly
        return MOCK_PLACES;
    }
};

export const generateDateIdeas = async (places: Place[], filters: any) => {
    // Lightweight in-memory cache to avoid duplicate AI calls in a short window
    (generateDateIdeas as any)._cache = (generateDateIdeas as any)._cache || new Map<string, { ts: number; data: any[] }>();
    const cache: Map<string, { ts: number; data: any[] }> = (generateDateIdeas as any)._cache;
    const key = JSON.stringify({ ids: places.map(p => p.id).slice(0, 10), filters });
    const now = Date.now();
    const TTL = 60 * 1000; // 60 seconds
    const entry = cache.get(key);
    if (entry && now - entry.ts < TTL) return entry.data;

    try {
        const useMock = USE_MOCK_API || !API_URL || API_URL === '' || API_URL.includes('your-vercel-project');
        if (useMock) {
            // Offline mock idea generation: pick 3 ideas based on filters and places
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
                const pool = (places && places.length > 0) ? places : MOCK_PLACES;
                const pick = (arr: any[], n: number) => {
                    const res: any[] = [];
                    for (let i = 0; i < Math.min(n, arr.length); i++) res.push(arr[i]);
                    return res;
                };

                // Derive intensity from mood/duration
                const mood = (filters && filters.mood) ? String(filters.mood).toLowerCase() : '';
                const duration = (filters && filters.duration) ? String(filters.duration).toLowerCase() : '';

                const ideas: any[] = [];
                // Idea 1: food + walk
                const food = pool.find((p: any) => (p.types || []).some((t: string) => t.includes('food') || t.includes('cafe') || t.includes('bakery') || t.includes('restaurant')));
                const walk = pool.find((p: any) => (p.types || []).some((t: string) => t.includes('park') || t.includes('walk') || t.includes('viewpoint')));
                if (food && walk) {
                    ideas.push({
                        id: 'idea-1',
                        title: `Dessert & Stroll at ${food.name}`,
                        placeIds: [food.id, walk.id],
                        description: `Start with a sweet treat at ${food.name}, then enjoy a relaxing walk at ${walk.name}. Perfect for a ${mood || 'chill'} mood.`,
                        estimatedDuration: duration || '1-2 hours',
                        estimatedBudget: filters && filters.budget ? filters.budget : (food.price_level >= 3 ? '$$$' : '$$'),
                        intensity: mood === 'active' ? 'active' : 'chill',
                    });
                }

                // Idea 2: culture
                const culture = pool.find((p: any) => (p.types || []).some((t: string) => t.includes('museum') || t.includes('culture') || t.includes('theater')));
                if (culture) {
                    ideas.push({
                        id: 'idea-2',
                        title: `Explore ${culture.name}`,
                        placeIds: [culture.id],
                        description: `Spend time at ${culture.name} and grab a coffee afterwards nearby. A nice option for ${mood || 'curious'} dates.`,
                        estimatedDuration: '1-2 hours',
                        estimatedBudget: filters && filters.budget ? filters.budget : '$$',
                        intensity: 'normal',
                    });
                }

                // Idea 3: activity
                const activity = pool.find((p: any) => (p.types || []).some((t: string) => t.includes('activity') || t.includes('indoor') || t.includes('music') || t.includes('bar')));
                if (activity) {
                    ideas.push({
                        id: 'idea-3',
                        title: `${activity.name} Night`,
                        placeIds: [activity.id],
                        description: `Try something different at ${activity.name}. It's lively and great for a ${mood || 'fun'} outing.`,
                        estimatedDuration: '2 hours',
                        estimatedBudget: filters && filters.budget ? filters.budget : '$$',
                        intensity: 'active',
                    });
                }

                // Fill to 3-5 ideas if needed
                const more = pick(pool.filter((p: any) => ![food?.id, walk?.id, culture?.id, activity?.id].includes(p.id)), 3 - ideas.length);
                more.forEach((p: any, idx: number) => {
                    ideas.push({
                        id: `idea-auto-${idx}`,
                        title: `Visit ${p.name}`,
                        placeIds: [p.id],
                        description: `Check out ${p.name} and enjoy the local vibes.`,
                        estimatedDuration: '1-2 hours',
                        estimatedBudget: '$$',
                        intensity: 'normal',
                    });
                });

                cache.set(key, { ts: Date.now(), data: ideas });
                return ideas;
            } catch (e) {
                console.warn('Mock idea generation failed:', e);
                return [];
            }
        }

        // Real backend path (not used in offline mock mode)
        const response = await fetch(`${API_URL}/ideas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ places, filters }),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Network response was not ok: ${response.status} ${text}`);
        }

        const data = await response.json();
        const ideas = data.ideas || [];
        cache.set(key, { ts: Date.now(), data: ideas });
        return ideas;
    } catch (error) {
        console.error('Error generating ideas:', error);
        if (!USE_MOCK_API && API_URL) throw error;
        return [];
    }
};

// Export a small fallback ideas list that the UI can use if AI fails
export const MOCK_IDEAS = [
    {
        title: 'Cozy Dinner + Walk',
        description: 'Start with a warm dinner at a nearby spot then take a short stroll to a scenic viewpoint.',
        placeIds: ['1', '2'],
        estimatedCost: '$$',
        duration: '2 hours',
    }
];

// Expose simple helpers for runtime configuration checks
export const isUsingMock = () => {
    return USE_MOCK_API || !API_URL || API_URL === '' || API_URL.includes('your-vercel-project');
};

export const getBackendConfigStatus = () => {
    // If using mock, treat as OK (explicit offline mode)
    if (isUsingMock()) return { ok: true, mode: 'mock', message: 'Using mock/offline mode' };

    const issues: string[] = [];
    if (!API_URL || API_URL === '' || API_URL.includes('your-vercel-project')) {
        issues.push('API_URL is missing or still the placeholder');
    }

    // We cannot detect server-side secrets (like OPENAI_API_KEY) from the client safely.
    // Add a gentle reminder for the developer instead.
    if (issues.length > 0) {
        return { ok: false, issues, message: 'Backend appears misconfigured' };
    }

    return { ok: true, mode: 'real', message: 'Backend configured' };
};
