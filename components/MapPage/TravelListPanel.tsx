import React from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import AddressListItem from '@/components/AddressListItem';

const TravelListPanel = ({
                             travelsData,
                             currentPage,
                             itemsPerPage,
                             itemsPerPageOptions,
                             onPageChange,
                             onItemsPerPageChange,
                         }) => {
    const isLoading = !travelsData; // Пока нет данных — считаем, что идёт загрузка
    const totalPages = travelsData?.total ? Math.ceil(travelsData.total / itemsPerPage) : 1;

    return (
        <View style={styles.listMenu}>
            {/* Информация о количестве найденных объектов */}
            {!!travelsData?.total && (
                <Text style={styles.resultsCount}>
                    Найдено {travelsData.total} объектов
                </Text>
            )}

            {/* Индикатор загрузки */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6AAAAA" />
                </View>
            ) : (
                <FlatList
                    data={travelsData?.data || []}
                    renderItem={({ item }) => <AddressListItem travel={item} />}
                    keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyList}>
                            <Text>Нет данных для отображения</Text>
                        </View>
                    }
                    contentContainerStyle={styles.flatListContent}
                />
            )}

            {/* Пагинация */}
            {!!travelsData?.total && (
                <View style={styles.containerPaginator}>
                    <DataTable>
                        <DataTable.Pagination
                            page={currentPage}
                            numberOfPages={totalPages}
                            onPageChange={onPageChange}
                            label={`${currentPage + 1} из ${totalPages}`}
                            showFastPaginationControls
                            numberOfItemsPerPageList={itemsPerPageOptions}
                            numberOfItemsPerPage={itemsPerPage}
                            onItemsPerPageChange={onItemsPerPageChange}
                            style={styles.pagination}
                        />
                    </DataTable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    listMenu: {
        flex: 1,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    resultsCount: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
    },
    flatListContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    emptyList: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    containerPaginator: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 10,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    pagination: {
        flexWrap: 'nowrap',
        alignSelf: 'flex-start',
    },
});

export default TravelListPanel;
