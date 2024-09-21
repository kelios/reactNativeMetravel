import React from 'react';
import { FlatList, StyleSheet, View, Dimensions, Text } from 'react-native';
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
    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth <= 768;
    const numColumns = isMobile ? 1 : 2; // Одна колонка для мобильных, две для больших экранов

    if (travels.length === 0) {
        return <Text style={styles.noDataText}>Нет доступных путешествий</Text>;
    }

    return (
        <FlatList
            data={travels}
            renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                    <TravelListItem
                        travel={item}
                        currentUserId={userId}
                        onEditPress={handleEdit}
                        onDeletePress={handleDelete}
                    />
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            key={numColumns} // Обеспечивает перерисовку при изменении колонок
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        width: '100%',
    },
    contentContainer: {
        paddingHorizontal: 10, // Добавляем отступы для карточек
        paddingBottom: 20, // Добавляем нижний отступ для списка
    },
    cardContainer: {
        flex: 1,
        margin: 10, // Отступы между карточками
        width: '100%', // Задаем фиксированную ширину для карточек
        maxWidth: '50%', // Для двух колонок — половина доступного пространства
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
});

export default TravelListComponent;
