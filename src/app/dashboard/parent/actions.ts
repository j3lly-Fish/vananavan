'use server'

import { db } from "@/db"
import { sql } from "drizzle-orm"

export async function findDrivers({ homeLat, homeLng, schoolLat, schoolLng }: { homeLat: number, homeLng: number, schoolLat: number, schoolLng: number }) {
    try {
        const distanceMeters = 8000; // 8km approx 5 miles

        // Raw SQL query equivalent to the 'match_routes' RPC
        const result = await db.execute(sql`
            SELECT 
                r.id,
                r.driver_id,
                r.name,
                ST_AsText(r.path) as path,
                p.first_name || ' ' || p.last_name as driver_name,
                p.first_name || ' ' || p.last_name as driver_name,
                p.email as driver_email,
                p.license_document_url
            FROM routes r
            JOIN profiles p ON r.driver_id = p.id
            WHERE 
                ST_DWithin(r.path, ST_SetSRID(ST_MakePoint(${homeLng}, ${homeLat}), 4326), ${distanceMeters})
                AND
                ST_DWithin(r.path, ST_SetSRID(ST_MakePoint(${schoolLng}, ${schoolLat}), 4326), ${distanceMeters})
        `);

        return { success: true, data: result as any };
    } catch (error: any) {
        console.error("Match error:", error);
        return { success: false, error: error.message };
    }
}
