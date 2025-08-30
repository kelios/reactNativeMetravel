// components/quests/QuestWizard.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable,
    ScrollView, Platform, Linking,
    Animated, KeyboardAvoidingView, SafeAreaView, Vibration,
    Dimensions, Modal, Image, Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import QuestFullMap from "@/components/quests/QuestFullMap";
import BelkrajWidget from "@/components/belkraj/BelkrajWidget";

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
    image?: any;
    inputType?: 'number' | 'text';
};

export type QuestCity = {
    name?: string;
    lat: number;
    lng: number;
    countryCode?: string;
};

export type QuestFinale = {
    text: string;
    video?: any;
};

export type QuestWizardProps = {
    title: string;
    steps: QuestStep[];
    finale: QuestFinale;
    intro?: QuestStep;
    storageKey?: string;
    city?: QuestCity;
};

// ===================== ТЕМА (оранжево-бело-серая) =====================
const COLORS = {
    background: 'transparent',
    surface: 'rgba(255,255,255,0.75)',
    primary: '#FB923C',         // orange-400 — мягче
    primaryDark: '#F97316',     // orange-500
    success: '#22C55E',         // зелёный — только для «выполнено»
    error: '#EF4444',
    text: '#111827',            // gray-900
    textSecondary: '#6B7280',   // gray-500
    border: 'rgba(17,24,39,0.08)',
    chip: 'rgba(249,115,22,0.10)', // фон для выделенной кнопки
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// ======== helpers: уведомления/подтверждение кроссплатформенно ========
const notify = (msg: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(msg);
    } else {
        console.log('[INFO]', msg);
    }
};

const confirmAsync = async (title: string, message: string): Promise<boolean> => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }
    console.log('[CONFIRM]', title, message);
    return Promise.resolve(true);
};

// ===================== КОМПОНЕНТ ЗУМА ИЗОБРАЖЕНИЙ =====================
const ImageZoomModal = ({
                            image,
                            visible,
                            onClose
                        }: { image: any; visible: boolean; onClose: () => void; }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], { useNativeDriver: true });
    const onPinchStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <GestureHandlerRootView style={styles.gestureContainer}>
                    <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
                        <Animated.View style={styles.animatedContainer}>
                            <Animated.Image
                                source={image}
                                style={[styles.zoomedImage, { transform: [{ scale }] }]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </PinchGestureHandler>
                </GestureHandlerRootView>

                <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>

                <View style={styles.zoomHintContainer}>
                    <Text style={styles.zoomHint}>🔍 Двумя пальцами увеличивай фото</Text>
                </View>
            </View>
        </Modal>
    );
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
    onSkip: () => void;
    showMap: boolean;
    onToggleMap: () => void;
};

const StepCard = memo((props: StepCardProps) => {
    const {
        step, index, attempts, hintVisible, savedAnswer,
        onSubmit, onWrongAttempt, onToggleHint, onSkip,
        showMap, onToggleMap
    } = props;

    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [hasOrganic, setHasOrganic] = useState(false);
    const [hasMapsme, setHasMapsme] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setValue(''); setError('');
    }, [step.id]);

    // Проверяем наличие Organic Maps / MAPS.ME при смене шага
    useEffect(() => {
        (async () => {
            try {
                const om = await Linking.canOpenURL('om://map');
                const om2 = await Linking.canOpenURL('organicmaps://');
                setHasOrganic(Boolean(om || om2));
            } catch {}
            try {
                const mm = await Linking.canOpenURL('mapsme://map');
                setHasMapsme(Boolean(mm));
            } catch {}
        })();
    }, [step.id]);

    const openCandidates = async (cands: Array<string | undefined>) => {
        for (const url of cands) {
            if (!url) continue;
            try {
                const ok = await Linking.canOpenURL(url);
                if (ok) { await Linking.openURL(url); return; }
            } catch {}
        }
        notify('Не удалось открыть карты. Проверьте, что установлено нужное приложение.');
    };

    const openInMap = async (app: 'google' | 'apple' | 'yandex' | 'organic' | 'mapsme') => {
        const { lat, lng } = step;
        const name = encodeURIComponent(step.title || 'Point');
        const urls = {
            google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            apple: `http://maps.apple.com/?ll=${lat},${lng}`,
            yandex: `https://yandex.ru/maps/?pt=${lng},${lat}&z=15`,
            organic_1: `om://map?ll=${lat},${lng}&z=17`,
            organic_2: `organicmaps://map?ll=${lat},${lng}&z=17`,
            organic_web: `https://omaps.app/?lat=${lat}&lon=${lng}&zoom=17`,
            mapsme: `mapsme://map?ll=${lat},${lng}&zoom=17&n=${name}`,
            geo: Platform.OS === 'android' ? `geo:${lat},${lng}?q=${lat},${lng}(${name})` : undefined,
        } as const;

        if (app === 'organic') return openCandidates([urls.organic_1, urls.organic_2, urls.organic_web, urls.geo, urls.google]);
        if (app === 'mapsme')  return openCandidates([urls.mapsme, urls.geo, urls.google]);
        return openCandidates([urls[app]]);
    };

    const copyCoords = async () => {
        await Clipboard.setStringAsync(`${step.lat.toFixed(6)}, ${step.lng.toFixed(6)}`);
        notify('Координаты скопированы');
    };

    const shake = () => {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleCheck = () => {
        const trimmedValue = value.trim();
        if (step.id === 'intro') { onSubmit('start'); return; }
        if (!trimmedValue) { setError('Введите ответ'); shake(); Vibration.vibrate(50); return; }

        const normalized = step.inputType === 'number'
            ? trimmedValue.replace(',', '.').trim()
            : trimmedValue.toLowerCase().replace(/\s+/g, ' ').trim();

        const ok = step.answer(normalized);
        if (ok) {
            setError(''); Vibration.vibrate(100); onSubmit(trimmedValue); Keyboard.dismiss();
        } else {
            setError('Неверный ответ'); onWrongAttempt(); shake(); Vibration.vibrate(200);
        }
    };

    const isPassed = !!savedAnswer && step.id !== 'intro';
    const showHintAfter = 2;

    return (
        <View style={styles.card}>
            {/* Заголовок */}
            <View style={styles.cardHeader}>
                <View style={[styles.stepNumber, isPassed && styles.stepNumberCompleted]}>
                    <Text style={styles.stepNumberText}>{step.id === 'intro' ? '🎯' : index}</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Pressable onPress={() => openInMap(Platform.OS === 'ios' ? 'apple' : 'google')}>
                        <Text style={styles.location}>{step.location}</Text>
                    </Pressable>
                </View>
                {isPassed && (
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>✓</Text>
                    </View>
                )}
            </View>

            {/* Легенда — показываем полностью, без «Развернуть/Свернуть» */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Легенда</Text>
                <Text style={styles.storyText}>{step.story}</Text>
            </View>

            {/* Задание */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Задание</Text>
                <Text style={styles.taskText}>{step.task}</Text>

                {step.id !== 'intro' && !isPassed && (
                    <>
                        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                            <TextInput
                                style={[styles.input, error ? styles.inputError : null]}
                                placeholder="Ваш ответ..."
                                value={value}
                                onChangeText={setValue}
                                onSubmitEditing={handleCheck}
                                returnKeyType="done"
                                keyboardType={
                                    step.inputType === 'number'
                                        ? (Platform.OS === 'ios' ? 'number-pad' : 'numeric')
                                        : 'default'
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </Animated.View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <View style={styles.actions}>
                            <Pressable style={styles.primaryButton} onPress={handleCheck} hitSlop={6}>
                                <Text style={styles.buttonText}>Проверить</Text>
                            </Pressable>

                            {step.hint && (
                                <Pressable style={styles.secondaryButton} onPress={onToggleHint} hitSlop={6}>
                                    <Text style={styles.secondaryButtonText}>
                                        {hintVisible ? 'Скрыть подсказку' : 'Подсказка'}
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable style={styles.ghostButton} onPress={onSkip} hitSlop={6}>
                                <Text style={styles.ghostButtonText}>Пропустить</Text>
                            </Pressable>
                        </View>

                        {step.hint && attempts < showHintAfter && !hintVisible && (
                            <Text style={styles.hintPrompt}>
                                Подсказка откроется после {showHintAfter - attempts} попыток
                            </Text>
                        )}
                    </>
                )}

                {hintVisible && step.hint && (
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintText}>💡 {step.hint}</Text>
                    </View>
                )}

                {isPassed && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerLabel}>Ваш ответ:</Text>
                        <Text style={styles.answerValue}>{savedAnswer}</Text>
                    </View>
                )}
            </View>

            {/* Локация */}
            {step.id !== 'intro' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Локация</Text>

                    <View style={styles.mapActions}>
                        <Pressable style={styles.mapButton} onPress={() => openInMap('google')} hitSlop={6}>
                            <Text style={styles.mapButtonText}>Google Maps</Text>
                        </Pressable>
                        {Platform.OS === 'ios' && (
                            <Pressable style={styles.mapButton} onPress={() => openInMap('apple')} hitSlop={6}>
                                <Text style={styles.mapButtonText}>Apple Maps</Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.mapButton} onPress={() => openInMap('yandex')} hitSlop={6}>
                            <Text style={styles.mapButtonText}>Yandex Maps</Text>
                        </Pressable>
                        {hasOrganic && (
                            <Pressable style={styles.mapButton} onPress={() => openInMap('organic')} hitSlop={6}>
                                <Text style={styles.mapButtonText}>Organic Maps</Text>
                            </Pressable>
                        )}
                        {hasMapsme && (
                            <Pressable style={styles.mapButton} onPress={() => openInMap('mapsme')} hitSlop={6}>
                                <Text style={styles.mapButtonText}>MAPS.ME</Text>
                            </Pressable>
                        )}
                        <Pressable style={styles.mapButton} onPress={copyCoords} hitSlop={6}>
                            <Text style={styles.mapButtonText}>Координаты</Text>
                        </Pressable>

                        {/* Явно: это фото, не интерактивная карта */}
                        <Pressable style={styles.mapPhotoButton} onPress={onToggleMap} hitSlop={8}>
                            <Text style={styles.mapPhotoButtonText}>
                                {showMap ? 'Скрыть фото локации' : 'Показать фото локации'}
                            </Text>
                        </Pressable>
                    </View>

                    {showMap && step.image && (
                        <>
                            <Text style={styles.photoHint}>Это статичное фото-подсказка, не интерактивная карта.</Text>
                            <Pressable style={styles.imagePreview} onPress={() => setImageModalVisible(true)}>
                                <Image source={step.image} style={styles.previewImage} />
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.overlayText}>Нажмите для увеличения</Text>
                                </View>
                            </Pressable>
                        </>
                    )}

                    <ImageZoomModal
                        image={step.image}
                        visible={imageModalVisible}
                        onClose={() => setImageModalVisible(false)}
                    />
                </View>
            )}

            {/* Кнопка старта для интро */}
            {step.id === 'intro' && (
                <Pressable style={styles.startButton} onPress={handleCheck} hitSlop={6}>
                    <Text style={styles.startButtonText}>Начать квест</Text>
                </Pressable>
            )}
        </View>
    );
});

// ===================== ОСНОВНОЙ КОМПОНЕНТ =====================
export function QuestWizard({
                                title, steps, finale, intro, storageKey = 'quest_progress', city
                            }: QuestWizardProps) {
    const allSteps = useMemo(() => intro ? [intro, ...steps] : steps, [intro, steps]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [unlockedIndex, setUnlockedIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [attempts, setAttempts] = useState<Record<string, number>>({});
    const [hints, setHints] = useState<Record<string, boolean>>({});
    const [showMap, setShowMap] = useState(true);
    const suppressSave = useRef(false);

    // компактная навигация на узких экранах
    const [screenW, setScreenW] = useState(Dimensions.get('window').width);
    const compactNav = screenW < 420;
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => setScreenW(window.width));
        return () => (sub as any)?.remove?.();
    }, []);

    // Загрузка прогресса
    useEffect(() => {
        const loadProgress = async () => {
            try {
                suppressSave.current = true;
                const saved = await AsyncStorage.getItem(storageKey);
                if (saved) {
                    const data = JSON.parse(saved);
                    setCurrentIndex(data.index ?? 0);
                    setUnlockedIndex(data.unlocked ?? 0);
                    setAnswers(data.answers ?? {});
                    setAttempts(data.attempts ?? {});
                    setHints(data.hints ?? {});
                    setShowMap(data.showMap !== undefined ? data.showMap : true);
                } else {
                    setCurrentIndex(0); setUnlockedIndex(0);
                    setAnswers({}); setAttempts({}); setHints({}); setShowMap(true);
                }
            } catch (error) {
                console.log('Error loading progress:', error);
            } finally {
                setTimeout(() => { suppressSave.current = false; }, 0);
            }
        };

        loadProgress();
    }, [storageKey]);

    // Сохранение прогресса
    useEffect(() => {
        const saveProgress = async () => {
            if (suppressSave.current) return;
            try {
                await AsyncStorage.setItem(storageKey, JSON.stringify({
                    index: currentIndex, unlocked: unlockedIndex,
                    answers, attempts, hints, showMap
                }));
            } catch (error) {
                console.log('Error saving progress:', error);
            }
        };
        saveProgress();
    }, [currentIndex, unlockedIndex, answers, attempts, hints, showMap, storageKey]);

    const currentStep = allSteps[currentIndex];
    const completedSteps = steps.filter(step => answers[step.id]);
    const progress = steps.length > 0 ? completedSteps.length / steps.length : 0;

    const handleAnswer = (step: QuestStep, answer: string) => {
        setAnswers(prev => ({ ...prev, [step.id]: answer }));
        setAttempts(prev => ({ ...prev, [step.id]: 0 }));
        setHints(prev => ({ ...prev, [step.id]: false }));
        const nextIndex = Math.min(currentIndex + 1, allSteps.length - 1);
        setCurrentIndex(nextIndex);
        setUnlockedIndex(prev => Math.max(prev, nextIndex));
    };

    const handleWrongAttempt = (step: QuestStep) => {
        setAttempts(prev => ({ ...prev, [step.id]: (prev[step.id] || 0) + 1 }));
    };

    const toggleHint = (step: QuestStep) => {
        setHints(prev => ({ ...prev, [step.id]: !prev[step.id] }));
    };

    const toggleMap = () => setShowMap(prev => !prev);

    const skipStep = () => {
        const nextIndex = Math.min(currentIndex + 1, allSteps.length - 1);
        setCurrentIndex(nextIndex);
        setUnlockedIndex(prev => Math.max(prev, nextIndex));
    };

    const goToStep = (index: number) => {
        if (index <= unlockedIndex) setCurrentIndex(index);
    };

    const resetQuest = async () => {
        const ok = await confirmAsync('Сбросить прогресс?', 'Все ваши ответы будут удалены.');
        if (!ok) return;

        try {
            suppressSave.current = true;
            await AsyncStorage.removeItem(storageKey);

            // Жёсткий сброс локального стейта
            setCurrentIndex(0);
            setUnlockedIndex(0);
            setAnswers({});
            setAttempts({});
            setHints({});
            setShowMap(true);

            // Записываем «чистый» снапшот
            await AsyncStorage.setItem(
                storageKey,
                JSON.stringify({ index: 0, unlocked: 0, answers: {}, attempts: {}, hints: {}, showMap: true })
            );
            notify('Прогресс очищен');
        } catch (e) {
            console.log('Error resetting progress:', e);
        } finally {
            setTimeout(() => { suppressSave.current = false; }, 0);
        }
    };

    const allCompleted = completedSteps.length === steps.length;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    {/* Шапка */}
                    <View style={styles.header}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{title}</Text>
                            <Pressable onPress={resetQuest} style={styles.resetButton} hitSlop={6}>
                                <Text style={styles.resetText}>Сбросить</Text>
                            </Pressable>
                        </View>

                        {/* Прогресс */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{completedSteps.length} / {steps.length} завершено</Text>
                        </View>

                        {/* Навигация по шагам */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsNavigation}>
                            {allSteps.map((s, i) => {
                                const isActive = i === currentIndex;
                                const isUnlocked = i <= unlockedIndex;
                                const isDone = !!answers[s.id] && s.id !== 'intro';

                                if (compactNav) {
                                    // компакт: маленькие кружочки с номером
                                    return (
                                        <Pressable
                                            key={s.id}
                                            onPress={() => goToStep(i)}
                                            disabled={!isUnlocked}
                                            style={[
                                                styles.stepDotMini,
                                                isUnlocked && styles.stepDotMiniUnlocked,
                                                isActive && styles.stepDotMiniActive,
                                                isDone && styles.stepDotMiniDone,
                                                !isUnlocked && styles.stepDotMiniLocked
                                            ]}
                                            hitSlop={6}
                                        >
                                            <Text style={[
                                                styles.stepDotMiniText,
                                                (isActive || isDone) && { color: '#FFF' }
                                            ]}>
                                                {s.id === 'intro' ? '🎯' : i}
                                            </Text>
                                        </Pressable>
                                    );
                                }

                                // обычный режим: плашки с названием
                                return (
                                    <Pressable
                                        key={s.id}
                                        onPress={() => goToStep(i)}
                                        disabled={!isUnlocked}
                                        style={[
                                            styles.stepPill,
                                            styles.stepPillUnlocked,
                                            isActive && styles.stepPillActive,
                                            isDone && styles.stepPillDone,
                                            !isUnlocked && styles.stepPillLocked
                                        ]}
                                        hitSlop={6}
                                    >
                                        <Text style={[styles.stepPillIndex, (isActive || isDone) && { color: '#FFF' }]}>
                                            {s.id === 'intro' ? '🎯' : i}
                                        </Text>
                                        <Text
                                            style={[styles.stepPillTitle, (isActive || isDone) && { color: '#FFF' }]}
                                            numberOfLines={1}
                                        >
                                            {s.id === 'intro' ? 'Старт' : s.title}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        {compactNav ? (
                            <Text style={styles.navActiveTitle} numberOfLines={1}>
                                {currentIndex === 0 ? 'Старт' : allSteps[currentIndex]?.title}
                            </Text>
                        ) : (
                            <Text style={styles.navHint}>Нажмите на шаг, чтобы перейти</Text>
                        )}
                    </View>

                    {/* Контент */}
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={Keyboard.dismiss}
                    >
                        {currentStep && (
                            <StepCard
                                step={currentStep}
                                index={currentIndex}
                                attempts={attempts[currentStep.id] || 0}
                                hintVisible={hints[currentStep.id] || false}
                                savedAnswer={answers[currentStep.id]}
                                onSubmit={(answer) => handleAnswer(currentStep, answer)}
                                onWrongAttempt={() => handleWrongAttempt(currentStep)}
                                onToggleHint={() => toggleHint(currentStep)}
                                onSkip={skipStep}
                                showMap={showMap}
                                onToggleMap={toggleMap}
                            />
                        )}

                        {/* Полная карта маршрута */}
                        {steps.length > 0 && (
                            <View style={styles.fullMapSection}>
                                <Text style={styles.sectionTitle}>Полный маршрут квеста</Text>
                                <QuestFullMap steps={steps} height={300} title={`Карта квеста: ${title}`} />
                            </View>
                        )}

                        {/* Белкрай */}
                        {city && <View style={{ height: 28 }} />}
                        {city && (
                            <BelkrajWidget
                                points={[{ id: 1, address: city.name ?? title, lat: city.lat, lng: city.lng }]}
                                countryCode={city.countryCode ?? 'BY'}
                                collapsedHeight={520}
                                expandedHeight={1200}
                                className="belkraj-slot"
                            />
                        )}

                        {/* Завершение */}
                        {allCompleted && (
                            <View style={styles.completionScreen}>
                                <Text style={styles.completionTitle}>🎉 Квест завершен!</Text>
                                <Text style={styles.completionText}>{finale.text}</Text>
                                {finale.video && (
                                    <Video source={finale.video} style={styles.video} resizeMode={ResizeMode.CONTAIN} useNativeControls />
                                )}
                            </View>
                        )}

                        <View style={{ height: SPACING.xl }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

// ===================== СТИЛИ =====================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    header: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm,
    },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 },
    resetButton: { padding: SPACING.xs },
    resetText: { color: COLORS.error, fontWeight: '600', fontSize: 14 },

    progressContainer: { marginBottom: SPACING.sm },
    progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.xs },
    progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
    progressText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },

    // Навигация по шагам
    stepsNavigation: { flexDirection: 'row', marginTop: 6 },

    // Плашки (широкие экраны)
    stepPill: {
        flexDirection: 'row', alignItems: 'center', borderRadius: 999,
        paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: COLORS.border,
        marginRight: 6, backgroundColor: '#FFF', maxWidth: 240,
    },
    stepPillUnlocked: { backgroundColor: '#FFF' },
    stepPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
    stepPillDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
    stepPillLocked: { opacity: 0.5 },
    stepPillIndex: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginRight: 6 },
    stepPillTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text },

    // Компактные кружочки (узкие экраны)
    stepDotMini: {
        width: 32, height: 32, borderRadius: 16, marginRight: 6,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFF',
    },
    stepDotMiniUnlocked: { opacity: 1 },
    stepDotMiniActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
    stepDotMiniDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
    stepDotMiniLocked: { opacity: 0.45 },
    stepDotMiniText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

    navActiveTitle: { marginTop: 6, fontSize: 12, fontWeight: '600', color: COLORS.text, opacity: 0.9 },
    navHint: { fontSize: 11, color: COLORS.textSecondary, marginTop: 6 },

    content: { flex: 1, padding: SPACING.md },

    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.md },
    stepNumber: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(249,115,22,0.12)', alignItems: 'center', justifyContent: 'center',
    },
    stepNumberCompleted: { backgroundColor: 'rgba(34,197,94,0.20)' },
    stepNumberText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
    headerContent: { flex: 1 },
    stepTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    location: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
    completedBadge: {
        backgroundColor: COLORS.success, borderRadius: 12, padding: 4, width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    },
    completedText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    section: { marginBottom: SPACING.lg },
    sectionTitle: {
        fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm,
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    storyText: { fontSize: 14, lineHeight: 20, color: COLORS.text },

    taskText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
    input: {
        backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
        padding: SPACING.md, fontSize: 16, marginBottom: SPACING.sm,
    },
    inputError: { borderColor: COLORS.error },
    errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.md },

    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
    primaryButton: {
        backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: 12,
        borderRadius: 10, flex: 1, minWidth: '45%',
    },
    buttonText: { color: '#FFF', fontWeight: '600', textAlign: 'center', fontSize: 14 },
    secondaryButton: {
        borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: 12,
        borderRadius: 10, backgroundColor: '#FFF', flex: 1, minWidth: '45%',
    },
    secondaryButtonText: { color: COLORS.text, fontWeight: '600', textAlign: 'center', fontSize: 14 },
    ghostButton: { paddingHorizontal: SPACING.lg, paddingVertical: 12, borderRadius: 10, flex: 1, minWidth: '45%' },
    ghostButtonText: { color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center', fontSize: 14 },

    hintPrompt: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs },
    hintContainer: { backgroundColor: 'rgba(34,197,94,0.10)', padding: SPACING.md, borderRadius: 8, marginTop: SPACING.md },
    hintText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
    answerContainer: { backgroundColor: 'rgba(34,197,94,0.12)', padding: SPACING.md, borderRadius: 8, marginTop: SPACING.md },
    answerLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
    answerValue: { fontSize: 16, fontWeight: '600', color: COLORS.text },

    mapActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    mapButton: {
        backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border,
        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, minWidth: 110,
    },
    mapButtonText: { color: COLORS.text, fontSize: 12, fontWeight: '500', textAlign: 'center' },

    // Выделенная кнопка для фото локации
    mapPhotoButton: {
        borderWidth: 1, borderColor: COLORS.primaryDark, backgroundColor: COLORS.chip,
        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999,
    },
    mapPhotoButtonText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '700', textAlign: 'center' },

    photoHint: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.xs },

    imagePreview: { height: 120, borderRadius: 8, overflow: 'hidden', position: 'relative' },
    previewImage: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 6, alignItems: 'center',
    },
    overlayText: { color: '#FFF', fontSize: 12, fontWeight: '500' },

    startButton: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: 10, alignItems: 'center' },
    startButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    fullMapSection: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md },

    completionScreen: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, alignItems: 'center', marginTop: SPACING.md },
    completionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.success, marginBottom: SPACING.md, textAlign: 'center' },
    completionText: { fontSize: 16, color: COLORS.text, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
    video: { width: '100%', height: 200, borderRadius: 8 },

    // Модалка зума
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    gestureContainer: { flex: 1, width: '100%' },
    animatedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    zoomedImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
    closeButton: {
        position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.6)',
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    },
    closeButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    zoomHintContainer: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
    zoomHint: { color: '#FFF', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 6 },
});

export default QuestWizard;
