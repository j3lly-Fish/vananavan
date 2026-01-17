'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PlaceAutocomplete } from '@/components/ui/place-autocomplete';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { findDrivers } from './actions';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

type DriverMatch = {
    id: string;
    driver_id: string;
    driver_name: string;
    name: string; // Route name
    license_document_url?: string | null;
};

export default function ParentDashboard() {
    const [home, setHome] = useState<google.maps.places.PlaceResult | null>(null);
    const [school, setSchool] = useState<google.maps.places.PlaceResult | null>(null);
    const [matches, setMatches] = useState<DriverMatch[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!home?.geometry?.location || !school?.geometry?.location) {
            toast.error("Please select both Home and School addresses.");
            return;
        }

        setLoading(true);
        try {
            const result = await findDrivers({
                homeLat: home.geometry.location.lat(),
                homeLng: home.geometry.location.lng(),
                schoolLat: school.geometry.location.lat(),
                schoolLng: school.geometry.location.lng()
            });

            if (result.success && result.data) {
                setMatches(result.data);
                if (result.data.length === 0) {
                    toast.info("No drivers found matching this route.");
                } else {
                    toast.success(`Found ${result.data.length} driver(s)!`);
                }
            } else {
                toast.error("Error searching for drivers.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Find a Driver</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Enter your home address and your child's school to find matching routes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Home Address</label>
                        <PlaceAutocomplete onPlaceSelect={setHome} placeholder="e.g. 123 Main St" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">School Address</label>
                        <PlaceAutocomplete onPlaceSelect={setSchool} placeholder="e.g. Lincoln High School" />
                    </div>

                    <Button onClick={handleSearch} disabled={loading} className="w-full">
                        {loading ? 'Searching...' : 'Search Drivers'}
                    </Button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Matches</h3>
                    {matches.length === 0 && !loading && (
                        <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <p className="text-slate-500">No matches yet. Try searching!</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {matches.map((match) => (
                            <div key={match.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:border-blue-500 transition-colors flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{match.driver_name}</h4>
                                        {match.license_document_url && (
                                            <a
                                                href={match.license_document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:underline"
                                                title="Click to view license"
                                            >
                                                ✓ Verified License
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{match.name}</p>
                                </div>
                                <Link href={`/dashboard/messages?partnerId=${match.driver_id}`}>
                                    <Button size="sm" variant="outline">Message</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
