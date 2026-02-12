import { DriverDashboardClient } from "./client-page";
import { getDriverRoutes, getDriverProfile } from "./actions";

export default async function DriverDashboard() {
    const routes = await getDriverRoutes();
    const profile = await getDriverProfile();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Driver Dashboard</h1>
            </div>

            <DriverDashboardClient
                initialRoutes={routes}
                licenseUrl={profile?.licenseDocumentUrl || ''}
                profileImageUrl={profile?.profileImageUrl || ''}
                vehiclePhotoUrls={profile?.vehiclePhotoUrls || []}
                chauffeurLicenseUrl={profile?.chauffeurLicenseUrl || ''}
                chauffeurLicenseExpiresAt={profile?.chauffeurLicenseExpiresAt || null}
                chauffeurLicenseVerified={profile?.chauffeurLicenseVerified || false}
            />
        </div>
    )
}
