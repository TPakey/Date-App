import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { CategoryChip } from '../components/CategoryChip';
import { generateDateIdeas, fetchPlaces, Place, MOCK_IDEAS } from '../services/api';
import { getCurrentLocation } from '../services/location';
import { StorageService } from '../services/storage';
import { Sparkles, Clock, DollarSign, MapPin } from 'lucide-react-native';

const MOODS = ['Chill', 'Active', 'Romantic', 'Fun', 'Cozy'];
const DURATIONS = ['1-2h', '2-4h', 'Full Day'];
const BUDGETS = ['$', '$$', '$$$'];

export const IdeasScreen = () => {
    const [loading, setLoading] = useState(false);
    const [ideas, setIdeas] = useState<any[]>([]);

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
    const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

    useEffect(() => {
        const loadDefaults = async () => {
            const prefs = await StorageService.getPreferences();
            if (prefs) {
                if (prefs.defaultMood) setSelectedMood(prefs.defaultMood);
                if (prefs.defaultBudget) setSelectedBudget(prefs.defaultBudget);
                // no duration saved by prefs currently
            }
        };
        loadDefaults();
    }, []);

    const handleGenerate = async () => {
        if (!selectedMood || !selectedDuration || !selectedBudget) {
            Alert.alert('Missing filters', 'Please select a mood, duration, and budget.');
            return;
        }

        setLoading(true);
        try {
            const location = await getCurrentLocation();
            if (!location) {
                setLoading(false);
                return;
            }

            // get user radius preference if available
            const prefs = await StorageService.getPreferences();
            const radius = (prefs && prefs.radius) ? prefs.radius * 1000 : 5000;

            // 1. Fetch candidate places (type could be extended with category)
            const places = await fetchPlaces(location.latitude, location.longitude, radius, 'restaurant');

            // 2. Generate ideas
            const generatedIdeas = await generateDateIdeas(places, {
                mood: selectedMood,
                duration: selectedDuration,
                budget: selectedBudget,
            });

            setIdeas(generatedIdeas);
        } catch (error) {
            console.error('Ideas generation failed:', error);
            Alert.alert('AI error', 'Could not generate ideas from the AI service. Showing fallback suggestions.');
            setIdeas(MOCK_IDEAS);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Date Generator</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mood</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {MOODS.map(mood => (
                            <CategoryChip
                                key={mood}
                                label={mood}
                                selected={selectedMood === mood}
                                onPress={() => setSelectedMood(mood)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Duration</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {DURATIONS.map(d => (
                            <CategoryChip
                                key={d}
                                label={d}
                                selected={selectedDuration === d}
                                onPress={() => setSelectedDuration(d)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Budget</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {BUDGETS.map(b => (
                            <CategoryChip
                                key={b}
                                label={b}
                                selected={selectedBudget === b}
                                onPress={() => setSelectedBudget(b)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerate}
                    disabled={loading}
                    accessibilityLabel="Generate date ideas"
                    accessibilityRole="button"
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Sparkles color="#FFF" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.generateButtonText}>Generate Ideas</Text>
                        </>
                    )}
                </TouchableOpacity>

                {ideas.length > 0 ? (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                        {ideas.map((idea, index) => (
                            <View key={index} style={styles.ideaCard}>
                                <Text style={styles.ideaTitle}>{idea.title}</Text>
                                <Text style={styles.ideaDesc}>{idea.description}</Text>
                                <View style={styles.ideaMeta}>
                                    <View style={styles.metaItem}>
                                        <Clock size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.metaText}>{idea.duration || idea.estimatedDuration || ''}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <DollarSign size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.metaText}>{idea.estimatedCost || idea.estimatedBudget || ''}</Text>
                                    </View>
                                </View>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
                                        onPress={async () => {
                                            await StorageService.addFavorite(idea);
                                            Alert.alert('Saved!', 'Date idea saved to favorites.');
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                        onPress={async () => {
                                            await StorageService.addMemory({
                                                id: Math.random().toString(),
                                                date: new Date().toISOString(),
                                                title: idea.title,
                                                description: idea.description,
                                                placeIds: idea.placeIds,
                                            });
                                            Alert.alert('Nice!', 'Added to your memories.');
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>Did this!</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No suggestions yet</Text>
                            <Text style={styles.emptyText}>Try changing filters and tap Generate.</Text>
                        </View>
                    )
                )}
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
        paddingBottom: 100,
        paddingHorizontal: SPACING.m,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.l,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    generateButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        marginTop: SPACING.s,
        ...SHADOWS.medium,
    },
    generateButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsContainer: {
        marginTop: SPACING.xl,
    },
    ideaCard: {
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        ...SHADOWS.light,
    },
    ideaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    ideaDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        lineHeight: 20,
    },
    ideaMeta: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    actionRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginTop: SPACING.s,
    },
    actionButton: {
        flex: 1,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
