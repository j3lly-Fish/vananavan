'use server'

import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(formData: FormData) {
    const userId = formData.get('userId') as string;
    const currentStatus = formData.get('currentStatus') === 'true';

    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== 'admin') {
        // Since this is a form action, throwing error or returning plain object is fine usually, 
        // but explicit error handling in UI is not set up. We'll just return.
        return;
    }

    try {
        await db.update(profiles)
            .set({ isActive: !currentStatus })
            .where(eq(profiles.id, userId));
    } catch (error) {
        console.error("Toggle status error:", error);
    }

    revalidatePath('/admin');
}
