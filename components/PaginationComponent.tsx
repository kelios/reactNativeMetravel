import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';

interface PaginationComponentProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemsPerPageOptions: number[];
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
                                                                     currentPage,
                                                                     totalItems,
                                                                     itemsPerPage,
                                                                     onPageChange,
                                                                     itemsPerPageOptions,
                                                                     onItemsPerPageChange,
                                                                 }) => {
    return (
        <View style={styles.container}>
            <DataTable>
                <DataTable.Pagination
                    page={currentPage}
                    numberOfPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={onPageChange}
                    label={`${currentPage + 1} из ${Math.ceil(totalItems / itemsPerPage)}`}
                    showFastPaginationControls
                    numberOfItemsPerPageList={itemsPerPageOptions}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
                />
            </DataTable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 120,
        backgroundColor: 'white',
    },
});

export default PaginationComponent;
