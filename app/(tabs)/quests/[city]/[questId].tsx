// app/quests/[city]/[questId].tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import InstantSEO from '@/components/seo/InstantSEO';
import { QuestWizard } from '@/components/quests/QuestWizard';
import { getQuestById } from '@/components/quests/registry';
import {useIsFocused} from "@react-navigation/native/src";

const UI = {
    text: '#0f172a',
    sub: '#64748b',
    border: '#e5e7eb',
    surface: '#ffffff',
    bg: '#f7fafc',
    primary: '#f59e0b',
};

export default function QuestByIdScreen() {
    const { questId, city } = useLocalSearchParams<{ questId: string; city: string }>();
    const bundle = questId ? getQuestById(questId) : null;
    const isFocused = useIsFocused();

    if (!bundle) {
        const title = 'Квест не найден';
        const description = 'Проверьте адрес страницы или выберите квест из общего списка.';

        return (
            <View style={[styles.page, { alignItems: 'center', justifyContent: 'center' }]}>
                {isFocused && (
                <InstantSEO
                    headKey="quest-not-found"
                    title={title}
                    description={description}
                    ogType="website"
                />
                )}
                <View style={styles.notFound}>
                    <Ionicons name="alert-circle" size={28} color={UI.sub} />
                    <Text style={styles.notFoundTitle}>{title}</Text>
                    <Text style={styles.notFoundText}>
                        Проверь адрес или выбери квест из списка.
                    </Text>
                    <Link href="/quests" asChild>
                        <Pressable style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={16} color="#fff" />
                            <Text style={styles.backBtnTxt}>К списку квестов</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        );
    }

    const title = bundle.title;
    const description = `${bundle.title} — офлайн-квест: маршрут, задания и финал.`;

    return (
        <View style={styles.page}>
            {isFocused && (
            <InstantSEO
                headKey={`quest-${bundle.storageKey ?? questId}`}
                title={title}
                description={description}
                ogType="article"
                // при желании можно прокинуть:
                // canonical={`https://your.site/quests/${city}/${questId}`}
                // image={bundle.coverUrl}
            />
            )}
            <QuestWizard
                title={bundle.title}
                steps={bundle.steps}
                finale={bundle.finale}
                intro={bundle.intro}
                storageKey={bundle.storageKey}
                city={bundle.city}
                mapPreviewOpenByDefault
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: UI.bg },
    notFound: {
        backgroundColor: UI.surface,
        borderWidth: 1, borderColor: UI.border,
        padding: 16, borderRadius: 16, gap: 8, width: '90%', maxWidth: 480,
        alignItems: 'center',
    },
    notFoundTitle: { color: UI.text, fontWeight: '900', fontSize: 16 },
    notFoundText: { color: UI.sub, textAlign: 'center' },
    backBtn: {
        marginTop: 8, flexDirection: 'row', gap: 6, alignItems: 'center',
        backgroundColor: UI.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
    },
    backBtnTxt: { color: '#fff', fontWeight: '800' },
});
