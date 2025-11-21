import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { StorageService, Memory } from '../services/storage';
import { Calendar, MapPin } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';

export const MemoriesScreen = () => {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();

    const loadMemories = async () => {
        const data = await StorageService.getMemories();
        setMemories(data);
    };

    useEffect(() => {
        if (isFocused) {
            loadMemories();
        }
    }, [isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMemories();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: Memory }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.footer}>
                <Calendar size={14} color={COLORS.textSecondary} />
                <Text style={styles.footerText}>Recorded on {new Date(item.date).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Memories</Text>
            </View>

            {memories.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No memories yet.</Text>
                    <Text style={styles.emptySubtext}>Go on a date and mark it as done!</Text>
                </View>
            ) : (
                <FlatList
                    data={memories}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.m,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
