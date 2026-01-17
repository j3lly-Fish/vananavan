'use server'

import { auth } from "@/auth"
import { db } from "@/db"
import { messages, profiles, users } from "@/db/schema"
import { eq, or, and, desc, sql } from "drizzle-orm"

export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    // This logic mimics the SQL view/RPC: find distinct partners, get last message
    // Drizzle doesn't support complex window functions in simple API easily, 
    // so we might use raw SQL or just fetch messages and aggregate in JS for simplicity 
    // (efficient enough for small scale) or write a smart query.

    // Let's use a raw query for performance similar to the View
    const result = await db.execute(sql`
        WITH distinct_partners AS (
            SELECT DISTINCT CASE 
                WHEN sender_id = ${userId} THEN recipient_id 
                ELSE sender_id 
            END as partner_id
            FROM messages
            WHERE sender_id = ${userId} OR recipient_id = ${userId}
        )
        SELECT 
            dp.partner_id,
            COALESCE(p.first_name || ' ' || p.last_name, 'Unknown User') as partner_name,
            m.content as last_message,
            m.created_at as last_message_time,
            (SELECT COUNT(*) FROM messages m2 WHERE m2.recipient_id = ${userId} AND m2.sender_id = dp.partner_id AND m2.is_read = false) as unread_count
        FROM distinct_partners dp
        LEFT JOIN profiles p ON p.id = dp.partner_id
        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM messages m
            WHERE (m.sender_id = ${userId} AND m.recipient_id = dp.partner_id) 
               OR (m.sender_id = dp.partner_id AND m.recipient_id = ${userId})
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        ORDER BY m.created_at DESC NULLS LAST
    `);

    return result as any[];
}

export async function getMessages(partnerId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    return await db.select()
        .from(messages)
        .where(
            or(
                and(eq(messages.senderId, userId), eq(messages.recipientId, partnerId)),
                and(eq(messages.senderId, partnerId), eq(messages.recipientId, userId))
            )
        )
        .orderBy(messages.createdAt);
}

export async function sendMessage(partnerId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    await db.insert(messages).values({
        senderId: session.user.id,
        recipientId: partnerId,
        content,
    });

    return { success: true };
}

export async function getProfile(profileId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [profile] = await db.select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
    }).from(profiles).where(eq(profiles.id, profileId));

    return profile;
}
