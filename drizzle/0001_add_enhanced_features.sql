-- Add new fields to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "chauffeur_license_url" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "chauffeur_license_uploaded_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "chauffeur_license_expires_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "chauffeur_license_verified" boolean DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "language_preference" text DEFAULT 'en';

-- Add new field to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tos_accepted" boolean DEFAULT false;

-- Add new field to messages table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "original_language" text;

-- Grandfather clause: Set tos_accepted to true for existing users
UPDATE "users" SET "tos_accepted" = true WHERE "created_at" < NOW();
