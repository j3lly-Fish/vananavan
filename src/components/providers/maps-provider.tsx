'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places', 'geometry', 'drawing'];

export function MapsProvider({ children }: { children: ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'dummy_key_for_build';

    return (
        <APIProvider
            apiKey={apiKey}
            libraries={libraries}
        >
            {children}
        </APIProvider>
    );
}
