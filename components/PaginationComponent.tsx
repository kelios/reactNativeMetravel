// src/components/PaginationComponent.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, StyleSheet, useWindowDimensions, Platform, TouchableOpacity } from "react-native";
import { IconButton, Menu } from "react-native-paper";

type Props = {
    currentPage: number; // 0-based
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    onPageChange: (page: number) => void; // 0-based
    onItemsPerPageChange: (n: number) => void;
    totalItems: number;
};

function PaginationComponent({
                                 currentPage,
                                 itemsPerPage,
                                 itemsPerPageOptions,
                                 onPageChange,
                                 onItemsPerPageChange,
                                 totalItems,
                             }: Props) {
    const { width } = useWindowDimensions();
    const isMobile = width < 480;
    const isVerySmall = width < 380;

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1))),
        [totalItems, itemsPerPage]
    );

    const [pageInput, setPageInput] = useState(String(currentPage + 1));
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        setPageInput(String(currentPage + 1));
    }, [currentPage]);

    const goToPage1Based = useCallback(
        (val: string | number) => {
            const n = typeof val === "number" ? val : parseInt(val as string, 10);
            if (!Number.isFinite(n)) {
                setPageInput(String(currentPage + 1));
                return;
            }
            const oneBased = Math.min(Math.max(n, 1), totalPages);
            const zeroBased = oneBased - 1;
            setPageInput(String(oneBased));
            if (zeroBased !== currentPage) onPageChange(zeroBased);
        },
        [currentPage, totalPages, onPageChange]
    );

    const goPrev = useCallback(() => {
        if (currentPage <= 0) return;
        onPageChange(currentPage - 1);
    }, [currentPage, onPageChange]);

    const goNext = useCallback(() => {
        if (currentPage + 1 >= totalPages) return;
        onPageChange(currentPage + 1);
    }, [currentPage, totalPages, onPageChange]);

    // Минималистичный вариант для очень маленьких экранов
    if (isVerySmall) {
        return (
            <View style={[styles.bar, styles.barMobile]}>
                <View style={styles.centerContainer}>
                    <View style={styles.minimalNav}>
                        <IconButton
                            icon="chevron-left"
                            size={16}
                            onPress={goPrev}
                            disabled={currentPage === 0}
                            style={styles.iconMinimal}
                            accessibilityLabel="Предыдущая страница"
                        />

                        <Text style={styles.minimalText}>
                            {currentPage + 1}/{totalPages}
                        </Text>

                        <IconButton
                            icon="chevron-right"
                            size={16}
                            onPress={goNext}
                            disabled={currentPage + 1 >= totalPages}
                            style={styles.iconMinimal}
                            accessibilityLabel="Следующая страница"
                        />

                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TouchableOpacity
                                    style={styles.minimalItemsButton}
                                    onPress={() => setMenuVisible(true)}
                                    accessibilityLabel="Элементов на странице"
                                >
                                    <Text style={styles.minimalItemsText}>{itemsPerPage}</Text>
                                </TouchableOpacity>
                            }
                        >
                            {itemsPerPageOptions.map((option) => (
                                <Menu.Item
                                    key={option}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        if (option !== itemsPerPage) onItemsPerPageChange(option);
                                    }}
                                    title={`${option}`}
                                />
                            ))}
                        </Menu>
                    </View>
                </View>
            </View>
        );
    }

    // Компактный вариант для мобильных
    if (isMobile) {
        return (
            <View style={[styles.bar, styles.barMobile]}>
                <View style={styles.centerContainer}>
                    <View style={styles.mobileNav}>
                        <IconButton
                            icon="chevron-left"
                            size={18}
                            onPress={goPrev}
                            disabled={currentPage === 0}
                            style={styles.iconMobile}
                            accessibilityLabel="Предыдущая страница"
                        />

                        <View style={styles.mobileInputContainer}>
                            <TextInput
                                style={styles.mobileInput}
                                value={pageInput}
                                keyboardType="number-pad"
                                maxLength={4}
                                onChangeText={(t) => setPageInput(t.replace(/[^0-9]/g, ""))}
                                onSubmitEditing={() => goToPage1Based(pageInput)}
                                returnKeyType="done"
                                accessibilityLabel="Текущая страница"
                            />
                            <Text style={styles.mobileTotal}>/ {totalPages}</Text>
                        </View>

                        <IconButton
                            icon="chevron-right"
                            size={18}
                            onPress={goNext}
                            disabled={currentPage + 1 >= totalPages}
                            style={styles.iconMobile}
                            accessibilityLabel="Следующая страница"
                        />

                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TouchableOpacity
                                    style={styles.mobileItemsButton}
                                    onPress={() => setMenuVisible(true)}
                                    accessibilityLabel="Элементов на странице"
                                >
                                    <Text style={styles.mobileItemsText}>{itemsPerPage}</Text>
                                </TouchableOpacity>
                            }
                        >
                            {itemsPerPageOptions.map((option) => (
                                <Menu.Item
                                    key={option}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        if (option !== itemsPerPage) onItemsPerPageChange(option);
                                    }}
                                    title={`${option} на стр.`}
                                />
                            ))}
                        </Menu>
                    </View>
                </View>
            </View>
        );
    }

    // Полная версия для десктопов
    return (
        <View style={styles.bar}>
            <View style={styles.centerContainer}>
                <View style={styles.desktopNav}>
                    <IconButton
                        icon="chevron-left"
                        size={18}
                        onPress={goPrev}
                        disabled={currentPage === 0}
                        style={styles.iconDesktop}
                        accessibilityLabel="Предыдущая страница"
                    />

                    <View style={styles.desktopInputContainer}>
                        <Text style={styles.desktopLabel}>Стр.</Text>
                        <TextInput
                            style={styles.desktopInput}
                            value={pageInput}
                            keyboardType="number-pad"
                            maxLength={4}
                            onChangeText={(t) => setPageInput(t.replace(/[^0-9]/g, ""))}
                            onSubmitEditing={() => goToPage1Based(pageInput)}
                            returnKeyType="done"
                        />
                        <Text style={styles.desktopTotal}>из {totalPages}</Text>
                    </View>

                    <IconButton
                        icon="chevron-right"
                        size={18}
                        onPress={goNext}
                        disabled={currentPage + 1 >= totalPages}
                        style={styles.iconDesktop}
                        accessibilityLabel="Следующая страница"
                    />

                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <TouchableOpacity
                                style={styles.desktopItemsButton}
                                onPress={() => setMenuVisible(true)}
                                accessibilityLabel="Элементов на странице"
                            >
                                <Text style={styles.desktopItemsText}>{itemsPerPage}</Text>
                                <Text style={styles.desktopItemsIcon}>▼</Text>
                            </TouchableOpacity>
                        }
                    >
                        {itemsPerPageOptions.map((option) => (
                            <Menu.Item
                                key={option}
                                onPress={() => {
                                    setMenuVisible(false);
                                    if (option !== itemsPerPage) onItemsPerPageChange(option);
                                }}
                                title={`${option} на странице`}
                            />
                        ))}
                    </Menu>
                </View>
            </View>
        </View>
    );
}

export default React.memo(PaginationComponent);

const styles = StyleSheet.create({
    bar: {
        borderTopWidth: 1,
        borderColor: "#e9e9e9",
        backgroundColor: "#fff",
        paddingVertical: 6,
        minHeight: 44,
    },
    barMobile: {
        paddingVertical: 4,
        minHeight: 40,
    },

    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Минималистичный вариант (<380px)
    minimalNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 8,
    },
    iconMinimal: {
        margin: 0,
        width: 28,
        height: 28,
    },
    minimalText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
        marginHorizontal: 4,
        minWidth: 40,
        textAlign: 'center',
    },
    minimalItemsButton: {
        backgroundColor: '#ff7f50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 4,
        minWidth: 28,
        alignItems: 'center',
    },
    minimalItemsText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    // Мобильный вариант (380-480px)
    mobileNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 8,
    },
    iconMobile: {
        margin: 0,
        width: 32,
        height: 32,
    },
    mobileInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    mobileInput: {
        width: 36,
        textAlign: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        fontSize: 14,
        fontWeight: '500',
    },
    mobileTotal: {
        fontSize: 12,
        color: '#666',
        marginLeft: 2,
    },
    mobileItemsButton: {
        backgroundColor: '#ff7f50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 4,
        minWidth: 28,
        alignItems: 'center',
    },
    mobileItemsText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    // Десктопный вариант (>480px)
    desktopNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 12,
    },
    iconDesktop: {
        margin: 0,
        width: 32,
        height: 32,
    },
    desktopInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginHorizontal: 4,
    },
    desktopLabel: {
        fontSize: 12,
        color: '#666',
    },
    desktopInput: {
        width: 36,
        textAlign: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        fontSize: 14,
        fontWeight: '500',
    },
    desktopTotal: {
        fontSize: 12,
        color: '#666',
    },
    desktopItemsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff7f50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 2,
        marginLeft: 4,
    },
    desktopItemsText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    desktopItemsIcon: {
        color: '#fff',
        fontSize: 10,
    },
});