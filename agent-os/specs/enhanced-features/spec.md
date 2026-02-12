# Specification: Enhanced Features

## Goal
Implement four interconnected features to enhance VanaNavan's driver credentialing, communication, legal compliance, and accessibility: chauffeur license upload with expiration-based verification, clickable phone numbers, Terms of Service acceptance, and full English/Spanish translation with Google Translate API integration for user-generated content.

## User Stories
- As a parent, I want to view a driver's chauffeur license with verification status so that I can confirm they have proper credentials and their license is not expired
- As a parent, I want to click a phone number to immediately call a driver on my mobile device so that I can quickly coordinate transportation details
- As a platform user, I want to review and accept Terms of Service during signup so that I understand my responsibilities and platform policies
- As a bilingual user, I want to switch between English and Spanish throughout the application so that I can use the platform in my preferred language with all content automatically translated

## Specific Requirements

**Chauffeur License Upload and Management**
- Add new database fields to profiles table: chauffeurLicenseUrl (text), chauffeurLicenseUploadedAt (timestamp), chauffeurLicenseExpiresAt (timestamp), chauffeurLicenseVerified (boolean, default false)
- Create ChauffeurLicenseManager component following the existing LicenseManager pattern with file upload, drag-and-drop, URL fallback, and date picker for expiration
- Reuse existing /api/upload endpoint with 100MB limit for PDF, JPG, JPEG, PNG formats
- Create updateChauffeurLicense() server action in driver/actions.ts to save license URL, upload timestamp, and expiration date to profile
- Implement date-based verification logic: check if current date > expirationDate, set chauffeurLicenseVerified to false if expired
- Add chauffeur license section to driver dashboard profile settings alongside existing license, profile photo, and vehicle photo managers
- Display license verification badge (Verified/Expired) based on expiration date validation

**License Display in Parent Search Results**
- Add license thumbnail display in parent dashboard search results (always visible, not just a badge)
- Use Next.js Image component for thumbnail optimization with 100x60 aspect ratio in driver match cards
- Show verification badge next to driver name indicating "Verified" (green) or "Expired" (red) status based on date validation
- Make thumbnail clickable to open full-size license image in new tab or lightbox modal
- Update findDrivers() server action to include chauffeurLicenseUrl and chauffeurLicenseVerified in query results
- Update DriverMatch type to include chauffeurLicenseUrl and chauffeurLicenseVerified fields

**Clickable Phone Numbers with Formatting**
- Create formatPhoneNumber() utility function in /src/lib/utils.ts to convert various formats to (XXX) XXX-XXXX
- Display phone numbers in driver search results cards using tel: links for click-to-call functionality
- Display phone numbers in DriverProfileDialog component with same tel: link pattern
- Format phone numbers on display (not in database) to maintain data flexibility
- Add phone number field to parent dashboard match cards next to Message button
- Ensure phone numbers only visible to parents viewing drivers (existing access control maintained)

**Terms of Service Agreement System**
- Add tosAccepted field (boolean, default false) to users table schema
- Create TOS modal component using existing Modal component pattern with placeholder content sections: User Responsibilities, Platform Usage, Safety Guidelines, Privacy
- Add mandatory TOS checkbox to register page form before submit button with "I agree to the Terms of Service" label and link
- Implement form validation preventing signup submission if TOS checkbox is not checked
- Create acceptTOS() server action to update tosAccepted field in users table
- Automatically set tosAccepted to true after successful signup with checkbox checked
- For existing users in database, default tosAccepted to true (grandfather clause) via migration

**Internationalization Framework with next-intl**
- Install and configure next-intl library for static UI text translation
- Create translation files at /locales/en.json and /locales/es.json with all UI strings, labels, buttons, and form fields
- Add languagePreference field (text, default 'en') to profiles table for cross-device persistence
- Create language toggle component in top-right corner of navigation bar with EN/ES buttons or dropdown
- Implement middleware for automatic language detection: priority order is browser language → user profile setting → default English
- Store language preference in localStorage for immediate client-side access and sync to profile via updateLanguagePreference() server action
- Wrap app with next-intl provider and configure language switching functionality

**Google Translate API Integration**
- Set up Google Translate API credentials with API key stored in environment variable GOOGLE_TRANSLATE_API_KEY
- Create translation service utility at /src/lib/translate.ts with translateText() function
- Implement auto-translation for user-generated content: driver bios, route descriptions, and messages
- Translate entire message conversation histories when language is switched (not real-time as users type)
- Display only translated text without showing original text alongside
- Add originalLanguage field to messages table to track source language for accurate translation
- Implement client-side caching of translated content to minimize API calls (store in component state during session)
- Add error handling and fallback to display original text if translation API fails
- Rate limit translation API calls per user to prevent abuse (max 100 requests per hour per user)

**Language Detection and Persistence**
- Implement browser language detection using navigator.language API on first visit
- Check browser language, then check user profile languagePreference if logged in, fallback to English
- Update languagePreference in profile database when user manually switches language
- Sync language preference changes to localStorage and profile simultaneously
- Load language preference from profile on login across devices

**Database Schema Updates**
- Profiles table additions: chauffeurLicenseUrl, chauffeurLicenseUploadedAt, chauffeurLicenseExpiresAt, chauffeurLicenseVerified, languagePreference
- Users table additions: tosAccepted
- Messages table additions: originalLanguage (text, optional for tracking source language of messages)
- Create Drizzle migration file with proper field types and defaults

## Visual Design
No visual assets provided. User will adjust later.

**UI Design Guidelines**
- Chauffeur license thumbnail in search results should match vehicle photo thumbnail styling (rounded corners, border, hover effect)
- License expiration date picker should use standard HTML5 date input or date-fns integration
- TOS modal should follow existing Modal component design with scrollable content area
- Language toggle should be compact icon or text button (EN/ES) with hover states matching navigation styling
- Phone number links should have blue color and underline on hover to indicate clickability
- Verification badges should use green (verified) and red (expired) color scheme consistent with existing "Verified" badge

## Existing Code to Leverage

**/src/components/dashboard/license-manager.tsx**
- File upload pattern with drag-and-drop UI, FormData submission to /api/upload endpoint, 100MB size validation
- Auto-save functionality calling server action after upload success with toast notifications
- URL fallback input allowing manual entry of document links
- Reuse this entire pattern for ChauffeurLicenseManager component with additional date picker for expiration

**/src/components/dashboard/profile-picture-manager.tsx**
- Image upload with Next.js Image component for preview and optimization
- Circular display pattern and loading state with spinner overlay
- Auto-save pattern calling updateProfileImage server action
- Reference for image display optimization techniques

**/src/components/ui/modal.tsx**
- Existing Modal component with Framer Motion animations, backdrop blur, and portal rendering
- Sticky header with title and close button, scrollable content area
- Use this exact component for TOS modal and potentially license image lightbox

**/src/app/dashboard/driver/actions.ts**
- Server action patterns: updateLicense(), updateProfileImage(), updateVehiclePhotos()
- Authentication check with auth() from NextAuth, database updates via Drizzle ORM raw SQL
- revalidatePath pattern for cache invalidation after updates
- Follow these patterns for new server actions: updateChauffeurLicense(), updateLanguagePreference(), acceptTOS()

**/src/app/dashboard/parent/page.tsx**
- Driver search results card layout with profile image, name, verification badge, and Message button
- DriverProfileDialog integration for detailed view on click
- Vehicle photo thumbnail grid display pattern
- Extend match cards to include phone number display and chauffeur license thumbnail

**/src/components/dashboard/driver-profile-dialog.tsx**
- Full profile modal with header section, badges, contact buttons, and vehicle photo grid
- Reference for displaying phone numbers and license information in detailed view
- Extend to show phone number as clickable tel: link and chauffeur license verification status

**/src/lib/utils.ts**
- Existing cn() utility for className merging
- Add formatPhoneNumber() utility function here following same pattern

**/src/app/(auth)/register/page.tsx**
- Signup form with role selection, name fields, email, and password inputs
- Form submission via server action signup()
- Add TOS checkbox and modal trigger button above submit button in this form

**/src/db/schema.ts**
- Drizzle ORM schema with pgTable definitions for users, profiles, routes, messages tables
- Custom types for geography, jsonb arrays, enums for roles, timestamps
- Add new fields to existing tables following established patterns

## Out of Scope
- Admin manual review or approval workflow for uploaded licenses
- OCR or automatic extraction of license expiration dates from uploaded images
- License expiration email reminders or automated notifications to drivers
- TOS version tracking, update notifications, or forcing re-acceptance when terms change
- Real-time message translation as users type (only translate on language switch)
- Translation quality review, editing, or professional translation services
- Support for additional languages beyond English and Spanish
- Advanced translation caching with Redis or external caching layer
- Translation memory or glossary for consistent terminology across platform
- Admin dashboard for managing translations or reviewing license uploads
- Automated background job to check all licenses for expiration daily
