import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SlidersHorizontal, RotateCw } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { CategoryChip } from './CategoryChip';

const CATEGORIES = [
    { id: 'food', label: 'Food', color: COLORS.catFood },
    { id: 'activity', label: 'Activity', color: COLORS.catActivity },
    { id: 'walk', label: 'Walk', color: COLORS.catNature },
    { id: 'culture', label: 'Culture', color: COLORS.catCulture },
    { id: 'random', label: 'Random', color: COLORS.catRandom },
];

interface FilterBarProps {
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    onOpenFilters: () => void;
    onRefresh?: () => void;
}

export const FilterBar = ({ selectedCategory, onSelectCategory, onOpenFilters }: FilterBarProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={onOpenFilters}
                    accessibilityLabel="Open filters"
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <SlidersHorizontal size={20} color={COLORS.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, { marginRight: 8 }]}
                    onPress={onRefresh}
                    accessibilityLabel="Refresh places"
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <RotateCw size={20} color={COLORS.text} />
                </TouchableOpacity>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {CATEGORIES.map((cat) => (
                        <CategoryChip
                            key={cat.id}
                            label={cat.label}
                            color={cat.color}
                            selected={selectedCategory === cat.id}
                            onPress={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Adjust for status bar
        left: 0,
        right: 0,
        zIndex: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    scrollContent: {
        paddingRight: SPACING.m,
    },
});
