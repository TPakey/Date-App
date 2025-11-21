import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker, Callout } from 'react-native-maps';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { getCurrentLocation } from '../services/location';
import { StorageService } from '../services/storage';
import { FilterBar } from '../components/FilterBar';
import { fetchPlaces, Place } from '../services/api';
import { FilterModal } from '../components/FilterModal';
import { PlaceDetailSheet } from '../components/PlaceDetailSheet';

export const ExploreScreen = () => {
    const [region, setRegion] = useState<Region | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [activeFilters, setActiveFilters] = useState<any>({ radius: 5 });

    useEffect(() => {
        const initLocation = async () => {
            const location = await getCurrentLocation();
            if (location) {
                setRegion(location);
                // Load preferences then places
                const prefs = await StorageService.getPreferences();
                if (prefs && prefs.radius) {
                    setActiveFilters((prev: any) => ({ ...prev, radius: prefs.radius }));
                }
                loadPlaces(location.latitude, location.longitude);
            }
            setLoading(false);
        };

        initLocation();
    }, []);

    const loadPlaces = async (lat: number, lng: number, category?: string) => {
        setLoading(true);
        const type = category === 'food' ? 'restaurant' :
            category === 'activity' ? 'bowling_alley' :
                category === 'culture' ? 'museum' :
                    category === 'walk' ? 'park' : 'point_of_interest';

        const radiusMeters = (activeFilters && activeFilters.radius ? activeFilters.radius : 5) * 1000;
        let results: Place[] = [];
        try {
            results = await fetchPlaces(lat, lng, radiusMeters, type);
        } catch (err: any) {
            console.error('Failed to load places', err);
            // show friendly message
            Alert.alert('Location search failed', 'Could not fetch nearby places. Please check your network or API configuration.');
            setLoading(false);
            return;
        }

        // Apply light client-side filters (budget / indoor-outdoor) when available
        const filtered = results.filter((p) => {
            if (activeFilters && activeFilters.budget) {
                // budget is like "$" / "$$" / "$$$"; map to price_level
                const map: any = { '$': 1, '$$': 2, '$$$': 3 };
                const required = map[activeFilters.budget] || null;
                if (required && typeof p.price_level === 'number') {
                    if (p.price_level > required) return false;
                }
            }

            if (activeFilters && typeof activeFilters.indoor === 'boolean') {
                // crude heuristic: park/natural types -> outdoor, restaurants/indoors -> indoor
                const types = p.types || [];
                const isOutdoor = types.includes('park') || types.includes('campground') || types.includes('natural_feature');
                if (activeFilters.indoor === true && isOutdoor) return false;
                if (activeFilters.indoor === false && !isOutdoor) return false;
            }

            return true;
        });

        setPlaces(filtered);
        setLoading(false);
    };

    useEffect(() => {
        if (region) {
            loadPlaces(region.latitude, region.longitude, selectedCategory || undefined);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (region) {
            loadPlaces(region.latitude, region.longitude, selectedCategory || undefined);
        }
    }, [activeFilters]);

    if (loading && !region) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const getPinColor = (place: Place) => {
        const types = place.types || [];
        if (types.includes('restaurant') || types.includes('food') || types.includes('cafe')) return COLORS.catFood;
        if (types.includes('park') || types.includes('campground') || types.includes('trail')) return COLORS.catNature;
        if (types.includes('museum') || types.includes('art_gallery') || types.includes('tourist_attraction')) return COLORS.catCulture;
        if (types.includes('bar') || types.includes('night_club') || types.includes('bowling_alley')) return COLORS.catActivity;
        return COLORS.catRandom;
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation
                showsMyLocationButton
                initialRegion={region || undefined}
                onPress={() => setSelectedPlace(null)}
            >
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.geometry.location.lat,
                            longitude: place.geometry.location.lng,
                        }}
                        title={place.name}
                        description={place.vicinity}
                        pinColor={getPinColor(place)}
                        onPress={() => setSelectedPlace(place)}
                    >
                        <Callout tooltip>
                            <View style={{ padding: 6 }}>
                                <View style={{ maxWidth: 220 }}>
                                    <View>
                                        {/* small preview inside callout */}
                                    </View>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {!loading && places.length === 0 && (
                <View style={styles.emptyState} pointerEvents="box-none">
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No places match your filters yet</Text>
                        <Text style={styles.emptyText}>Try relaxing your filters or increasing the search radius.</Text>
                    </View>
                </View>
            )}

            {loading && region && (
                <View style={styles.smallLoading} pointerEvents="none">
                    <ActivityIndicator size="small" color="#FFF" />
                </View>
            )}

            <FilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenFilters={() => setShowFilters(true)}
                onRefresh={() => {
                    if (region) loadPlaces(region.latitude, region.longitude, selectedCategory || undefined);
                }}
            />

            <FilterModal
                visible={showFilters}
                initialFilters={activeFilters}
                onClose={() => setShowFilters(false)}
                onApply={(f: any) => {
                    setActiveFilters(f);
                    setShowFilters(false);
                }}
            />

            <Modal visible={!!selectedPlace} animationType="slide" transparent>
                {selectedPlace && (
                    <PlaceDetailSheet
                        place={selectedPlace}
                        onClose={() => setSelectedPlace(null)}
                    />
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    smallLoading: {
        position: 'absolute',
        top: 80,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    emptyState: {
        position: 'absolute',
        left: 20,
        right: 20,
        top: '40%',
        alignItems: 'center',
    },
    emptyCard: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 12,
        ...SHADOWS.light,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
