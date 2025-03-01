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
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <View style={styles.container}>
            <DataTable.Pagination
                page={currentPage}
                numberOfPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={onPageChange}
                label={`${currentPage + 1} из ${Math.ceil(totalItems / itemsPerPage)}`}
                showFastPaginationControls
                numberOfItemsPerPageList={itemsPerPageOptions}
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                style={{ backgroundColor: 'white' }}
                theme={{
                    colors: { primary: '#FF7A00', text: '#333' }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
    },
    pagination: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
        marginHorizontal: 4,
    },
    paginationText: {
        fontSize: 14,
        color: '#555',
    },
});


export default PaginationComponent;
