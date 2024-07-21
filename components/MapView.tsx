import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapScreen = () => {
    const initialRegion = {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const markers = [
        {
            key: 1,
            coordinate: { latitude: 37.78825, longitude: -122.4324 },
            title: "Marker 1",
            description: "This is marker 1"
        },
        {
            key: 2,
            coordinate: { latitude: 37.78925, longitude: -122.4224 },
            title: "Marker 2",
            description: "This is marker 2"
        }
    ];

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
            >
                {markers.map(marker => (
                    <Marker
                        key={marker.key}
                        coordinate={marker.coordinate}
                        title={marker.title}
                        description={marker.description}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    map: {
        width: '100%',
        height: '100%'
    }
});

export default MapScreen;
