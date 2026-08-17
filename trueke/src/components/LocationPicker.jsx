import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import styles from './LocationPicker.module.css';

// Vite doesn't resolve Leaflet's default marker image paths, so the icon
// URLs are wired up explicitly here (a well-known Leaflet + bundler quirk).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const MONTEVIDEO = [-34.9011, -56.1645];

/**
 * Click-to-pin map for marking the exact pickup/delivery point of a
 * listing. Uses OpenStreetMap tiles (free, no API key) via Leaflet —
 * imperative (not react-leaflet) to keep this to one small dependency.
 * The resulting lat/lng is meant to stay private (see firestore.rules'
 * products/{id}/private/location) — never rendered on the public product
 * page, only used by the seller.
 */
export default function LocationPicker({ lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const map = L.map(containerRef.current).setView(lat && lng ? [lat, lng] : MONTEVIDEO, lat && lng ? 16 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng]).addTo(map);
      }
      onChange(clickLat, clickLng);
    });

    mapRef.current = map;
    return () => map.remove();
    // Map is created once; external lat/lng updates (e.g. from an address
    // search) are applied via the effect below instead of re-creating it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    mapRef.current.setView([lat, lng], 16);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    }
  }, [lat, lng]);

  return <div ref={containerRef} className={styles.map} />;
}
