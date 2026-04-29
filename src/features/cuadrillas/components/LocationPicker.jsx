import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos por defecto de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ lat, lng, onChange }) => {
  const initialPosition = lat && lng ? [parseFloat(lat), parseFloat(lng)] : [-33.4489, -70.6693];

  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
      },
    });

    return lat && lng ? (
      <Marker position={[parseFloat(lat), parseFloat(lng)]} />
    ) : null;
  }

  return (
    <div className="map-picker-container">
      <MapContainer 
        center={initialPosition} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '200px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker />
      </MapContainer>
      <p className="map-hint">Haz clic en el mapa para fijar la ubicación exacta.</p>
    </div>
  );
};

export default LocationPicker;
