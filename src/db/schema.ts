import { pgTable, uuid, text, boolean, timestamp, jsonb, pgEnum, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['admin', 'driver', 'parent']);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    password: text('password'), // Created specific for credentials provider
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    role: userRoleEnum('role').default('parent').notNull(),
    tosAccepted: boolean('tos_accepted').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
    id: uuid('id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
    email: text('email'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    role: userRoleEnum('role').default('parent').notNull(),
    phone: text('phone'),
    isActive: boolean('is_active').default(true),
    licenseDocumentUrl: text('license_document_url'),
    profileImageUrl: text('profile_image_url'),
    vehiclePhotoUrls: jsonb('vehicle_photo_urls').$type<string[]>(),
    chauffeurLicenseUrl: text('chauffeur_license_url'),
    chauffeurLicenseUploadedAt: timestamp('chauffeur_license_uploaded_at', { mode: 'date' }),
    chauffeurLicenseExpiresAt: timestamp('chauffeur_license_expires_at', { mode: 'date' }),
    chauffeurLicenseVerified: boolean('chauffeur_license_verified').default(false),
    languagePreference: text('language_preference').default('en'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Using custom type for geography might be needed if drizzle-orm/postgis doesn't support it fully out of the box yet,
// but usually it's handled via custom types or raw sql. For now, using logic in queries.
// We can define routes table basics.
export const routes = pgTable('routes', {
    id: uuid('id').defaultRandom().primaryKey(),
    driverId: uuid('driver_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    name: text('name'),
    // Custom geography type for Drizzle
    path: customType<{ data: string }>({
        dataType() {
            return 'geography';
        },
    })('path'),
    schedule: jsonb('schedule'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    senderId: uuid('sender_id').references(() => profiles.id).notNull(),
    recipientId: uuid('recipient_id').references(() => profiles.id).notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false),
    originalLanguage: text('original_language'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
