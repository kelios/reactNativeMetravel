import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
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
    const totalPages = travelsData?.total ? Math.ceil(travelsData.total / itemsPerPage) : 1;

    return (
        <View style={styles.listMenu}>
            {/* Отображение количества найденных объектов */}
            {!!travelsData?.total && (
                <Text style={styles.resultsCount}>
                    Найдено {travelsData.total} объектов
                </Text>
            )}

            {/* Список объектов */}
            <FlatList
                data={travelsData?.data || []}
                renderItem={({ item }) => <AddressListItem travel={item} />}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={
                    <View style={styles.emptyList}>
                        <Text>Нет данных для отображения</Text>
                    </View>
                }
                contentContainerStyle={styles.flatListContent}
            />

            {/* Пагинация */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    listMenu: {
        flex: 1,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        padding: 10,
    },
    resultsCount: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
    },
    flatListContent: {
        flexGrow: 1, // Чтобы FlatList занимал всё доступное пространство
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    containerPaginator: {
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 10,
        paddingBottom: 10,
    },
    pagination: {
        flexWrap: 'nowrap',
        alignSelf: 'flex-start',
    },
});

export default TravelListPanel;