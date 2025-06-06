/* Обновленный файл TravelListPanel.tsx — вынос кнопки "Очистить маршрут" наружу, адаптация под ScrollView */

import React, { useRef } from 'react';
import { FlatList, Text, View, StyleSheet, useWindowDimensions, Button as RNButton } from 'react-native';
import AddressListItem from '@/components/MapPage/AddressListItem';
import PaginationComponent from '@/components/PaginationComponent';

const TravelListPanel = ({
                             travelsData,
                             currentPage,
                             itemsPerPage,
                             itemsPerPageOptions,
                             onPageChange,
                             onItemsPerPageChange,
                             buildRouteTo, // ➔ новый проп
                         }) => {
    const isLoading = travelsData === null;
    const totalItems = travelsData?.length || 0;
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const listRef = useRef(null);

    const paginatedData =
        travelsData?.slice(
            currentPage * itemsPerPage,
            currentPage * itemsPerPage + itemsPerPage
        ) || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.resultsCount}>
                    Найдено {totalItems} объектов
                </Text>
            </View>

            <View style={styles.listContainer}>
                {isLoading ? (
                    <FlatList
                        data={Array.from({ length: itemsPerPage })}
                        keyExtractor={(_, index) => `skeleton-${index}`}
                        renderItem={() => <View style={styles.skeletonItem} />}
                        contentContainerStyle={[
                            styles.flatListContent,
                            { paddingBottom: isMobile ? 140 : 16 },
                        ]}
                    />
                ) : (
                    <FlatList
                        ref={listRef}
                        data={paginatedData}
                        renderItem={({ item }) => (
                            <View style={styles.itemWrapper}>
                                <AddressListItem travel={item} isMobile={isMobile} />
                            </View>
                        )}
                        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyText}>
                                    Ничего не найдено. Попробуйте изменить фильтры.
                                </Text>
                            </View>
                        }
                        contentContainerStyle={[
                            styles.flatListContent,
                            { paddingBottom: isMobile ? 140 : 16 },
                        ]}
                    />
                )}
            </View>

            {totalItems > 0 && (
                <View style={styles.paginationWrapper}>
                    <PaginationComponent
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        itemsPerPageOptions={itemsPerPageOptions}
                        onPageChange={onPageChange}
                        onItemsPerPageChange={onItemsPerPageChange}
                        totalItems={totalItems}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    header: {
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    listContainer: {
        flex: 1,
        minHeight: 200,
    },
    flatListContent: {
        paddingHorizontal: 0,
    },
    emptyList: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    skeletonItem: {
        height: 60,
        backgroundColor: '#f2f2f2',
        marginVertical: 6,
    },
    paginationWrapper: {
        marginTop: 12,
    },
    itemWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    clearRouteWrapper: {
        marginTop: 16,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
});

export default TravelListPanel;
