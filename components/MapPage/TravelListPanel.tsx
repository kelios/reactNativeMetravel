import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    View,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
    const isMobile = width <= 768;

    const paginatedData = travelsData?.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
    ) || [];

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            onPageChange(page);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 3;

        // Всегда показываем первую страницу
        if (currentPage > 1) {
            pages.push(
                <TouchableOpacity
                    key={0}
                    onPress={() => handlePageChange(0)}
                    style={styles.pageItem}
                >
                    <Text style={styles.pageNumber}>1</Text>
                </TouchableOpacity>
            );

            if (currentPage > 2) {
                pages.push(
                    <Text key="left-dots" style={styles.ellipsis}>...</Text>
                );
            }
        }

        // Показываем текущую страницу и соседние
        const startPage = Math.max(0, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handlePageChange(i)}
                    style={[
                        styles.pageItem,
                        i === currentPage && styles.activePageItem
                    ]}
                >
                    <Text style={[
                        styles.pageNumber,
                        i === currentPage && styles.activePageNumber
                    ]}>
                        {i + 1}
                    </Text>
                </TouchableOpacity>
            );
        }

        // Показываем последнюю страницу если нужно
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(
                    <Text key="right-dots" style={styles.ellipsis}>...</Text>
                );
            }

            pages.push(
                <TouchableOpacity
                    key={totalPages - 1}
                    onPress={() => handlePageChange(totalPages - 1)}
                    style={styles.pageItem}
                >
                    <Text style={styles.pageNumber}>{totalPages}</Text>
                </TouchableOpacity>
            );
        }

        return pages;
    };

    return (
        <View style={styles.container}>
            {/* Шапка с количеством результатов */}
            <View style={styles.header}>
                <Text style={styles.resultsCount}>
                    Найдено {totalItems} объектов
                </Text>
            </View>

            {/* Основной список */}
            <View style={styles.listContainer}>
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
                        renderItem={({ item }) => (
                            <AddressListItem
                                travel={item}
                                isMobile={isMobile}
                            />
                        )}
                        keyExtractor={(item, index) =>
                            item?.id?.toString() || index.toString()
                        }
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 12 }} />
                        )}
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

            {/* Подвал с пагинацией и выбором количества */}
            {totalItems > 0 && (
                <View style={styles.footer}>
                    <View style={styles.paginationContainer}>
                        {/* Кнопки навигации */}
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                onPress={() => handlePageChange(0)}
                                disabled={currentPage === 0}
                                style={[
                                    styles.navButton,
                                    currentPage === 0 && styles.disabledButton
                                ]}
                            >
                                <MaterialIcons name="first-page" size={24} color={currentPage === 0 ? '#ccc' : '#333'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                style={[
                                    styles.navButton,
                                    currentPage === 0 && styles.disabledButton
                                ]}
                            >
                                <MaterialIcons name="chevron-left" size={24} color={currentPage === 0 ? '#ccc' : '#333'} />
                            </TouchableOpacity>
                        </View>

                        {/* Номера страниц */}
                        <View style={styles.pagesWrapper}>
                            {renderPageNumbers()}
                        </View>

                        {/* Кнопки навигации */}
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                onPress={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                style={[
                                    styles.navButton,
                                    currentPage === totalPages - 1 && styles.disabledButton
                                ]}
                            >
                                <MaterialIcons name="chevron-right" size={24} color={currentPage === totalPages - 1 ? '#ccc' : '#333'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handlePageChange(totalPages - 1)}
                                disabled={currentPage === totalPages - 1}
                                style={[
                                    styles.navButton,
                                    currentPage === totalPages - 1 && styles.disabledButton
                                ]}
                            >
                                <MaterialIcons name="last-page" size={24} color={currentPage === totalPages - 1 ? '#ccc' : '#333'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Выбор количества на странице */}
                    <View style={styles.itemsPerPageContainer}>
                        <Text style={styles.itemsPerPageLabel}>Показывать:</Text>
                        <View style={styles.itemsPerPageButtons}>
                            {itemsPerPageOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => onItemsPerPageChange(option)}
                                    style={[
                                        styles.itemsPerPageButton,
                                        itemsPerPage === option && styles.activeItemsPerPageButton
                                    ]}
                                >
                                    <Text style={[
                                        styles.itemsPerPageButtonText,
                                        itemsPerPage === option && styles.activeItemsPerPageButtonText
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        padding: 16,
    },
    header: {
        marginBottom: 16,
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
        paddingBottom: 16,
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
        borderRadius: 12,
        backgroundColor: '#f2f2f2',
        marginVertical: 6,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navigationButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navButton: {
        padding: 8,
        marginHorizontal: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    pagesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageItem: {
        minWidth: 32,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activePageItem: {
        backgroundColor: '#ff9f5a',
        borderRadius: 20,
    },
    pageNumber: {
        fontSize: 16,
        color: '#333',
    },
    activePageNumber: {
        color: '#fff',
        fontWeight: 'bold',
    },
    ellipsis: {
        fontSize: 16,
        color: '#666',
        paddingHorizontal: 8,
    },
    itemsPerPageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemsPerPageLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    itemsPerPageButtons: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemsPerPageButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    activeItemsPerPageButton: {
        backgroundColor: '#ff9f5a',
    },
    itemsPerPageButtonText: {
        fontSize: 14,
        color: '#333',
    },
    activeItemsPerPageButtonText: {
        color: '#fff',
    },
});

export default TravelListPanel;