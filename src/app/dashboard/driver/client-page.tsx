'use client';

import { useState } from 'react';
import { RouteEditor } from "@/components/dashboard/route-editor";
import { RouteList } from "@/components/dashboard/route-list";
import { LicenseManager } from "@/components/dashboard/license-manager";

interface Route {
    id: string;
    name: string | null;
    pathWkt: string;
    createdAt: Date;
}

interface DriverDashboardClientProps {
    initialRoutes: Route[];
    licenseUrl: string;
}

export function DriverDashboardClient({ initialRoutes, licenseUrl }: DriverDashboardClientProps) {
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(initialRoutes[0] || null);

    // Key to force re-render of editor when selection changes
    const editorKey = selectedRoute ? selectedRoute.id : 'new';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar / List */}
            <div className="lg:col-span-1 space-y-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Your Routes</h2>
                    <RouteList
                        routes={initialRoutes}
                        onEdit={setSelectedRoute}
                        onNew={() => setSelectedRoute(null)}
                    />
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Documents</h2>
                    <LicenseManager initialUrl={licenseUrl} />
                </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-2">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        {selectedRoute ? 'Edit Route' : 'Create New Route'}
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        {selectedRoute
                            ? 'Modify your route path below. Don\'t forget to save changes.'
                            : 'Draw your service route on the map below.'}
                    </p>
                    <RouteEditor
                        key={editorKey} // Force reset on change
                        initialRoute={selectedRoute?.pathWkt}
                        initialName={selectedRoute?.name}
                        routeId={selectedRoute?.id}
                        onSave={() => {
                            // Optionally refresh list or something, but revalidatePath handles data.
                            // We might want to clear selection or keep it.
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
