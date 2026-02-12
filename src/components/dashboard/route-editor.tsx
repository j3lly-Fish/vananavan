'use client';

import { useEffect, useState, useCallback } from 'react';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveRoute } from '@/app/dashboard/driver/actions';

interface RouteEditorProps {
    initialRoute?: string | null;
    initialName?: string | null;
    routeId?: string | null;
    onSave?: () => void;
}

export function RouteEditor({ initialRoute, initialName, routeId, onSave }: RouteEditorProps) {
    const map = useMap();
    const drawingLib = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
    const [name, setName] = useState(initialName || '');

    // Update name if prop changes
    useEffect(() => {
        setName(initialName || '');
    }, [initialName]);

    // Load Initial Route
    useEffect(() => {
        if (!map || !drawingLib) return;

        // Reset if no route
        if (!initialRoute) {
            if (polyline) {
                polyline.setMap(null);
                setPolyline(null);
            }
            return;
        }

        // Prevent double loading if we already have the SAME polyline (checking logic simplified)
        // Actually, if initialRoute changes, we SHOULD reload.
        if (polyline) polyline.setMap(null);

        // Parse WKT: LINESTRING(lng lat, lng lat, ...)
        // Robust regex to handle variations in spacing
        try {
            const wktMatch = initialRoute.match(/LINESTRING\s*\((.*)\)/i);
            if (!wktMatch || !wktMatch[1]) {
                console.error('Invalid WKT format:', initialRoute);
                return;
            }

            const coordString = wktMatch[1];
            const coords = coordString.split(',').map(pair => {
                const parts = pair.trim().split(/\s+/).map(Number);
                // Ensure we have exactly 2 valid numbers
                if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                    return null;
                }
                return { lat: parts[1], lng: parts[0] };
            }).filter(c => c !== null) as google.maps.LatLngLiteral[];

            if (coords.length < 2) {
                console.warn('Insufficent valid coordinates in route:', initialRoute);
                return;
            }

            const newPolyline = new google.maps.Polyline({
                path: coords,
                editable: true,
                draggable: true,
                strokeColor: '#D4A574',
                strokeWeight: 5,
                map: map
            });

            setPolyline(newPolyline);

            // Adjust map view
            const bounds = new google.maps.LatLngBounds();
            coords.forEach(c => bounds.extend(c));
            map.fitBounds(bounds);

        } catch (e) {
            console.error('Failed to parse initial route:', e);
        }

    }, [map, initialRoute, drawingLib]);

    // Initialize Drawing Manager
    useEffect(() => {
        if (!drawingLib || !map) return;

        const dm = new drawingLib.DrawingManager({
            drawingMode: polyline ? null : drawingLib.OverlayType.POLYLINE, // Don't start in draw mode if we have a route
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [drawingLib.OverlayType.POLYLINE],
            },
            polylineOptions: {
                editable: true,
                draggable: true,
                strokeColor: '#D4A574',
                strokeWeight: 5,
            },
        });

        dm.setMap(map);
        setDrawingManager(dm);

        return () => {
            dm.setMap(null);
        };
    }, [drawingLib, map, polyline]); // Add polyline dependency to toggle drawing mode

    // Handle Overlay Complete
    useEffect(() => {
        if (!drawingManager) return;

        const listener = google.maps.event.addListener(
            drawingManager,
            'overlaycomplete',
            (event: google.maps.drawing.OverlayCompleteEvent) => {
                if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
                    // If there is already a polyline, remove it (only allow one route for now)
                    if (polyline) {
                        polyline.setMap(null);
                    }
                    const newPolyline = event.overlay as google.maps.Polyline;
                    setPolyline(newPolyline);

                    // Disable drawing mode after drawing one line
                    drawingManager.setDrawingMode(null);

                    // Add listener for path changes (if editable)
                    google.maps.event.addListener(newPolyline.getPath(), 'set_at', () => {
                        // Path updated
                    });
                    google.maps.event.addListener(newPolyline.getPath(), 'insert_at', () => {
                        // Path updated
                    });
                }
            }
        );

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [drawingManager, polyline]);

    const handleSave = async () => {
        if (!polyline) {
            toast.error('Please draw a route first.');
            return;
        }

        const pathArray = polyline.getPath().getArray().map(p => [p.lng(), p.lat()]);

        // Convert to WKT or string format: LINESTRING(lng lat, lng lat, ...)
        // Or just pass array and handle in action.
        const pathString = `LINESTRING(${pathArray.map(p => `${p[0]} ${p[1]}`).join(', ')})`;

        try {
            toast.info('Saving route...');
            const result = await saveRoute(pathString);
            if (result.success) {
                toast.success('Route saved successfully!');
            } else {
                toast.error('Failed to save route: ' + result.error);
            }
        } catch (e) {
            toast.error('An error occurred');
            console.error(e);
        }
    };

    const handleClear = () => {
        if (polyline) {
            polyline.setMap(null);
            setPolyline(null);
        }
        if (drawingManager) {
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
        }
    };

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <Map
                defaultZoom={12}
                defaultCenter={{ lat: 37.7749, lng: -122.4194 }} // Default to San Francisco or user location
                mapId="DEMO_MAP_ID"
                disableDefaultUI={false}
                className="w-full h-full"
            />

            <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                <Button onClick={handleSave} className="shadow-xl">
                    Save Route
                </Button>
                <Button onClick={handleClear} variant="secondary" className="shadow-xl">
                    Clear Map
                </Button>
            </div>
        </div>
    );
}
