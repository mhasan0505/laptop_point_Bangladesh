"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Dhaka Mirpur-10 Showroom coordinates (Madbar Mansion)
const POSITION: [number, number] = [23.8069, 90.3687];
const ZOOM = 16;

const Map = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || isInitialized.current) return;

    // Fix for default marker icons in Next.js - only run once on client
    try {
      // @ts-expect-error - Deleting _getIconUrl from prototype to fix Leaflet icon paths in Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    } catch (error) {
      console.error("Error configuring Leaflet icons:", error);
    }

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: POSITION,
      zoom: ZOOM,
      scrollWheelZoom: false,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    markerRef.current = L.marker(POSITION).addTo(mapRef.current);
    markerRef.current
      .bindPopup(
        "<b>Laptop Point BD</b><br/>Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216"
      )
      .openPopup();

    isInitialized.current = true;

    // Cleanup function to prevent memory leaks
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array since POSITION and ZOOM are constants

  return (
    <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
  );
};

export default Map;
