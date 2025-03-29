import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

// Ленивая загрузка компонента карты
const MapClientSideComponent = React.lazy(() => import('@/components/Map'));

const MapPanel = ({ travelsData, coordinates, style }) => {
    return (
        <View style={[styles.map, style]}>
            {/* Suspense для отображения индикатора загрузки */}
            <Suspense fallback={<LoadingIndicator />}>
                <MapClientSideComponent travel={{ data: travelsData }} coordinates={coordinates} />
            </Suspense>
        </View>
    );
};

// Компонент для отображения индикатора загрузки
const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9f5a" accessibilityLabel="Loading map" />
    </View>
);

const styles = StyleSheet.create({
    map: {
        flex: 1, // Занимает всё доступное пространство
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        margin: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

MapPanel.propTypes = {
    travelsData: PropTypes.array.isRequired,
    coordinates: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
    }).isRequired,
    style: PropTypes.object,
};

MapPanel.defaultProps = {
    style: {},
};

export default React.memo(MapPanel);