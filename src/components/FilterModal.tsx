import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { CategoryChip } from './CategoryChip';

interface FilterModalProps {
    visible: boolean;
    initialFilters?: any;
    onClose: () => void;
    onApply: (filters: any) => void;
}

const DURATIONS = ['30m', '1h', '1-2h', 'Full'];
const BUDGETS = ['$', '$$', '$$$'];
const MOODS = ['Chill', 'Active', 'Romantic', 'Fun', 'Cozy'];

export const FilterModal = ({ visible, initialFilters = {}, onClose, onApply }: FilterModalProps) => {
    const [radius, setRadius] = useState<number>(initialFilters.radius || 5);
    const [budget, setBudget] = useState<string | null>(initialFilters.budget || null);
    const [duration, setDuration] = useState<string | null>(initialFilters.duration || null);
    const [mood, setMood] = useState<string | null>(initialFilters.mood || null);
    const [indoor, setIndoor] = useState<boolean | null>(typeof initialFilters.indoor === 'boolean' ? initialFilters.indoor : null);

    useEffect(() => {
        setRadius(initialFilters.radius || 5);
        setBudget(initialFilters.budget || null);
        setDuration(initialFilters.duration || null);
        setMood(initialFilters.mood || null);
        setIndoor(typeof initialFilters.indoor === 'boolean' ? initialFilters.indoor : null);
    }, [initialFilters, visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>Filters</Text>

                    <View style={styles.section}>
                        <Text style={styles.label}>Radius</Text>
                        <View style={styles.row}>
                            {[5, 10, 20, 40].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.radiusButton, radius === r && { backgroundColor: COLORS.primary }]}
                                    onPress={() => setRadius(r)}
                                >
                                    <Text style={[styles.radiusText, radius === r && { color: '#FFF' }]}>{r} km</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Budget</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {BUDGETS.map((b) => (
                                <CategoryChip
                                    key={b}
                                    label={b}
                                    selected={budget === b}
                                    onPress={() => setBudget(b === budget ? null : b)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Duration</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {DURATIONS.map((d) => (
                                <CategoryChip
                                    key={d}
                                    label={d}
                                    selected={duration === d}
                                    onPress={() => setDuration(d === duration ? null : d)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Mood</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {MOODS.map((m) => (
                                <CategoryChip
                                    key={m}
                                    label={m}
                                    selected={mood === m}
                                    onPress={() => setMood(m === mood ? null : m)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <Text style={styles.label}>Indoor / Outdoor</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                style={[styles.toggleButton, indoor === true && { backgroundColor: COLORS.primary }]}
                                onPress={() => setIndoor(indoor === true ? null : true)}
                            >
                                <Text style={[styles.radiusText, indoor === true && { color: '#FFF' }]}>Indoor</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, indoor === false && { backgroundColor: COLORS.primary }]}
                                onPress={() => setIndoor(indoor === false ? null : false)}
                            >
                                <Text style={[styles.radiusText, indoor === false && { color: '#FFF' }]}>Outdoor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => onApply({ radius, budget, duration, mood, indoor })}
                        >
                            <Text style={styles.applyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        maxHeight: '80%',
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: SPACING.s,
        color: COLORS.text,
    },
    section: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    radiusButton: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        marginRight: SPACING.s,
    },
    radiusText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    toggleButton: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.m,
    },
    cancelButton: {
        flex: 1,
        marginRight: SPACING.s,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    cancelText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        marginLeft: SPACING.s,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
    },
    applyText: {
        color: '#FFF',
        fontWeight: '700',
    },
});
