import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import { Button as PaperButton, Menu } from 'react-native-paper';

export default function PaginationComponent({
                                                currentPage,
                                                itemsPerPage,
                                                itemsPerPageOptions,
                                                onPageChange,
                                                onItemsPerPageChange,
                                                totalItems,
                                            }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    const [menuVisible, setMenuVisible] = useState(false);
    const [pageInput, setPageInput] = useState(currentPage + 1); // Человеческий счёт страниц

    const handlePageChange = (newPage) => {
        const page = Math.min(Math.max(newPage - 1, 0), totalPages - 1); // гарантируем границы
        setPageInput(page + 1);
        onPageChange(page);
    };

    return (
        <View style={styles.paginationContainer}>
            {/* Информация о странице */}
            <View style={styles.pageInfoContainer}>
                <Text style={styles.pageInfo}>Страница</Text>
                <TextInput
                    style={styles.pageInput}
                    value={String(pageInput)}
                    keyboardType="numeric"
                    onChangeText={(text) => setPageInput(text.replace(/[^0-9]/g, ''))}
                    onSubmitEditing={() => handlePageChange(Number(pageInput))}
                />
                <Text style={styles.pageInfo}>из {totalPages}</Text>
            </View>

            {/* Кнопки "Назад" и "Вперед" */}
            <View style={styles.buttonGroup}>
                <PaperButton
                    mode="outlined"
                    onPress={() => handlePageChange(currentPage)}
                    disabled={currentPage === 0}
                    style={styles.button}
                >
                    Назад
                </PaperButton>

                <PaperButton
                    mode="outlined"
                    onPress={() => handlePageChange(currentPage + 2)}
                    disabled={currentPage + 1 >= totalPages}
                    style={styles.button}
                >
                    Вперед
                </PaperButton>
            </View>

            {/* Выбор количества на странице */}
            <View style={styles.itemsPerPageWrapper}>
                <Text style={styles.itemsPerPageText}>Показывать по:</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <PaperButton
                            mode="contained"
                            onPress={() => setMenuVisible(true)}
                            style={styles.itemsPerPageButton}
                        >
                            {itemsPerPage}
                        </PaperButton>
                    }
                >
                    {itemsPerPageOptions.map((option) => (
                        <Menu.Item
                            key={option}
                            onPress={() => {
                                setMenuVisible(false);
                                onItemsPerPageChange(option);
                            }}
                            title={`${option}`}
                        />
                    ))}
                </Menu>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        gap: 10,
    },
    pageInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pageInfo: {
        fontSize: 14,
        color: '#555',
    },
    pageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 40,
        textAlign: 'center',
        borderRadius: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        minWidth: 80,
        justifyContent: 'center',
    },
    itemsPerPageWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemsPerPageText: {
        fontSize: 14,
        color: '#555',
    },
    itemsPerPageButton: {
        backgroundColor: '#ff7f50',
        height: 30,
        justifyContent: 'center',
    },
});
