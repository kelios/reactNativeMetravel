import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import TravelListItem from '@/components/TravelListItem';
import { Travel } from '@/src/types/types';

interface TravelListComponentProps {
    travels: Travel[];
    userId: string;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
}

const TravelListComponent: React.FC<TravelListComponentProps> = ({
                                                                     travels,
                                                                     userId,
                                                                     handleEdit,
                                                                     handleDelete,
                                                                 }) => {

    // Проверка на пустой массив travels
    if (travels.length === 0) {
        return <Text style={styles.noDataText}>Нет доступных путешествий</Text>;
    }

    return (
        <FlatList
            data={travels}
            renderItem={({ item }) => (
                <TravelListItem
                    travel={item}
                    currentUserId={userId}
                    onEditPress={handleEdit}
                    onDeletePress={handleDelete}
                />
            )}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        width: '100%',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});

export default TravelListComponent;
