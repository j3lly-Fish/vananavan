'use server'

import { auth } from "@/auth"
import { db } from "@/db"
import { routes } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function saveRoute(pathWkt: string, name: string = 'My Route', routeId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    try {
        if (routeId) {
            // Update existing route
            await db.execute(sql`
                UPDATE routes
                SET path = ST_GeogFromText(${pathWkt}), name = ${name}
                WHERE id = ${routeId} AND driver_id = ${userId}
            `);
        } else {
            // Insert new route
            await db.execute(sql`
                INSERT INTO routes (driver_id, name, path)
                VALUES (${userId}, ${name}, ST_GeogFromText(${pathWkt}))
            `);
        }

        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        console.error('Save route error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteRoute(routeId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.delete(routes).where(sql`${routes.id} = ${routeId} AND ${routes.driverId} = ${session.user.id}`);
        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getDriverRoutes(query: string = '') {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const result = await db.execute(sql`
            SELECT id, name, ST_AsText(path) as path_wkt, created_at
            FROM routes
            WHERE driver_id = ${session.user.id}
            AND name ILIKE ${'%' + query + '%'}
            ORDER BY created_at DESC
        `);
        return result.map(r => ({
            id: r.id as string,
            name: r.name as string | null,
            pathWkt: r.path_wkt as string,
            createdAt: r.created_at as Date
        }));
    } catch (error) {
        console.error('Fetch routes error:', error);
        return [];
    }
}

export async function updateLicense(url: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.execute(sql`
            UPDATE profiles
            SET license_document_url = ${url}
            WHERE id = ${session.user.id}
        `);
        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLicenseUrl() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const result = await db.execute(sql`
            SELECT license_document_url
            FROM profiles
            WHERE id = ${session.user.id}
        `);
        return result[0]?.license_document_url as string || '';
    } catch (error) {
        return null;
    }
}

export async function updateProfileImage(url: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.execute(sql`
            UPDATE profiles
            SET profile_image_url = ${url}
            WHERE id = ${session.user.id}
        `);
        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVehiclePhotos(urls: string[]) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.execute(sql`
            UPDATE profiles
            SET vehicle_photo_urls = ${JSON.stringify(urls)}::jsonb
            WHERE id = ${session.user.id}
        `);
        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateChauffeurLicense(url: string, expiresAt: Date) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Calculate verification status based on expiration date
        const now = new Date();
        const expirationDate = new Date(expiresAt);
        const isVerified = expirationDate > now;

        await db.execute(sql`
            UPDATE profiles
            SET chauffeur_license_url = ${url},
                chauffeur_license_uploaded_at = NOW(),
                chauffeur_license_expires_at = ${expirationDate.toISOString()},
                chauffeur_license_verified = ${isVerified}
            WHERE id = ${session.user.id}
        `);
        revalidatePath('/dashboard/driver');
        return { success: true };
    } catch (error: any) {
        console.error('Update chauffeur license error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateLanguagePreference(language: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.execute(sql`
            UPDATE profiles
            SET language_preference = ${language}
            WHERE id = ${session.user.id}
        `);
        revalidatePath('/dashboard/driver');
        revalidatePath('/dashboard/parent');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getDriverProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const result = await db.execute(sql`
            SELECT
                license_document_url,
                profile_image_url,
                vehicle_photo_urls,
                chauffeur_license_url,
                chauffeur_license_uploaded_at,
                chauffeur_license_expires_at,
                chauffeur_license_verified,
                language_preference
            FROM profiles
            WHERE id = ${session.user.id}
        `);
        const profile = result[0];
        return {
            licenseDocumentUrl: profile?.license_document_url as string || '',
            profileImageUrl: profile?.profile_image_url as string || '',
            vehiclePhotoUrls: (profile?.vehicle_photo_urls as string[]) || [],
            chauffeurLicenseUrl: profile?.chauffeur_license_url as string || '',
            chauffeurLicenseUploadedAt: profile?.chauffeur_license_uploaded_at as Date | null,
            chauffeurLicenseExpiresAt: profile?.chauffeur_license_expires_at as Date | null,
            chauffeurLicenseVerified: profile?.chauffeur_license_verified as boolean || false,
            languagePreference: profile?.language_preference as string || 'en',
        };
    } catch (error) {
        console.error("Error getting profile:", error);
        return null;
    }
}

export async function getDriverRoute() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const result = await db.execute(sql`
            SELECT ST_AsText(path) as path_wkt
            FROM routes
            WHERE driver_id = ${session.user.id}
            LIMIT 1
        `);

        if (result.length > 0) {
            return result[0].path_wkt as string;
        }
        return null;
    } catch (error) {
        console.error('Fetch route error:', error);
        return null;
    }
}
