import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Delete the default L.Icon default property to prevent missing default icons issue
delete L.Icon.Default.prototype._getIconUrl;

// Custom Marker Colors based on SourceType
const getMarkerIcon = (sourceType) => {
  let color = '#6B7280'; // default gray
  if (sourceType === 'OSINT') color = '#A855F7'; // purple
  if (sourceType === 'HUMINT') color = '#22C55E'; // green
  if (sourceType === 'IMINT') color = '#F59E0B'; // amber

  // Using a custom SVG icon
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle the hover events on markers cleanly
const InteractiveMarker = ({ node }) => {
  const markerRef = React.useRef(null);
  const [coords] = node.coordinates.coordinates; // [long, lat]
  const latlng = [node.coordinates.coordinates[1], node.coordinates.coordinates[0]];

  // Hover interactivity
  const eventHandlers = React.useMemo(
    () => ({
      mouseover() {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      },
      mouseout() {
        if (markerRef.current) {
          markerRef.current.closePopup();
        }
      },
    }),
    []
  );

  return (
    <Marker 
      position={latlng} 
      icon={getMarkerIcon(node.sourceType)}
      ref={markerRef}
      eventHandlers={eventHandlers}
    >
      <Popup className="custom-popup" closeButton={false}>
        <div className="w-64 -m-3 max-h-80 overflow-y-auto">
          {node.imageUrl ? (
            <div className="w-full h-32 relative bg-dark-900 border-b border-gray-200">
               <img 
                 // Fix static path based on server
                 src={`http://localhost:5000${node.imageUrl}`} 
                 alt={node.title} 
                 className="w-full h-full object-cover" 
                 onError={(e) => { e.target.style.display = 'none' }}
               />
            </div>
          ) : (
             <div className="w-full h-12 bg-dark-900 flex items-center justify-center border-b border-gray-200">
                <span className="text-xs text-gray-400 font-semibold">{node.sourceType} NODE</span>
             </div>
          )}
          <div className="p-4 bg-white text-dark-900">
            <h3 className="font-bold text-lg leading-tight mb-1">{node.title}</h3>
            <div className="flex gap-2 items-center mb-2">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                node.sourceType === 'OSINT' ? 'bg-purple-100 text-purple-700' :
                node.sourceType === 'HUMINT' ? 'bg-green-100 text-green-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {node.sourceType}
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                {latlng[0].toFixed(4)}, {latlng[1].toFixed(4)}
              </span>
            </div>
            
            {node.metadata?.hasGPS === false && (
              <div className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded mb-2 font-semibold">
                ⚠️ NO EXIF GPS DATA DETECTED IN IMAGE. RANDOMIZED FALLBACK POSTION.
              </div>
            )}
            
            {node.description && <p className="text-sm text-gray-700 mt-2 line-clamp-3">{node.description}</p>}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const MapView = ({ nodes }) => {
  const bounds = [
    [-90, -180],
    [90, 180]
  ];

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={3} 
      minZoom={2}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      className="w-full h-full"
      zoomControl={true}
    >
      {/* Dark/CartoDB map tile styling for High-fidelity UI */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
        noWrap={true}
      />
      {nodes.filter(n => n.coordinates?.coordinates?.length === 2).map((node) => (
        <InteractiveMarker key={node._id} node={node} />
      ))}
    </MapContainer>
  );
};

export default MapView;
