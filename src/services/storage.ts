import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Memory {
    id: string;
    date: string; // ISO string
    title: string;
    description: string;
    placeIds: string[];
    rating?: number;
    notes?: string;
}

export interface UserPreferences {
    radius: number;
    defaultMood?: string;
    defaultBudget?: string;
    useMiles?: boolean;
    weatherEnabled?: boolean;
    defaultCategories?: string[];
}

const KEYS = {
    MEMORIES: '@date_app_memories',
    PREFERENCES: '@date_app_preferences',
    FAVORITES: '@date_app_favorites',
};

export const StorageService = {
    // Memories
    async getMemories(): Promise<Memory[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.MEMORIES);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error reading memories', e);
            return [];
        }
    },

    async addMemory(memory: Memory): Promise<void> {
        try {
            const memories = await this.getMemories();
            const newMemories = [memory, ...memories];
            await AsyncStorage.setItem(KEYS.MEMORIES, JSON.stringify(newMemories));
        } catch (e) {
            console.error('Error saving memory', e);
        }
    },

    // Favorites (Ideas)
    async getFavorites(): Promise<any[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.FAVORITES);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error reading favorites', e);
            return [];
        }
    },

    async addFavorite(idea: any): Promise<void> {
        try {
            const favorites = await this.getFavorites();
            const newFavorites = [idea, ...favorites];
            await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Error saving favorite', e);
        }
    },

    // Preferences
    async getPreferences(): Promise<UserPreferences | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.PREFERENCES);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error reading preferences', e);
            return null;
        }
    },

    async savePreferences(prefs: UserPreferences): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
        } catch (e) {
            console.error('Error saving preferences', e);
        }
    },
};
