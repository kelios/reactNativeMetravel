// components/quests/QuestWizard.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable,
    ScrollView, Platform, LayoutAnimation, UIManager, Linking,
    Animated, Easing, Alert, Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, AVPlaybackStatusSuccess, ResizeMode } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import BelkrajWidget from "@/components/belkraj/BelkrajWidget";
import QuestFullMap from "@/components/quests/QuestFullMap";

// ===================== ТИПЫ =====================
export type QuestStep = {
    id: string;
    title: string;
    location: string;
    story: string;
    task: string;
    hint?: string;
    answer: (input: string) => boolean;
    lat: number;
    lng: number;
    mapsUrl: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any | null;
};

export type QuestCity = {
    name?: string;
    lat: number;
    lng: number;
    countryCode?: string; // по умолчанию 'BY'
};

export type QuestFinale = { text: string; video?: any | null };

export type QuestWizardProps = {
    title: string;
    steps: QuestStep[];              // реальные точки квеста (без интро)
    finale: QuestFinale;
    intro?: QuestStep;               // опционально: экран-инструкция
    storageKey?: string;             // ключ для сохранения прогресса
    mapPreviewOpenByDefault?: boolean; // карта открыта по умолчанию
    city?: QuestCity;
};

// ===================== ТЕМА =====================
const THEME = {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    ink: '#111111',
    sub: '#6B6F76',
    border: '#E6E7E8',
    shadow: 'rgba(0,0,0,0.06)',
    error: '#D92D20',
    success: '#16A34A',
    accent: '#0A84FF',
};

// ===================== УТИЛИТЫ =====================
const isNumericPreferred = (task?: string) => !!task && (/\bчисл|\bцифр|\d/).test(task.toLowerCase());

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    try { UIManager.setLayoutAnimationEnabledExperimental(true); } catch {}
}

const useToast = () => {
    const [msg, setMsg] = useState<string | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;
    const show = useCallback((text: string) => {
        setMsg(text);
        Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start(() => setMsg(null));
    }, [opacity]);
    const Toast = msg ? (
        <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite">
            <Text style={styles.toastTxt}>{msg}</Text>
        </Animated.View>
    ) : null;
    return { Toast, show };
};

// ===================== КАРТОЧКА ШАГА =====================
type StepCardProps = {
    step: QuestStep;
    index: number;
    attempts: number;
    hintVisible: boolean;
    savedAnswer?: string;
    onSubmit: (value: string) => void;
    onWrongAttempt: () => void;
    onToggleHint: () => void;
    onOpenInGoogle: () => void;
    onOpenInApple: () => void;
    onOpenInOSM: () => void;
    onOpenInMapsMe: () => void;
    onCopyCoords: () => void;
    onSkip: () => void;
    mapPreviewOpen: boolean;
};

const StepCard = memo(function StepCard({
                                            step, index, attempts, hintVisible, savedAnswer,
                                            onSubmit, onWrongAttempt, onToggleHint, onOpenInGoogle, onOpenInApple, onOpenInOSM, onOpenInMapsMe, onCopyCoords, onSkip,
                                            mapPreviewOpen,
                                        }: StepCardProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(mapPreviewOpen && step.id !== 'intro');
    const translateX = useRef(new Animated.Value(0)).current;
    const showHintAfter = 2;

    useEffect(() => {
        setValue('');
        setError(null);
        setShowPreview(mapPreviewOpen && step.id !== 'intro');
    }, [step.id, mapPreviewOpen]);

    const shake = () => {
        translateX.setValue(0);
        Animated.sequence([
            Animated.timing(translateX, { toValue: 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(translateX, { toValue: -8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(translateX, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
        ]).start();
    };

    const handleCheck = () => {
        const v = value.trim();
        if (step.id === 'intro') { onSubmit('start'); return; }
        if (!v) { setError('Поле пустое'); shake(); return; }

        if (step.answer(v)) {
            setError(null);
            onSubmit(v);
            setValue('');
        } else {
            setError(/^\d+$/.test(v) ? 'Число не совпало' : 'Ответ неверный');
            onWrongAttempt();
            if (attempts + 1 >= showHintAfter && step.hint && !hintVisible) onToggleHint();
            shake();
        }
    };

    const isPassed = !!savedAnswer && step.id !== 'intro';

    return (
        <View style={styles.card}>
            <View style={styles.cardHead}>
                <Text style={[styles.stepNum, isPassed && styles.stepNumPassed]}>
                    {step.id === 'intro' ? '' : index}
                </Text>
                <Text style={styles.cardTitle}>{step.title}</Text>
                {isPassed && (
                    <View style={styles.passedChip} accessibilityLabel="Шаг пройден">
                        <Text style={styles.passedChipTxt}>✓ Пройдено</Text>
                    </View>
                )}
            </View>

            <Text style={styles.location}>{step.location}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Рассказ</Text>
                <Text style={styles.body}>{step.story}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Задание</Text>
                <Text style={[styles.body, styles.task]}>{step.task}</Text>
            </View>

            {step.id !== 'intro' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Карта</Text>
                    <View style={styles.linksRow}>
                        <Pressable onPress={onOpenInGoogle}><Text style={styles.link}>Google</Text></Pressable>
                        <Pressable onPress={onOpenInApple}><Text style={styles.link}>Apple</Text></Pressable>
                        <Pressable onPress={onOpenInOSM}><Text style={styles.link}>OSM</Text></Pressable>
                        <Pressable onPress={onOpenInMapsMe}><Text style={styles.link}>Maps.me</Text></Pressable>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={() => setShowPreview(v => !v)}>
                            <Text style={styles.link}>{showPreview ? 'Скрыть карту' : 'Показать карту'}</Text>
                        </Pressable>
                        <Pressable onPress={onCopyCoords}>
                            <Text style={[styles.link, { marginLeft: 12 }]}>Скопировать координаты</Text>
                        </Pressable>
                    </View>
                    {showPreview && step.image && (
                        <Animated.Image source={step.image} style={styles.stepImg} resizeMode="contain" />
                    )}
                </View>
            )}

            {/* поле ввода показываем только если шаг ещё не пройден */}
            {step.id !== 'intro' && !isPassed && (
                <>
                    <Animated.View style={{ transform: [{ translateX }] }}>
                        <TextInput
                            style={[styles.input, !!error && styles.inputErr]}
                            placeholder={isNumericPreferred(step.task) ? 'Введите число' : 'Ваш ответ'}
                            placeholderTextColor={THEME.sub}
                            value={value}
                            onChangeText={setValue}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={handleCheck}
                            keyboardType={isNumericPreferred(step.task) ? 'number-pad' : 'default'}
                        />
                    </Animated.View>

                    <View style={styles.actionsRow}>
                        <Pressable style={styles.primaryBtn} onPress={handleCheck}><Text style={styles.primaryBtnTxt}>Проверить</Text></Pressable>
                        {step.hint && (
                            <Pressable style={styles.secondaryBtn} onPress={onToggleHint}>
                                <Text style={styles.secondaryBtnTxt}>{hintVisible ? 'Скрыть подсказку' : 'Подсказка'}</Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.linkBtn} onPress={onSkip} accessibilityLabel="Пропустить шаг">
                            <Text style={styles.linkBtnTxt}>Пропустить</Text>
                        </Pressable>
                    </View>
                </>
            )}

            {/* отображение сохранённого ответа для пройденного шага */}
            {isPassed && (
                <View style={styles.answerBox} accessibilityLabel="Сохранённый ответ">
                    <Text style={styles.answerLabel}>Ответ:</Text>
                    <Text style={styles.answerValue}>{String(savedAnswer)}</Text>
                    <Text style={styles.answerHelp}>Шаг завершён. Можно перелистнуть дальше или вернуться позже.</Text>
                </View>
            )}

            {step.id === 'intro' && (
                <View style={styles.actionsRow}>
                    <Pressable style={styles.primaryBtn} onPress={handleCheck}><Text style={styles.primaryBtnTxt}>Начать квест</Text></Pressable>
                </View>
            )}

            {error && <Text style={{ color: THEME.error, marginTop: 8 }}>{error}</Text>}

            {hintVisible && step.hint && (
                <View style={styles.hintBox}><Text style={styles.hintTxt}>{step.hint}</Text></View>
            )}
        </View>
    );
});

// ===================== УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ =====================
export function QuestWizard({
                                title,
                                steps,
                                finale,
                                intro,
                                storageKey = 'quest_wizard_progress',
                                city,
                                mapPreviewOpenByDefault = true,
                            }: QuestWizardProps) {
    // Собираем массив отображения: [intro? , ...steps]
    const LIST = useMemo(() => intro ? [intro, ...steps] : steps, [intro, steps]);
    const hasIntro = !!intro;
    const total = LIST.length; // количество карточек (финал ниже, отдельно)

    const [unlockedIndex, setUnlockedIndex] = useState(0);   // индекс макс. открытого шага (0..total-1)
    const [cursor, setCursor] = useState(0);                 // текущий просмотр (0..unlockedIndex)

    const [answers, setAnswers] = useState<Record<string, string>>({}); // id -> валидный ответ
    const [attempts, setAttempts] = useState<Record<string, number>>({});
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});

    const { Toast, show } = useToast();

    // Load
    useEffect(() => { (async () => {
        try {
            const raw = await AsyncStorage.getItem(storageKey);
            if (raw) {
                const p = JSON.parse(raw);
                if (typeof p.unlockedIndex === 'number') setUnlockedIndex(p.unlockedIndex);
                if (typeof p.cursor === 'number') setCursor(Math.min(p.cursor, Math.max(0, p.unlockedIndex ?? 0)));
                if (p.answers) setAnswers(p.answers);
                if (p.attempts) setAttempts(p.attempts);
                if (p.showHints) setShowHints(p.showHints);
                show('Прогресс восстановлен');
            }
        } catch {}
    })(); }, [storageKey]);

    // Save
    useEffect(() => {
        AsyncStorage.setItem(storageKey, JSON.stringify({ unlockedIndex, cursor, answers, attempts, showHints })).catch(() => {});
    }, [storageKey, unlockedIndex, cursor, answers, attempts, showHints]);

    const mapOps = (s: QuestStep) => {
        const google = () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`).catch(() => {});
        const apple  = () => Linking.openURL(`http://maps.apple.com/?ll=${s.lat},${s.lng}`).catch(() => {});
        const osm    = () => Linking.openURL(`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=18/${s.lat}/${s.lng}`).catch(() => {});
        const mm     = () => Linking.openURL(`mapsme://map?ll=${s.lat},${s.lng}`).catch(() => {});
        const copy   = async () => { await Clipboard.setStringAsync(`${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}`); show('Координаты скопированы'); };
        return { google, apple, osm, mm, copy };
    };

    // Сабмит корректного ответа: отмечаем шаг пройденным
    const submit = (step: QuestStep, idx: number, value: string) => {
        LayoutAnimation.easeInEaseOut();
        setAnswers(p => ({ ...p, [step.id]: value }));
        setAttempts(p => ({ ...p, [step.id]: 0 }));
        setShowHints(p => ({ ...p, [step.id]: false }));
        const next = Math.min(idx + 1, total - 1);
        setUnlockedIndex(u => Math.max(u, idx + 1));
        setCursor(next);
        show(step.id === 'intro' ? 'Квест начат!' : 'Верно');
    };

    // Зафиксировать неудачную попытку (для подсказок)
    const markWrongAttempt = (step: QuestStep) => {
        setAttempts(prev => ({ ...prev, [step.id]: (prev[step.id] ?? 0) + 1 }));
    };

    // Пропустить текущий: разблокируем следующий, но НЕ отмечаем ответ
    const skipCurrent = () => {
        const ci = currentIndex;
        if (ci >= total - 1) return;
        LayoutAnimation.easeInEaseOut();
        const next = Math.min(ci + 1, total - 1);
        setUnlockedIndex(u => Math.max(u, ci + 1));
        setCursor(next);
        show('Шаг пропущен');
    };

    // Сброс
    const restart = async () => {
        LayoutAnimation.easeInEaseOut();
        setUnlockedIndex(0);
        setCursor(0);
        setAnswers({});
        setAttempts({});
        setShowHints({});
        try { await AsyncStorage.removeItem(storageKey); } catch {}
        show('Квест сброшен');
    };

    // Навигация по открытым шагам
    const goPrev = () => setCursor(i => Math.max(0, i - 1));
    const goNext = () => setCursor(i => Math.min(unlockedIndex, total - 1));

    // Текущий экран
    const currentIndex = Math.min(cursor, Math.min(unlockedIndex, total - 1));
    const currentStep = LIST[currentIndex];

    // Метрики прогресса: считаем ТОЛЬКО пройденные (answers), без интро
    const realSteps = useMemo(() => (hasIntro ? LIST.slice(1) : LIST), [LIST, hasIntro]);
    const answeredCount = realSteps.filter(s => !!answers[s.id]).length;
    const allAnswered = realSteps.length > 0 && answeredCount >= realSteps.length;
    const progress = realSteps.length > 0 ? answeredCount / realSteps.length : 0;

    // PDF (включая ответы для пройденных шагов)
    // PDF (включая ответы для пройденных шагов)
    const buildPrintableHTML = () => {
        const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Используем ВСЕ шаги из steps (исходный массив без интро)
        const stepsHtml = steps.map((s, i) => {
            return `
            <section class="step">
                <h2>${i + 1}. ${esc(s.title)}</h2>
                <p class="location">${esc(s.location)}</p>
                <div class="story">${esc(s.story)}</div>
                <p class="task"><strong>Задание:</strong> ${esc(s.task)}</p>
                ${answers[s.id] ? `<p class="ans"><strong>Ответ:</strong> ${esc(answers[s.id])}</p>` : ''}
                ${s.hint ? `<p class="hint"><strong>Подсказка:</strong> ${esc(s.hint)}</p>` : ''}
            </section>
        `;
        }).join('');

        return `
        <html><head><meta charset="utf-8" />
            <style>
                *{box-sizing:border-box}
                @page{margin:16mm}
                body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,'Helvetica Neue',sans-serif;color:#111;margin:0;padding:0}
                .step{border:1px solid #E6E7E8;border-radius:10px;padding:12px;margin:12px 0;page-break-inside:avoid}
                h2{margin:0 0 8px;font-size:18px;color:#111}
                .location{color:#6B6F76;margin:0 0 8px;font-style:italic}
                .story{margin:0 0 12px;line-height:1.5}
                .task{margin:0 0 8px;font-weight:600}
                .ans{margin:6px 0 0;color:#16A34A;font-weight:600}
                .hint{margin:6px 0 0;color:#0A84FF;font-style:italic}
                .header{text-align:center;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #E6E7E8}
                .title{font-size:24px;font-weight:900;margin:0}
                .subtitle{color:#6B6F76;margin:5px 0}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="title">${esc(title)}</h1>
                <p class="subtitle">Бумажная версия квеста</p>
            </div>
            ${stepsHtml}
        </body></html>`;
    };

    const buildFullQuestHTML = () => {
        const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Используем ВСЕ шаги из steps (исходный массив без интро и финала)
        const stepsHtml = steps.map((s, i) => {
            return `
                <section class="step">
                    <h2>${i + 1}. ${esc(s.title)}</h2>
                    <p class="location">${esc(s.location)}</p>
                    <div class="story">${esc(s.story)}</div>
                    <p class="task"><strong>Задание:</strong> ${esc(s.task)}</p>
                    ${s.hint ? `<p class="hint"><strong>Подсказка:</strong> ${esc(s.hint)}</p>` : ''}
                    <p class="coords"><strong>Координаты:</strong> ${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}</p>
                </section>
            `;
        }).join('');

        return `
            <html><head><meta charset="utf-8" />
                <style>
                    *{box-sizing:border-box}
                    @page{margin:16mm}
                    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,'Helvetica Neue',sans-serif;color:#111;margin:0;padding:0}
                    .step{border:1px solid #E6E7E8;border-radius:10px;padding:12px;margin:12px 0;page-break-inside:avoid}
                    h2{margin:0 0 8px;font-size:18px;color:#111}
                    .location{color:#6B6F76;margin:0 0 8px;font-style:italic}
                    .story{margin:0 0 12px;line-height:1.5}
                    .task{margin:0 0 8px;font-weight:600}
                    .hint{margin:6px 0 0;color:#0A84FF;font-style:italic}
                    .coords{margin:6px 0 0;color:#6B6F76;font-family:monospace}
                    .header{text-align:center;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #E6E7E8}
                    .title{font-size:24px;font-weight:900;margin:0}
                    .subtitle{color:#6B6F76;margin:5px 0}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="title">${esc(title)}</h1>
                    <p class="subtitle">Полная версия квеста</p>
                </div>
                ${stepsHtml}
            </body></html>`;
    };

    const handlePrintFullQuest = async () => {
        try {
            const html = buildFullQuestHTML();
            const file = await Print.printToFileAsync({ html });
            await Share.share({ url: file.uri, message: `${title} — полная версия квеста (PDF)` });
        } catch {
            Alert.alert('Не удалось создать PDF', 'Попробуйте ещё раз.');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header} accessibilityRole="header">
                    <View style={styles.headerTopRow}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable style={styles.ghostBtn} onPress={restart} accessibilityLabel="Начать сначала">
                            <Text style={styles.ghostBtnTxt}>Сбросить</Text>
                        </Pressable>
                        <Pressable style={styles.pdfBtn} onPress={handlePrintFullQuest} accessibilityLabel="Печать всего квеста">
                            <Text style={styles.pdfBtnTxt}>Печать квеста</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.subtitle}>Точек: {realSteps.length} · офлайн</Text>
                    <View style={styles.progressWrap} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressTxt}>Пройдено {answeredCount} из {realSteps.length}</Text>

                    {/* Навигация по открытым шагам */}
                    <View style={styles.navRow}>
                        <Pressable onPress={goPrev} disabled={currentIndex <= 0} style={[styles.navBtn, currentIndex <= 0 && styles.navBtnDisabled]}>
                            <Text style={styles.navBtnTxt}>← Назад</Text>
                        </Pressable>
                        <View style={{ flex: 1 }} />
                        <Pressable onPress={goNext} disabled={currentIndex >= Math.min(unlockedIndex, total - 1)} style={[styles.navBtn, currentIndex >= Math.min(unlockedIndex, total - 1) && styles.navBtnDisabled]}>
                            <Text style={styles.navBtnTxt}>Вперёд →</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Текущий шаг */}
                {!!currentStep && (
                    <StepCard
                        step={currentStep}
                        index={hasIntro ? (currentIndex === 0 ? 0 : currentIndex) : currentIndex}
                        attempts={attempts[currentStep.id] ?? 0}
                        hintVisible={!!showHints[currentStep.id]}
                        savedAnswer={answers[currentStep.id]}
                        onSubmit={(val) => submit(currentStep, currentIndex, val)}
                        onWrongAttempt={() => markWrongAttempt(currentStep)}
                        onToggleHint={() => setShowHints(p => ({ ...p, [currentStep.id]: !p[currentStep.id] }))}
                        onOpenInGoogle={mapOps(currentStep).google}
                        onOpenInApple={mapOps(currentStep).apple}
                        onOpenInOSM={mapOps(currentStep).osm}
                        onOpenInMapsMe={mapOps(currentStep).mm}
                        onCopyCoords={mapOps(currentStep).copy}
                        onSkip={skipCurrent}
                        mapPreviewOpen={mapPreviewOpenByDefault}
                    />
                )}

                {/* Финал — ТОЛЬКО когда все шаги реально решены */}
                {allAnswered && (
                    <View style={styles.finale}>
                        <Text style={styles.finaleTitle}>Финал легенды</Text>
                        <Text style={styles.finaleText}>{finale.text}</Text>
                        {!!finale.video && (
                            Platform.OS === 'web' ? (
                                <iframe
                                    src={finale.video as any}
                                    style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <Video
                                    source={finale.video as any}
                                    resizeMode={ResizeMode.CONTAIN}
                                    useNativeControls
                                    style={{ width: '100%', aspectRatio: 16 / 9 }}
                                    onPlaybackStatusUpdate={(st: AVPlaybackStatusSuccess) => { /* no-op */ }}
                                />
                            )
                        )}
                    </View>
                )}
                {/* Belkraj */}
                {Platform.OS === 'web' && city && (
                    <View
                        style={[
                            styles.card,
                            { width: '100%', maxWidth: 920, marginTop: 8, padding: 0, overflow: 'hidden' },
                        ]}
                    >

                        {Platform.OS === 'web' && steps.length > 0 && (
                            <QuestFullMap steps={steps} />
                        )}
                        <View style={{ height: 28 }} />
                          <BelkrajWidget
                            points={[{ id: 1, address: city.name ?? title, lat: city.lat, lng: city.lng }]}
                            countryCode={city.countryCode ?? 'BY'}
                            collapsedHeight={520}
                            expandedHeight={1200}
                            className="belkraj-slot"
                        />
                    </View>
                )}

                <View style={{ height: 28 }} />
            </ScrollView>

            {Toast}

        </View>
    );
}

// ===================== СТИЛИ =====================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    content: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },

    header: {
        width: '100%', maxWidth: 920,
        backgroundColor: THEME.surface,
        borderColor: THEME.border, borderWidth: 1, borderRadius: 16,
        padding: 16, marginBottom: 12,
        shadowColor: THEME.shadow, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    },
    headerTopRow: { flexDirection: 'row', alignItems: 'center' },
    title: { color: THEME.ink, fontSize: 22, fontWeight: '900', letterSpacing: 0.2, flex: 1 },
    pdfBtn: { borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' },
    pdfBtnTxt: { color: THEME.ink, fontWeight: '800' },
    ghostBtn: { borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8 },
    ghostBtnTxt: { color: THEME.ink, fontWeight: '800' },
    subtitle: { color: THEME.sub, marginTop: 6 },

    progressWrap: { height: 8, backgroundColor: '#F1F2F3', borderRadius: 999, overflow: 'hidden', marginTop: 12, borderWidth: 1, borderColor: THEME.border },
    progressBar: { height: '100%', backgroundColor: THEME.ink },
    progressTxt: { color: THEME.ink, marginTop: 6, fontWeight: '700' },

    navRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    navBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.card },
    navBtnDisabled: { opacity: 0.4 },
    navBtnTxt: { color: THEME.ink, fontWeight: '700' },

    card: {
        width: '100%', maxWidth: 920,
        backgroundColor: THEME.card,
        borderRadius: 16, borderWidth: 1, borderColor: THEME.border,
        padding: 16, marginBottom: 12,
        shadowColor: THEME.shadow, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    stepNum: {
        width: 28, height: 28, borderRadius: 999, borderWidth: 1, borderColor: THEME.border,
        color: THEME.sub, textAlign: 'center', textAlignVertical: 'center', fontWeight: '900'
    },
    stepNumPassed: { borderColor: THEME.success, color: THEME.success },
    cardTitle: { flexShrink: 1, color: THEME.ink, fontSize: 18, fontWeight: '800' },
    passedChip: { marginLeft: 'auto', borderRadius: 999, backgroundColor: '#EAF7EE', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#D6F0DC' },
    passedChipTxt: { color: THEME.success, fontWeight: '800' },

    location: { color: THEME.sub, marginBottom: 10 },

    section: { borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: THEME.surface },
    sectionTitle: { color: THEME.sub, fontWeight: '800', marginBottom: 6 },
    body: { color: THEME.ink, lineHeight: 20 },
    task: { fontWeight: '700' },

    linksRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
    link: { color: THEME.accent, fontWeight: '700', textDecorationLine: 'underline' },

        stepImg: {
            width: '100%',
                aspectRatio: 16 / 9,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: THEME.border,
                backgroundColor: '#F6F7F8',
                ...Platform.select({
                    web: { maxHeight: 360, objectFit: 'contain' as any },
               default: {},
            })
     },

    input: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, color: THEME.ink, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12 },
    inputErr: { borderColor: THEME.error },

    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
    primaryBtn: { backgroundColor: THEME.ink, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
    primaryBtnTxt: { color: '#fff', fontWeight: '800' },
    secondaryBtn: { backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
    secondaryBtnTxt: { color: THEME.ink, fontWeight: '700' },
    linkBtn: { paddingHorizontal: 6, paddingVertical: 8 },
    linkBtnTxt: { color: THEME.accent, fontWeight: '700', textDecorationLine: 'underline' },

    hintBox: { backgroundColor: '#F1F2F3', padding: 12, borderRadius: 12, marginTop: 12 },
    hintTxt: { color: THEME.ink, fontSize: 14 },

    answerBox: { backgroundColor: '#F6FDF8', borderWidth: 1, borderColor: '#D6F0DC', borderRadius: 12, padding: 12, marginTop: 10 },
    answerLabel: { color: THEME.sub, fontWeight: '800', marginBottom: 4 },
    answerValue: { color: THEME.ink, fontWeight: '800' },
    answerHelp: { color: THEME.sub, marginTop: 4 },

    finale: {
        width: '100%', maxWidth: 920,
        marginTop: 16, backgroundColor: THEME.card,
        borderWidth: 1, borderColor: THEME.border, borderRadius: 16, padding: 16
    },
    finaleTitle: { color: THEME.ink, fontSize: 20, fontWeight: '900', marginBottom: 6 },
    finaleText: { color: THEME.ink, opacity: 0.9, marginBottom: 12 },

    toast: { position: 'absolute', bottom: 20, left: 16, right: 16, alignItems: 'center' },
    toastTxt: { backgroundColor: THEME.ink, color: '#fff', fontWeight: '700', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
});

export default QuestWizard;
