import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Button as PaperButton, Menu, IconButton } from 'react-native-paper';

export default function PaginationComponent({
                                                currentPage,
                                                itemsPerPage,
                                                itemsPerPageOptions,
                                                onPageChange,
                                                onItemsPerPageChange,
                                                totalItems,
                                            }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [menuVisible, setMenuVisible] = useState(false);
    const [pageInput, setPageInput] = useState(currentPage + 1);
    const { width } = useWindowDimensions();
    const isMobile = width < 480;

    useEffect(() => {
        const newTotalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage >= newTotalPages) {
            const newPage = Math.max(0, newTotalPages - 1);
            setPageInput(newPage + 1);
            onPageChange(newPage);
        } else {
            setPageInput(currentPage + 1);
        }
    }, [itemsPerPage, totalItems]);

    const handlePageChange = (newPage) => {
        const page = Math.min(Math.max(newPage - 1, 0), totalPages - 1);
        setPageInput(page + 1);
        onPageChange(page);
    };

    return (
        <View style={[styles.paginationContainer, isMobile && styles.mobileContainer]}>
            <IconButton
                icon="chevron-left"
                size={20}
                onPress={() => handlePageChange(currentPage)}
                disabled={currentPage === 0}
            />

            <TextInput
                style={[styles.pageInput, isMobile && styles.pageInputMobile]}
                value={String(pageInput)}
                keyboardType="numeric"
                onChangeText={(text) => setPageInput(text.replace(/[^0-9]/g, ''))}
                onSubmitEditing={() => handlePageChange(Number(pageInput))}
            />
            <Text style={styles.totalPages}>/ {totalPages}</Text>

            <IconButton
                icon="chevron-right"
                size={20}
                onPress={() => handlePageChange(currentPage + 2)}
                disabled={currentPage + 1 >= totalPages}
            />

            <View style={styles.itemsPerPageWrapper}>
                <Text style={styles.pageLabel}>Показ:</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <PaperButton
                            mode="contained"
                            onPress={() => setMenuVisible(true)}
                            style={[styles.itemsPerPageButton, isMobile && styles.itemsPerPageButtonMobile]}
                            labelStyle={styles.dropdownLabel}
                        >
                            {itemsPerPage} ▼
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
        justifyContent: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        gap: 8,
        backgroundColor: '#fefefe',
    },
    mobileContainer: {
        position: 'sticky', // для web
        bottom: 0,
        zIndex: 10,
        backgroundColor: '#fefefe',
        paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    },
    pageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 6,
        paddingVertical: 2,
        width: 40,
        textAlign: 'center',
        borderRadius: 4,
        fontSize: 14,
    },
    pageInputMobile: {
        width: 34,
        fontSize: 12,
    },
    totalPages: {
        fontSize: 14,
        color: '#444',
    },
    itemsPerPageWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemsPerPageButton: {
        backgroundColor: '#ff7f50',
        height: 30,
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    itemsPerPageButtonMobile: {
        height: 26,
        paddingHorizontal: 6,
    },
    dropdownLabel: {
        fontSize: 12,
        color: '#fff',
    },
    pageLabel: {
        fontSize: 12,
        color: '#555',
    },
});
