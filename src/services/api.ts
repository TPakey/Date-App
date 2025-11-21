import { Alert } from 'react-native';

// Replace with your actual deployed backend URL
const API_URL = 'https://your-vercel-project.vercel.app/api';

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
    try {
        // If API_URL is placeholder, return mock data
        if (API_URL.includes('your-vercel-project')) {
            console.log('Using mock data for places');
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MOCK_PLACES.map(p => ({
                ...p,
                geometry: {
                    location: {
                        lat: lat + (Math.random() - 0.5) * 0.01,
                        lng: lng + (Math.random() - 0.5) * 0.01,
                    }
                }
            }));
        }

        const response = await fetch(`${API_URL}/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.places;
    } catch (error) {
        console.error('Error fetching places:', error);
        return MOCK_PLACES; // Fallback to mock data on error
    }
};

export const generateDateIdeas = async (places: Place[], filters: any) => {
    try {
        if (API_URL.includes('your-vercel-project')) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return [
                {
                    title: "Dinner & Stroll",
                    description: "Enjoy a lovely dinner at The Cozy Corner followed by a relaxing walk in Sunset Park.",
                    placeIds: ["1", "2"],
                    estimatedCost: "$$",
                    duration: "2-3 hours"
                },
                {
                    title: "Artistic Afternoon",
                    description: "Explore the Art Museum and discuss your favorite pieces.",
                    placeIds: ["3"],
                    estimatedCost: "$$$",
                    duration: "2 hours"
                }
            ];
        }

        const response = await fetch(`${API_URL}/ideas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ places, filters }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.ideas;
    } catch (error) {
        console.error('Error generating ideas:', error);
        return [];
    }
};
