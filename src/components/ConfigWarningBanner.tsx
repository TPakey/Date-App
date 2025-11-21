import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBackendConfigStatus, isUsingMock } from '../services/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export const ConfigWarningBanner = () => {
    const status = getBackendConfigStatus();

    // Don't show when using mock mode or when everything looks OK
    if (isUsingMock() || status.ok) return null;

    const issues = (status as any).issues || [];

    return (
        <View style={styles.container} accessibilityRole="alert">
            <Text style={styles.title}>Backend configuration</Text>
            <Text style={styles.message}>{status.message}</Text>
            {issues.length > 0 && (
                <Text style={styles.issues}>• {issues.join('\n• ')}</Text>
            )}
            <Text style={styles.hint}>Set `expo.extra.API_URL` and deploy backend with `OPENAI_API_KEY`.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF3CD',
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        margin: SPACING.s,
        borderRadius: RADIUS.s,
        ...SHADOWS.light,
    },
    title: {
        fontWeight: '700',
        color: '#6A4A00',
        marginBottom: 4,
    },
    message: {
        color: '#6A4A00',
        marginBottom: 6,
    },
    issues: {
        color: '#6A4A00',
        marginBottom: 6,
    },
    hint: {
        color: '#6A4A00',
        fontSize: 12,
    },
});

export default ConfigWarningBanner;
