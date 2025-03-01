import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

type Props = {
    currentPage: number;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
    totalItems?: number;
};

const PaginationComponent: React.FC<Props> = ({
                                                  currentPage,
                                                  itemsPerPage,
                                                  itemsPerPageOptions,
                                                  onPageChange,
                                                  onItemsPerPageChange,
                                                  totalItems = 0,
                                              }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleItemsPerPageChange = (items: number) => {
        onItemsPerPageChange(items);
        onPageChange(0); // Сброс на первую страницу при смене кол-ва элементов на странице
    };

    return (
        <View style={styles.wrapper}>
            <DataTable style={styles.container}>
                <DataTable.Pagination
                    page={currentPage}
                    numberOfPages={totalPages || 1}
                    onPageChange={onPageChange}
                    label={`${currentPage + 1} из ${totalPages || 1}`}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    showFastPaginationControls
                    selectPageDropdownLabel="Элементов на странице"
                    optionsPerPage={itemsPerPageOptions}
                />
            </DataTable>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    container: {
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
});

export default PaginationComponent;
