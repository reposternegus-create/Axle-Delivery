import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import L from 'leaflet';

interface LocationPickerProps {
  onConfirm: (address: string, lat: number, lng: number) => void;
  label?: string;
  initialLat?: number;
  initialLng?: number;
  readOnly?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
    onConfirm, 
    label = "Pin Location", 
    initialLat = 31.5204, 
    initialLng = 74.3587, // Default to Lahore
    readOnly = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [address, setAddress] = useState('Move pin to get address...');
  const [coords, setCoords] = useState<{lat: number, lng: number}>({ lat: initialLat, lng: initialLng });
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Simple deterministic "fake" geocoding based on coordinates
  const generateAddress = (lat: number, lng: number) => {
      const sectors = ['Sector F-6', 'DHA Phase 5', 'Blue Area', 'Model Town', 'Gulberg III', 'Johar Town', 'Bahria Town'];
      const streetNum = Math.floor((lat * 1000) % 20) + 1;
      const houseNum = Math.floor((lng * 1000) % 100) + 1;
      const sectorIdx = Math.floor((lat + lng) * 100) % sectors.length;
      return `${sectors[sectorIdx]}, Street ${streetNum}, House ${houseNum}`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize Map
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom Icon
        const icon = L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: #d97706; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const marker = L.marker([initialLat, initialLng], { icon, draggable: !readOnly }).addTo(map);
        markerRef.current = marker;
        mapInstanceRef.current = map;

        // Initial Address
        if (!readOnly) {
             const addr = generateAddress(initialLat, initialLng);
             setAddress(addr);
             // Inform parent immediately of default pos? No, wait for confirm.
        }

        if (!readOnly) {
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setCoords({ lat, lng });
                setIsConfirmed(false);
                const newAddr = generateAddress(lat, lng);
                setAddress(newAddr);
                // Also trigger an update if parent wants live updates (optional)
            });

            marker.on('dragend', (e) => {
                const { lat, lng } = e.target.getLatLng();
                setCoords({ lat, lng });
                setIsConfirmed(false);
                const newAddr = generateAddress(lat, lng);
                setAddress(newAddr);
            });
        }
    } else {
        // Update view if props change (mainly for Rider read-only view)
        mapInstanceRef.current.setView([initialLat, initialLng], 13);
        markerRef.current?.setLatLng([initialLat, initialLng]);
    }

    return () => {
         // Cleanup
    };
  }, [initialLat, initialLng, readOnly]);

  const handleConfirm = () => {
    onConfirm(address, coords.lat, coords.lng);
    setIsConfirmed(true);
  };

  const getCurrentLocation = () => {
      if (navigator.geolocation && mapInstanceRef.current && markerRef.current) {
          navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude, longitude } = pos.coords;
              mapInstanceRef.current?.setView([latitude, longitude], 15);
              markerRef.current?.setLatLng([latitude, longitude]);
              setCoords({ lat: latitude, lng: longitude });
              setIsConfirmed(false);
              const newAddr = generateAddress(latitude, longitude);
              setAddress(newAddr);
          });
      }
  };

  return (
    <div className="space-y-2 mb-4">
      {!readOnly && (
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-axe-brown block">{label}</label>
            {isConfirmed && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={12}/> Location Set</span>}
          </div>
      )}
      
      <div className={`relative rounded-lg overflow-hidden border-2 transition-colors ${isConfirmed ? 'border-green-500' : 'border-amber-200'}`}>
         <div ref={mapContainerRef} className="w-full h-48 z-0"></div>
         {!readOnly && (
             <>
                <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded shadow-md z-[400] text-xs font-mono text-axe-skin border border-gray-200 flex items-center gap-2">
                    <MapPin size={12} className="text-axe-gold"/>
                    <span className="truncate">{address}</span>
                </div>
                <button 
                    onClick={getCurrentLocation}
                    className="absolute bottom-2 right-2 z-[400] bg-white p-2 rounded shadow text-axe-gold hover:text-black"
                    title="Use Current Location"
                >
                    <Navigation size={16} />
                </button>
             </>
         )}
      </div>
      
      {!readOnly && (
          <button 
            type="button"
            onClick={handleConfirm}
            className={`w-full py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition ${
                isConfirmed 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-axe-leather text-white hover:bg-black'
            }`}
          >
            {isConfirmed ? <><Check size={14} /> Confirmed</> : <><MapPin size={14} /> Confirm Location: {address.split(',')[0]}...</>}
          </button>
      )}
    </div>
  );
};