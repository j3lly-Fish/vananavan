'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PlaceAutocomplete } from '@/components/ui/place-autocomplete';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { findDrivers } from './actions';
import { DriverProfileDialog } from '@/components/dashboard/driver-profile-dialog';
import { formatPhoneNumber, formatPhoneLink, isLicenseExpired } from '@/lib/utils';
import Image from 'next/image';

type DriverMatch = {
    id: string;
    driver_id: string;
    driver_name: string;
    name: string; // Route name
    phone?: string | null;
    license_document_url?: string | null;
    profile_image_url?: string | null;
    vehicle_photo_urls?: string[] | null;
    chauffeur_license_url?: string | null;
    chauffeur_license_expires_at?: Date | null;
    chauffeur_license_verified?: boolean | null;
};

export default function ParentDashboard() {
    const [home, setHome] = useState<google.maps.places.PlaceResult | null>(null);
    const [school, setSchool] = useState<google.maps.places.PlaceResult | null>(null);
    const [matches, setMatches] = useState<DriverMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<DriverMatch | null>(null);

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
            <DriverProfileDialog
                isOpen={!!selectedDriver}
                onClose={() => setSelectedDriver(null)}
                driver={selectedDriver}
            />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Find a Driver</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Enter your home address and your child&apos;s school to find matching routes.</p>
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
                        {matches.map((match) => {
                            const chauffeurExpired = match.chauffeur_license_expires_at
                                ? isLicenseExpired(match.chauffeur_license_expires_at)
                                : false;

                            return (
                                <div
                                    key={match.id}
                                    onClick={() => setSelectedDriver(match)}
                                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:border-[#D4A574] hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                                {match.profile_image_url ? (
                                                    <img
                                                        src={match.profile_image_url}
                                                        alt={match.driver_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{match.driver_name}</h4>
                                                    {match.license_document_url && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" title="Verified License">
                                                            ✓ Verified
                                                        </span>
                                                    )}
                                                    {match.chauffeur_license_url && (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            chauffeurExpired
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        }`} title={chauffeurExpired ? "Chauffeur License Expired" : "Chauffeur License Verified"}>
                                                            {chauffeurExpired ? '✗ Chauffeur Expired' : '✓ Chauffeur'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">{match.name}</p>
                                                {match.phone && (
                                                    <a
                                                        href={formatPhoneLink(match.phone)}
                                                        className="text-sm text-[#C85A6E] hover:underline dark:text-[#C85A6E]"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {formatPhoneNumber(match.phone)}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/messages?partnerId=${match.driver_id}`} onClick={(e) => e.stopPropagation()}>
                                            <Button size="sm" variant="outline">Message</Button>
                                        </Link>
                                    </div>

                                    {match.chauffeur_license_url && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Chauffeur License</p>
                                            <a
                                                href={match.chauffeur_license_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full max-w-[200px] h-[120px] rounded-md overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity relative"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Image
                                                    src={match.chauffeur_license_url}
                                                    alt="Chauffeur License"
                                                    fill
                                                    className="object-cover"
                                                    sizes="200px"
                                                />
                                            </a>
                                        </div>
                                    )}

                                    {match.vehicle_photo_urls && match.vehicle_photo_urls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Vehicle Photos</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {match.vehicle_photo_urls.map((url, i) => (
                                                    <a
                                                        key={i}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-24 h-16 flex-shrink-0 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity relative"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Image src={url} alt={`Vehicle ${i + 1}`} fill className="object-cover" sizes="96px" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
