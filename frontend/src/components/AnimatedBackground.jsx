import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AnimatedBackground = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
        mapRef.current = L.map('map-bg', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false
        });

        // Dark theme map tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(mapRef.current);

        const planeIcon = L.divIcon({
            html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#60a5fa" class="w-6 h-6" style="filter: drop-shadow(0 0 4px #60a5fa);"><path d="M3.1 11.2l6.2-1.9 4-7.5c.3-.5.9-.6 1.4-.3.2.1.3.3.4.5l.8 7.3 5.4-1.7c.8-.2 1.6.2 1.9.9.2.8-.2 1.6-.9 1.9l-5.4 1.7-5.1 5.3c-.3.4-.9.4-1.3.1-.2-.1-.3-.3-.4-.5l-1.9-6.9-6.2 1.9c-.4.1-.9-.1-1.1-.5-.1-.4.1-.9.5-1.1l2.5-.8-1-2.9c-.1-.4.1-.9.5-1.1.4-.1.9.1 1.1.5l1.6 4.6z"/></svg>',
            className: 'plane-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const planesCount = 30;
        const planes = [];

        for (let i = 0; i < planesCount; i++) {
            const startLat = (Math.random() - 0.5) * 120;
            const startLng = (Math.random() - 0.5) * 360;
            const endLat = (Math.random() - 0.5) * 120;
            const endLng = (Math.random() - 0.5) * 360;
            
            const marker = L.marker([startLat, startLng], { icon: planeIcon }).addTo(mapRef.current);
            
            planes.push({
                marker,
                startLat, startLng,
                endLat, endLng,
                progress: Math.random(), // Start at random progress
                speed: 0.0005 + Math.random() * 0.0005 // Random speed
            });
        }

        let animationFrame;
        const animate = () => {
            planes.forEach(plane => {
                plane.progress += plane.speed;
                if (plane.progress > 1) {
                    plane.progress = 0;
                    plane.startLat = plane.endLat;
                    plane.startLng = plane.endLng;
                    plane.endLat = (Math.random() - 0.5) * 120;
                    plane.endLng = (Math.random() - 0.5) * 360;
                    // Calculate angle for rotation
                }
                
                const currentLat = plane.startLat + (plane.endLat - plane.startLat) * plane.progress;
                const currentLng = plane.startLng + (plane.endLng - plane.startLng) * plane.progress;
                
                plane.marker.setLatLng([currentLat, currentLng]);

                // Calculate rotation (simplified)
                const dy = plane.endLat - plane.startLat;
                const dx = plane.endLng - plane.startLng;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                const iconElement = plane.marker.getElement();
                if (iconElement) {
                     // Leaflet uses CSS transforms, need to append rotate safely
                     iconElement.style.transform = `${iconElement.style.transform} rotate(${-(angle+45)}deg)`;
                }
            });
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }
  }, []);

  return (
    <div 
        id="map-bg" 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none', // Critical: User should be able to click through
            opacity: 0.6,
            background: '#0f172a' // fallback background color navy blue
        }}
    />
  );
};

export default AnimatedBackground;
