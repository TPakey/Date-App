import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface CategoryChipProps {
    label: string;
    selected?: boolean;
    onPress: () => void;
    color?: string;
}

export const CategoryChip = ({ label, selected, onPress, color = COLORS.primary }: CategoryChipProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected && { backgroundColor: color, borderColor: color },
                !selected && { borderColor: COLORS.border },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: !!selected }}
            accessibilityLabel={label}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Text
                style={[
                    styles.text,
                    selected && { color: COLORS.card },
                    !selected && { color: COLORS.text },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        backgroundColor: COLORS.card,
        marginRight: SPACING.s,
        ...SHADOWS.light,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
    },
});
