import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

let MapClientSideComponent = null;
if (typeof window !== 'undefined') {
    // Импортируем компонент только на клиенте
    MapClientSideComponent = require('@/components/Map').default;
}

const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9f5a" accessibilityLabel="Loading map" />
    </View>
);

const MapPanel = ({ travelsData, coordinates, style = {} }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <View style={[styles.map, style]}>
            {isClient && MapClientSideComponent ? (
                <MapClientSideComponent travel={{ data: travelsData }} coordinates={coordinates} />
            ) : (
                <LoadingIndicator />
            )}
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
