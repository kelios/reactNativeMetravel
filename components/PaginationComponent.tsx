import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';

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
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
});

export default PaginationComponent;
