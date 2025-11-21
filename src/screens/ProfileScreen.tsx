import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { StorageService, UserPreferences } from '../services/storage';
import { Settings, MapPin, Moon, DollarSign } from 'lucide-react-native';

const MOODS = ['Chill', 'Active', 'Romantic', 'Fun', 'Cozy'];
const BUDGETS = ['$', '$$', '$$$'];

export const ProfileScreen = () => {
    const [radius, setRadius] = useState(5); // km
    const [defaultMood, setDefaultMood] = useState<string | null>(null);
    const [defaultBudget, setDefaultBudget] = useState<string | null>(null);
    const [useMiles, setUseMiles] = useState(false);
    const [weatherEnabled, setWeatherEnabled] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const prefs = await StorageService.getPreferences();
        if (prefs) {
            setRadius(prefs.radius);
            setDefaultMood(prefs.defaultMood || null);
            setDefaultBudget(prefs.defaultBudget || null);
            setUseMiles(!!prefs.useMiles);
            setWeatherEnabled(prefs.weatherEnabled === undefined ? true : !!prefs.weatherEnabled);
        }
    };

    const savePreferences = async () => {
        const prefs: UserPreferences = {
            radius,
            defaultMood: defaultMood || undefined,
            defaultBudget: defaultBudget || undefined,
            useMiles,
            weatherEnabled,
        };

        await StorageService.savePreferences(prefs);
        Alert.alert('Saved', 'Your preferences have been updated.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MapPin size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Search Radius</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.valueText}>{radius} km</Text>
                        <View style={styles.radiusButtons}>
                            {[5, 10, 20, 50].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[
                                        styles.radiusButton,
                                        radius === r && { backgroundColor: COLORS.primary },
                                    ]}
                                    onPress={() => setRadius(r)}
                                >
                                    <Text
                                        style={[
                                            styles.radiusButtonText,
                                            radius === r && { color: '#FFF' },
                                        ]}
                                    >
                                        {r}km
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Moon size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Default Mood</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {MOODS.map((mood) => (
                            <TouchableOpacity
                                key={mood}
                                style={[
                                    styles.chip,
                                    defaultMood === mood && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                                ]}
                                onPress={() => setDefaultMood(mood === defaultMood ? null : mood)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        defaultMood === mood && { color: '#FFF' },
                                    ]}
                                >
                                    {mood}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <DollarSign size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Typical Budget</Text>
                    </View>
                    <View style={styles.row}>
                        {BUDGETS.map((budget) => (
                            <TouchableOpacity
                                key={budget}
                                style={[
                                    styles.chip,
                                    defaultBudget === budget && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                                ]}
                                onPress={() => setDefaultBudget(budget === defaultBudget ? null : budget)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        defaultBudget === budget && { color: '#FFF' },
                                    ]}
                                >
                                    {budget}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Use Miles</Text>
                            <Switch
                                value={useMiles}
                                onValueChange={setUseMiles}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        </View>
                        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.settingLabel}>Weather Suggestions</Text>
                            <Switch
                                value={weatherEnabled}
                                onValueChange={setWeatherEnabled}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                </TouchableOpacity>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Date Ideas Near Me v1.0.0</Text>
                    <Text style={styles.versionText}>No Account Required</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    scrollContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: 40,
    },
    header: {
        marginBottom: SPACING.l,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        ...SHADOWS.light,
    },
    valueText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    radiusButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.s,
    },
    radiusButton: {
        flex: 1,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    radiusButtonText: {
        fontWeight: '600',
        color: COLORS.text,
    },
    chipScroll: {
        flexDirection: 'row',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    chip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.s,
        ...SHADOWS.light,
    },
    chipText: {
        fontWeight: '600',
        color: COLORS.text,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    settingLabel: {
        fontSize: 16,
        color: COLORS.text,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    versionInfo: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    versionText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
});
