import React from 'react';
import {FlatList, StyleSheet, Text, useWindowDimensions, View,} from 'react-native';
import TravelListItem from '@/components/listTravel/TravelListItem';
import {Travel} from '@/src/types/types';

interface TravelListComponentProps {
    travels: Travel[];
    userId: string;
    isSuperuser: boolean;
    isMetravel: boolean;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
}

const TravelListComponent: React.FC<TravelListComponentProps> = ({
                                                                     travels,
                                                                     userId,
                                                                     isSuperuser,
                                                                     isMetravel,
                                                                     handleEdit,
                                                                     handleDelete,
                                                                 }) => {
    const { width: windowWidth } = useWindowDimensions();
    const isMobile = windowWidth <= 768;
    const numColumns = isMobile ? 1 : 2;

    if (travels.length === 0) {
        return <Text style={styles.noDataText}>Нет доступных путешествий</Text>;
    }

    return (
        <FlatList
            data={travels}
            renderItem={({ item, index }) => (
                <View style={styles.cardContainer}>
                    <TravelListItem
                        travel={item}
                        currentUserId={userId}
                        isSuperuser={isSuperuser}
                        isMetravel={isMetravel}
                        onEditPress={handleEdit}
                        onDeletePress={handleDelete}
                        isMobile={isMobile}
                        index={index} // ✅ добавили index для контроля lazy-loading
                    />
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={
                numColumns > 1 ? { justifyContent: 'center', gap: 16 } : undefined
            }
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            extraData={{ isSuperuser, isMetravel, userId }} // ✅ чтобы перерисовалось при изменении
        />
    );
};

const styles = StyleSheet.create({
    list: {
        width: '100%',
    },
    contentContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    cardContainer: {
        flex: 1,
        margin: 10,
        width: '100%',
        maxWidth: '50%',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
});

export default TravelListComponent;
