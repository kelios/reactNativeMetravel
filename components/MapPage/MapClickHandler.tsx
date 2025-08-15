const MapClickHandler = ({ onSelectPoint }: { onSelectPoint: (lng: number, lat: number) => void }) => {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
        click(e) {
            onSelectPoint(e.latlng.lng, e.latlng.lat);
        },
    });
    return null;
};

export default MapClickHandler;
