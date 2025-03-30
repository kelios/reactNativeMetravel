import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    View,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
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
    const isLoading = travelsData === null;
    const totalItems = travelsData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const isMobile = width <= 480;

    const paginatedData =
        travelsData?.slice(
            currentPage * itemsPerPage,
            currentPage * itemsPerPage + itemsPerPage
        ) || [];

    return (
        <View style={[styles.listMenu, { padding: isTablet ? 16 : 12 }]}>
            {totalItems > 0 && (
                <Text style={[
                    styles.resultsCount,
                    isMobile && { fontSize: 14, marginBottom: 8 },
                ]}>
                    Найдено {totalItems} объектов
                </Text>
            )}

            <View style={styles.listWrapper}>
                {isLoading ? (
                    <FlatList
                        data={Array.from({ length: itemsPerPage })}
                        keyExtractor={(_, index) => `skeleton-${index}`}
                        renderItem={() => <View style={styles.skeletonItem} />}
                        contentContainerStyle={styles.flatListContent}
                    />
                ) : (
                    <FlatList
                        data={paginatedData}
                        renderItem={({ item }) => <AddressListItem travel={item} />}
                        keyExtractor={(item, index) =>
                            item?.id?.toString() || index.toString()
                        }
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyText}>
                                    Ничего не найдено. Попробуйте изменить фильтры.
                                </Text>
                            </View>
                        }
                        contentContainerStyle={styles.flatListContent}
                    />
                )}
            </View>

            {totalItems > 0 && (
                <View style={styles.containerPaginatorWrapper}>
                    <View
                        style={[
                            styles.containerPaginatorFlex,
                            isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 4 },
                        ]}
                    >
                        <DataTable style={isMobile && { width: '100%' }}>
                            <DataTable.Pagination
                                page={currentPage}
                                numberOfPages={totalPages}
                                onPageChange={onPageChange}
                                label={`${currentPage + 1} из ${totalPages}`}
                                showFastPaginationControls
                                numberOfItemsPerPageList={itemsPerPageOptions}
                                numberOfItemsPerPage={itemsPerPage}
                                onItemsPerPageChange={onItemsPerPageChange}
                                style={[styles.pagination, isMobile && { marginTop: 4 }]}
                                labelStyle={isMobile && { fontSize: 12 }}
                            />
                        </DataTable>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    listMenu: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    resultsCount: {
        fontSize: 16,
        marginBottom: 12,
        fontWeight: '500',
        color: '#333',
    },
    listWrapper: {
        maxHeight: '60%',
        minHeight: 60,
    },
    flatListContent: {
        paddingBottom: 16,
        paddingHorizontal: 4,
    },
    emptyList: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    skeletonItem: {
        height: 60,
        borderRadius: 12,
        backgroundColor: '#f2f2f2',
        marginVertical: 6,
        marginHorizontal: 4,
    },
    containerPaginatorWrapper: {
        paddingHorizontal: 8,
        paddingBottom: 10,
    },
    containerPaginatorFlex: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        rowGap: 8,
        columnGap: 8,
    },
    pagination: {
        alignSelf: 'flex-start',
    },
});

export default TravelListPanel;
