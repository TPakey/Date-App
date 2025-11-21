import { Alert } from 'react-native';
import Constants from 'expo-constants';

// API URL resolution order:
// 1. `Constants.expoConfig.extra.API_URL` (recommended via app config / EAS)
// 2. `process.env.EXPO_PUBLIC_API_URL` (if using env replacement)
// 3. fallback placeholder (app will use mock data when placeholder is present)
const API_URL =
    (Constants?.expoConfig as any)?.extra?.API_URL ||
    process.env?.EXPO_PUBLIC_API_URL ||
    'https://your-vercel-project.vercel.app/api';

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

// Mock data for testing without backend
const MOCK_PLACES: Place[] = [
    {
        id: '1',
        name: 'The Cozy Corner',
        rating: 4.5,
        user_ratings_total: 120,
        price_level: 2,
        vicinity: '123 Main St, Cityville',
        geometry: { location: { lat: 37.78825, lng: -122.4324 } },
        photos: [],
        types: ['restaurant', 'food'],
        opening_hours: { open_now: true },
    },
    {
        id: '2',
        name: 'Sunset Park',
        rating: 4.8,
        user_ratings_total: 300,
        price_level: 0,
        vicinity: '456 Park Ave, Cityville',
        geometry: { location: { lat: 37.78925, lng: -122.4344 } },
        photos: [],
        types: ['park', 'point_of_interest'],
        opening_hours: { open_now: true },
    },
    {
        id: '3',
        name: 'Art Museum',
        rating: 4.7,
        user_ratings_total: 500,
        price_level: 3,
        vicinity: '789 Art Blvd, Cityville',
        geometry: { location: { lat: 37.78725, lng: -122.4304 } },
        photos: [],
        types: ['museum', 'tourist_attraction'],
        opening_hours: { open_now: false },
    },
];

export const fetchPlaces = async (lat: number, lng: number, radius: number = 5000, type: string = 'restaurant'): Promise<Place[]> => {
    // Simple in-memory cache to reduce duplicate requests during a session
    try {
        const useMock = API_URL.includes('your-vercel-project');

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
            console.log('Using mock data for places');
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            const generated = MOCK_PLACES.map(p => ({
                ...p,
                geometry: {
                    location: {
                        lat: lat + (Math.random() - 0.5) * 0.01,
                        lng: lng + (Math.random() - 0.5) * 0.01,
                    }
                }
            }));
            cache.set(key, { ts: Date.now(), data: generated });
            return generated;
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
        const useMock = API_URL.includes('your-vercel-project');
        if (useMock) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mock = [
                {
                    title: "Dinner & Stroll",
                    description: "Enjoy a lovely dinner at The Cozy Corner followed by a relaxing walk in Sunset Park.",
                    placeIds: [places[0]?.id || '1', places[1]?.id || '2'].filter(Boolean),
                    estimatedCost: "$$",
                    duration: "2-3 hours"
                },
                {
                    title: "Artistic Afternoon",
                    description: "Explore a nearby museum and discuss your favorite pieces.",
                    placeIds: [places[0]?.id || '3'].filter(Boolean),
                    estimatedCost: "$$$",
                    duration: "2 hours"
                }
            ];
            cache.set(key, { ts: Date.now(), data: mock });
            return mock;
        }

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
        // Bubble up error in real mode so UI can handle fallback and show a message
        if (!API_URL.includes('your-vercel-project')) throw error;
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
