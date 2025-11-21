import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region, Marker, Callout } from 'react-native-maps';
import { COLORS } from '../constants/theme';
import { getCurrentLocation } from '../services/location';
import { FilterBar } from '../components/FilterBar';
import { fetchPlaces, Place } from '../services/api';

export const ExploreScreen = () => {
    const [region, setRegion] = useState<Region | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);

    useEffect(() => {
        const initLocation = async () => {
            const location = await getCurrentLocation();
            if (location) {
                setRegion(location);
                loadPlaces(location.latitude, location.longitude);
            }
            setLoading(false);
        };

        initLocation();
    }, []);

    const loadPlaces = async (lat: number, lng: number, category?: string) => {
        const type = category === 'food' ? 'restaurant' :
            category === 'activity' ? 'bowling_alley' :
                category === 'culture' ? 'museum' :
                    category === 'walk' ? 'park' : 'point_of_interest';

        const results = await fetchPlaces(lat, lng, 5000, type);
        setPlaces(results);
    };

    useEffect(() => {
        if (region) {
            loadPlaces(region.latitude, region.longitude, selectedCategory || undefined);
        }
    }, [selectedCategory]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation
                showsMyLocationButton
                initialRegion={region || undefined}
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
                        pinColor={COLORS.primary}
                    />
                ))}
            </MapView>
            <FilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenFilters={() => console.log('Open filters')}
            />
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
});
