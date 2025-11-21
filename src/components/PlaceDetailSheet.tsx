import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Place } from '../services/api';
import { StorageService } from '../services/storage';
import { X, ExternalLink } from 'lucide-react-native';

interface Props {
    place: Place;
    onClose: () => void;
}

export const PlaceDetailSheet = ({ place, onClose }: Props) => {
    const priceLabel = (p?: number) => {
        if (typeof p !== 'number') return '—';
        return '$'.repeat(Math.max(1, p));
    };

    const handleSaveFavorite = async () => {
        await StorageService.addFavorite({ id: place.id, title: place.name, place });
        onClose();
    };

    const handleAddMemory = async () => {
        await StorageService.addMemory({
            id: Math.random().toString(36).slice(2),
            date: new Date().toISOString(),
            title: place.name,
            description: place.vicinity || '',
            placeIds: [place.id],
        });
        onClose();
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.sheet}>
                <View style={styles.header}>
                    <Text style={styles.title}>{place.name}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X color={COLORS.textSecondary} size={18} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.vicinity}>{place.vicinity}</Text>
                <View style={styles.rowMeta}>
                    <Text style={styles.meta}>Rating: {place.rating ?? '—'}</Text>
                    <Text style={styles.meta}>Price: {priceLabel(place.price_level)}</Text>
                </View>

                {place.opening_hours && typeof place.opening_hours.open_now === 'boolean' && (
                    <Text style={styles.openNow}>{place.opening_hours.open_now ? 'Open now' : 'Closed'}</Text>
                )}

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.secondary }]}
                        onPress={handleSaveFavorite}
                        accessibilityLabel="Save favorite"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.primary }]}
                        onPress={handleAddMemory}
                        accessibilityLabel="Mark as done and save to memories"
                        accessibilityRole="button"
                    >
                        <Text style={styles.buttonText}>Did this!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }]}
                        onPress={() => {
                            const query = encodeURIComponent(place.name + ' ' + (place.vicinity || ''));
                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                        }}
                        accessibilityLabel="Open place in Google Maps"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.buttonText, { color: COLORS.text }]}>Open in Maps</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheet: {
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    closeButton: {
        padding: 6,
        marginLeft: SPACING.s,
    },
    vicinity: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    rowMeta: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.s,
    },
    meta: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    openNow: {
        color: COLORS.success,
        fontWeight: '700',
        marginBottom: SPACING.s,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    button: {
        flex: 1,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
    },
});
