'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapViewProps } from '@repo/api';

declare global {
    interface Window {
        google?: any;
    }
}

// Helper coordinate extractors (supports both 'lat/lng' and 'latitude/longitude')
function getLat(rec: any): number | null {
    const val = rec?.latitude ?? rec?.lat;
    return val !== null && val !== undefined && val !== '' ? Number(val) : null;
}

function getLng(rec: any): number | null {
    const val = rec?.longitude ?? rec?.lng;
    return val !== null && val !== undefined && val !== '' ? Number(val) : null;
}

// Calculate Haversine distance in kilometers
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function MapView({ exact, related, onOpenRecord }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // 1. Primary exact match as reference origin
    const exactMatch = exact[0];

    // 2. Sort related records by distance from exact match & assign counts 1, 2, 3...
    const sortedRelated = useMemo(() => {
        const exactLat = exactMatch ? getLat(exactMatch) : null;
        const exactLng = exactMatch ? getLng(exactMatch) : null;

        if (!exactMatch || exactLat === null || exactLng === null) {
            return related.map((r, i) => ({ record: r, count: i + 1, distance: 0 }));
        }

        const withDist = related.map((r) => {
            const rLat = getLat(r);
            const rLng = getLng(r);
            const dist =
                rLat !== null && rLng !== null
                    ? getDistance(exactLat, exactLng, rLat, rLng)
                    : Infinity;
            return { record: r, distance: dist };
        });

        // Sort ascending by distance
        withDist.sort((a, b) => a.distance - b.distance);

        return withDist.map((item, idx) => ({
            record: item.record,
            count: idx + 1,
            distance: item.distance,
        }));
    }, [exactMatch, related]);

    // Load Google Maps API safely without duplicate script injection
    useEffect(() => {
        // 1. If google maps is already loaded on window
        if (typeof window !== 'undefined' && window.google?.maps) {
            setMapLoaded(true);
            return;
        }

        // 2. Check if script tag is already in DOM
        const existingScript = document.querySelector<HTMLScriptElement>(
            'script[src*="maps.googleapis.com/maps/api/js"]'
        );

        if (existingScript) {
            const handleLoad = () => setMapLoaded(true);
            existingScript.addEventListener('load', handleLoad);

            if (window.google?.maps) {
                setMapLoaded(true);
            }

            return () => {
                existingScript.removeEventListener('load', handleLoad);
            };
        }

        // 3. First time loading: inject script tag
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
    }, []);

    // Render map & markers when loaded
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !window.google) return;

        const exactLat = exactMatch ? getLat(exactMatch) : null;
        const exactLng = exactMatch ? getLng(exactMatch) : null;

        const defaultCenter =
            exactLat !== null && exactLng !== null
                ? { lat: exactLat, lng: exactLng }
                : { lat: 47.6062, lng: -122.3321 };

        const map = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 10,
            mapTypeId: 'hybrid',
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
        });

        const bounds = new window.google.maps.LatLngBounds();
        let hasBounds = false;
        const infoWindow = new window.google.maps.InfoWindow();

        // Render Exact Match Marker (Green with Star)
        exact.forEach((rec) => {
            const lat = getLat(rec);
            const lng = getLng(rec);
            if (lat === null || lng === null) return;

            const pos = { lat, lng };
            bounds.extend(pos);
            hasBounds = true;

            const greenStarSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17" cy="17" r="15" fill="#10B981" stroke="#FFFFFF" stroke-width="2.5"/>
          <path d="M17 7.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.8-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z" fill="#FFFFFF"/>
        </svg>
      `)}`;

            const marker = new window.google.maps.Marker({
                position: pos,
                map,
                title: rec.address || 'Exact Match',
                icon: {
                    url: greenStarSvg,
                    scaledSize: new window.google.maps.Size(34, 34),
                    anchor: new window.google.maps.Point(17, 17),
                },
            });

            marker.addListener('click', () => {
                const badgeConfig = {
                    exact: { label: 'EXACT MATCH', bg: '#10b981' },
                    nearest: { label: 'NEAREST MATCH', bg: '#f59e0b' },
                    related: { label: 'RELATED RECORD', bg: '#0284c7' },
                };

                const tierKey = (rec.tier as 'exact' | 'nearest' | 'related') || 'exact';
                const badge = badgeConfig[tierKey] || badgeConfig.exact;

                infoWindow.setContent(`
                    <div style="
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        color: #0f172a;
                        padding: 6px 4px 4px 4px;
                        max-width: 220px;
                        box-sizing: border-box;
                    ">
                        <!-- Match Badge -->
                        <div style="margin-bottom: 8px;">
                        <span style="
                            background: ${badge.bg};
                            color: #ffffff;
                            padding: 4px 8px;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 0.03em;
                            text-transform: uppercase;
                            display: inline-block;
                        ">${badge.label}</span>
                        </div>

                        <!-- Title / Address -->
                        <h3 style="
                        margin: 0 0 4px 0;
                        font-weight: 700;
                        font-size: 16px;
                        line-height: 1.25;
                        color: #0f172a;
                        ">${rec.address || 'No Address'}</h3>

                        <!-- APN & Owner Info -->
                        <div style="font-size: 13px; color: #475569; line-height: 1.4; margin-bottom: 12px;">
                        <div>APN: <span style="color: #334155;">${rec.apn || '—'}</span></div>
                        <div>Owner: <span style="color: #334155;">${rec.owner || '—'}</span></div>
                        </div>

                        <!-- Action Button -->
                        <button 
                        id="btn-open-${rec.id}" 
                        style="
                            background: #0f766e;
                            color: #ffffff;
                            border: none;
                            padding: 7px 14px;
                            border-radius: 8px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background-color 0.2s ease;
                            display: inline-block;
                        "
                        onmouseover="this.style.backgroundColor='#115e59'"
                        onmouseout="this.style.backgroundColor='#0f766e'"
                        >
                        Open Record
                        </button>
                    </div>
                    `);
                infoWindow.open(map, marker);
                setTimeout(() => {
                    const btn = document.getElementById(`btn-open-${rec.id}`);
                    if (btn) btn.onclick = () => onOpenRecord(rec.id);
                }, 100);
            });
        });

        // Render Related Records Markers (Blue with Sequential Numbers)
        sortedRelated.forEach(({ record: rec, count }) => {
            const lat = getLat(rec);
            const lng = getLng(rec);
            if (lat === null || lng === null) return;

            const pos = { lat, lng };
            bounds.extend(pos);
            hasBounds = true;

            const blueNumberSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
          <text x="16" y="20.5" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">${count}</text>
        </svg>
      `)}`;

            const marker = new window.google.maps.Marker({
                position: pos,
                map,
                title: `#${count} - ${rec.address || 'Related Record'}`,
                icon: {
                    url: blueNumberSvg,
                    scaledSize: new window.google.maps.Size(32, 32),
                    anchor: new window.google.maps.Point(16, 16),
                },
            });

            marker.addListener('click', () => {
                infoWindow.setContent(`
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
            <span style="background: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Related #${count}</span>
            <h4 style="margin: 6px 0 2px 0; font-weight: bold; font-size: 14px;">${rec.address || 'No Address'}</h4>
            <p style="margin: 0; font-size: 12px; color: #475569;">APN: ${rec.apn || '—'}</p>
            <p style="margin: 2px 0 8px 0; font-size: 12px; color: #475569;">Owner: ${rec.owner || '—'}</p>
            <button id="btn-open-${rec.id}" style="background: #0f766e; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">Open Record</button>
          </div>
        `);
                infoWindow.open(map, marker);
                setTimeout(() => {
                    const btn = document.getElementById(`btn-open-${rec.id}`);
                    if (btn) btn.onclick = () => onOpenRecord(rec.id);
                }, 100);
            });
        });

        if (hasBounds) {
            map.fitBounds(bounds);
            const listener = window.google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom()! > 18) map.setZoom(18);
                window.google.maps.event.removeListener(listener);
            });
        }
    }, [mapLoaded, exact, sortedRelated, exactMatch, onOpenRecord]);

    return (
        <div className="relative h-140 w-full overflow-hidden rounded-2xl border border-[#293847] bg-[#111a22] shadow-2xl">
            {!mapLoaded && (
                <div className="flex h-full items-center justify-center text-slate-400">
                    Loading Google Maps...
                </div>
            )}
            <div ref={mapRef} className="h-full w-full" />
        </div>
    );
}