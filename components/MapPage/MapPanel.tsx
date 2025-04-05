import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';

// Ленивая загрузка компонента карты
const MapClientSideComponent = React.lazy(() => import('@/components/Map'));

// Компонент для отображения индикатора загрузки
const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9f5a" accessibilityLabel="Loading map" />
    </View>
);

const MapPanel = ({
                      travelsData,
                      coordinates,
                      // Вместо MapPanel.defaultProps
                      // используем параметр по умолчанию:
                      style = {},
                  }) => {
    return (
        <View style={[styles.map, style]}>
            {/* Suspense для отображения индикатора загрузки */}
            <Suspense fallback={<LoadingIndicator />}>
                <MapClientSideComponent travel={{ data: travelsData }} coordinates={coordinates} />
            </Suspense>
        </View>
    );
};

MapPanel.propTypes = {
    travelsData: PropTypes.array.isRequired,
    coordinates: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
    }).isRequired,
    style: PropTypes.object,
};

export default React.memo(MapPanel);

const styles = StyleSheet.create({
    map: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        // Если вы используете React Native Web,
        // лучше заменить shadow-* на boxShadow.
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
