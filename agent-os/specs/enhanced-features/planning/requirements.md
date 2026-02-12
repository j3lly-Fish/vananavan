# Spec Requirements: Enhanced Features

## Initial Description

This is a collection of 4 related features that need to be scoped and planned:

### 1. Miami-Dade Chauffeur's License Upload
- Add ability for drivers to upload their Miami-Dade Chauffeur's license (front only)
- Display this license when parents search for drivers
- This is for driver verification/credentialing

### 2. Clickable Phone Numbers
- Show phone number on driver profile
- Make it clickable to initiate calls on mobile devices (tel: link)

### 3. Terms of Service Agreement
- Add mandatory checkbox during signup for both drivers and parents
- Users must agree to TOS to use the application
- Use a basic placeholder TOS for now (user will add real terms later)

### 4. English/Spanish Translation
- Add a small translation toggle button at the top of:
  - Dashboard pages
  - Main page
- Support switching between English and Spanish

## Requirements Discussion

### First Round Questions

**Q1: License Upload Integration**
I assume the license upload should happen in the driver dashboard with a dedicated upload component similar to the existing profile/vehicle photo managers. Should this be a separate section in the driver profile settings, or integrated into an existing credentials/documents area?

**Answer:** Integrated into existing credentials/documents area

**Q2: License Display in Search Results**
For the license display to parents, I'm thinking we show a small license badge/icon in the search results list, and when clicked, opens a modal or expands to show the full license image. Is that the right approach, or would you prefer the license image to be always visible (thumbnail) in the search results?

**Answer:** Always visible thumbnail in search results

**Q3: License Metadata Tracking**
I assume we need to store the license URL in the database (similar to how vehicle photos are currently stored). Should we track any additional metadata like upload date, expiration date, or verification status for future enhancements?

**Answer:** Yes, also track upload date, expiration date, and verification status

**Q4: Phone Number Display Locations**
I'm thinking the phone number should display in the driver profile card/section that appears in parent search results, formatted as a tel: link. Should we also show the phone number in the driver's full profile view, or only in search results?

**Answer:** Show in both search results AND driver's full profile view

**Q5: Phone Number Formatting**
For formatting, I assume Miami-Dade uses standard US phone number format (XXX) XXX-XXXX. Should we automatically format phone numbers that are stored without formatting, or require drivers to enter them in a specific format?

**Answer:** Automatically format to (XXX) XXX-XXXX

**Q6: TOS Acceptance Tracking**
I assume the TOS checkbox should appear on the signup/registration forms for both driver and parent flows, preventing form submission until checked. Should we track both the acceptance timestamp AND the TOS version number in the database for future legal compliance, or just a simple boolean for now?

**Answer:** Just a simple boolean (accepted: true/false)

**Q7: TOS Display Method**
For the placeholder TOS content, I'm thinking a simple one-page document with basic sections like "User Responsibilities," "Platform Usage," "Safety Guidelines," and "Privacy" that you can replace later. Should we display this in a modal popup or on a separate dedicated /terms page that opens in a new tab?

**Answer:** Modal popup

**Q8: Language Preference Persistence**
I assume we should use a proven i18n library like next-intl (recommended in your tech stack docs) rather than building custom translation logic. Should the language preference persist in local storage, or should we also save it to the user's profile in the database for cross-device consistency?

**Answer:** Local storage AND saved to user profile (cross-device consistency)

**Q9: Translation Toggle Placement**
For the translation toggle placement, I'm thinking a small language switcher (EN/ES toggle or dropdown) in the top navigation bar on both dashboard and main pages. Should this be in the top-right corner near any existing user menu, or would you prefer a different location?

**Answer:** Top-right corner near user menu

**Q10: Translation Scope**
I assume we should translate all UI text, buttons, labels, and form fields, but NOT user-generated content like messages, driver bios, or route descriptions. Is that correct, or should we consider auto-translation for user content as well?

**Answer:** Also auto-translate user-generated content (bios, messages, route descriptions)

**Q11: Scope Exclusions**
Are there any features or edge cases you explicitly want to EXCLUDE from this initial implementation? For example: license verification workflow, TOS version update notifications, or automatic language detection based on browser settings?

**Answer:** ADD automatic language detection based on browser settings

### Existing Code to Reference

**Similar Features Identified:**
- Component: `license-manager.tsx` - Path: `/home/anti/Documents/vananavan/src/components/dashboard/license-manager.tsx`
  - Pattern: File upload with drag-and-drop, URL fallback, auto-save to profile
  - Uses: `/api/upload` endpoint, FormData, toast notifications

- Component: `profile-picture-manager.tsx` - Path: `/home/anti/Documents/vananavan/src/components/dashboard/profile-picture-manager.tsx`
  - Pattern: Image upload with preview, auto-save to profile
  - Uses: Next.js Image component, circular display

- Component: `vehicle-photos-manager.tsx` - Path: `/home/anti/Documents/vananavan/src/components/dashboard/vehicle-photos-manager.tsx`
  - Pattern: Multiple photo uploads, array management, removal functionality
  - Uses: Grid layout, thumbnail display with hover actions

**Server Actions Available:**
- `updateLicense()` - `/home/anti/Documents/vananavan/src/app/dashboard/driver/actions.ts`
- `updateProfileImage()` - `/home/anti/Documents/vananavan/src/app/dashboard/driver/actions.ts`
- `updateVehiclePhotos()` - `/home/anti/Documents/vananavan/src/app/dashboard/driver/actions.ts`

### Follow-up Questions

**Follow-up 1: License Verification Workflow**
You mentioned tracking "verification status" for the chauffeur's license. Should drivers be able to upload licenses immediately but have them show as "pending verification" until an admin reviews them? Or should all uploaded licenses be automatically shown as verified? If there's a verification step, who performs it (admin role) and where?

**Answer:** The verification should just ensure that the license is not expired based on the expiration date in the image that the driver uploads. This is a date-based validation, not an admin review process.

**Follow-up 2: Translation Service**
For auto-translating user-generated content (driver bios, messages, route descriptions), should we use a third-party translation API like Google Translate API or DeepL? This would require API integration and costs, storing both original and translated versions, and a "translate" button or automatic detection. How should this work from a UX perspective?

**Answer:** Use Google Translate API

**Follow-up 3: Message Translation UX**
For messages between users (driver-parent communication), should we translate messages in real-time as users type, or translate entire conversation histories when language is switched? Should we show both original and translated text, or just translated?

**Answer:** Translate entire conversation histories when language is switched. Show just translated text (not both original and translated).

**Follow-up 4: Language Detection Priority**
For automatic language detection, I need to clarify the priority order:
- Option A: Browser language → User profile setting → Default (English)
- Option B: User profile setting → Browser language → Default (English)

Which should take precedence?

**Answer:** Browser language → User profile setting → Default (English)

**Follow-up 5: Database Schema Review**
I notice from git status that `src/db/schema.ts` has been modified. Should I review the current schema to understand the existing structure before planning the new fields?

**Answer:** Yes, review current schema to understand existing structure before planning new fields.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
User indicated they will adjust visual assets later. No design mockups or wireframes were provided at this time.

## Requirements Summary

### Functional Requirements

#### Feature 1: Miami-Dade Chauffeur's License Upload
- Drivers can upload chauffeur's license (front only) via integrated credentials/documents area
- Support image formats: JPG, JPEG, PNG, PDF (up to 100MB)
- License thumbnail always visible in parent search results
- Clickable thumbnail opens full-size license view
- Track metadata:
  - License document URL
  - Upload date (timestamp)
  - Expiration date (user-entered or OCR-extracted)
  - Verification status (date-based validation against expiration)
- Automatic verification: Check if current date > expiration date
- Display verification badge/indicator on license thumbnail
- Reuse existing upload patterns from `license-manager.tsx`

#### Feature 2: Clickable Phone Numbers
- Display phone number in:
  - Parent search results (driver cards)
  - Driver full profile view
- Format phone numbers automatically to: (XXX) XXX-XXXX
- Implement as `tel:` links for mobile click-to-call
- Apply formatting to existing unformatted phone numbers in database
- Phone field already exists in profiles table

#### Feature 3: Terms of Service Agreement
- Add TOS acceptance checkbox to signup forms:
  - Driver registration flow
  - Parent registration flow
- Checkbox required (form validation prevents submission if unchecked)
- Display TOS content in modal popup when user clicks "View Terms"
- Placeholder TOS sections:
  - User Responsibilities
  - Platform Usage
  - Safety Guidelines
  - Privacy
- Track acceptance with simple boolean in database:
  - `tosAccepted` field (boolean, default false)
- No version tracking or timestamp for initial implementation

#### Feature 4: English/Spanish Translation
- Implement full bilingual support (English/Spanish)
- Translation toggle button in top-right corner near user menu
- Present on:
  - Main landing page
  - All dashboard pages (driver and parent)
- Language preference persistence:
  - Local storage (immediate/client-side)
  - User profile database field (cross-device sync)
- Language detection priority:
  1. Browser language setting
  2. User profile setting (if logged in)
  3. Default to English
- Translation scope:
  - ALL UI text, buttons, labels, form fields
  - User-generated content (auto-translate):
    - Driver bios
    - Messages (conversation histories)
    - Route descriptions/names
- Use Google Translate API for user-generated content translation
- Use next-intl library for UI text translation
- Translation behavior:
  - UI text: Instant swap via next-intl dictionaries
  - User content: Translate when language is switched (cached)
  - Messages: Translate entire conversation history on language switch
  - Display only translated text (not original + translation)

### Database Schema Changes

**Current Schema (from `src/db/schema.ts`):**

**users table:**
- id, name, email, password, emailVerified, image, role, createdAt

**profiles table:**
- id, email, firstName, lastName, role, phone, isActive, licenseDocumentUrl, profileImageUrl, vehiclePhotoUrls, createdAt

**Required New Fields:**

**profiles table additions:**
```typescript
chauffeurLicenseUrl: text('chauffeur_license_url')
chauffeurLicenseUploadedAt: timestamp('chauffeur_license_uploaded_at')
chauffeurLicenseExpiresAt: timestamp('chauffeur_license_expires_at')
chauffeurLicenseVerified: boolean('chauffeur_license_verified').default(false)
languagePreference: text('language_preference').default('en') // 'en' or 'es'
```

**users table additions:**
```typescript
tosAccepted: boolean('tos_accepted').default(false)
```

**messages table considerations:**
- May need to add cached translation fields or separate translations table
- Consider: `originalContent`, `translatedContent`, `translationLanguage`, `translatedAt`
- Alternative: Cache translations in application layer (Redis/memory) instead of database

### Reusability Opportunities

**Upload Components:**
- Extend `license-manager.tsx` pattern for chauffeur license upload
- New component: `chauffeur-license-manager.tsx`
- Reuse `/api/upload` endpoint
- Same FormData patterns and toast notifications
- Similar UI layout and interaction patterns

**Server Actions:**
- Create new actions following existing pattern:
  - `updateChauffeurLicense(url, expiresAt)`
  - `updateLanguagePreference(language)`
  - `acceptTOS()`
- Follow existing pattern from `actions.ts` files

**UI Components:**
- Modal component for TOS display
- Check if modal component exists in `/src/components/ui/`
- If not, create following shadcn/ui patterns

**Phone Number Formatting:**
- Create utility function in `/src/lib/utils.ts` or similar:
  - `formatPhoneNumber(phone: string): string`
  - Apply to existing phone numbers in database via migration or on-the-fly

### Scope Boundaries

**In Scope:**
- Chauffeur license upload, display, and date-based verification
- Phone number display with click-to-call functionality
- TOS acceptance during signup with modal display
- Full English/Spanish translation with auto-translation of user content
- Browser-based language detection
- Language preference persistence (local + database)
- Database schema migrations for new fields
- Google Translate API integration

**Out of Scope:**
- Admin review/approval workflow for licenses
- Manual license verification by staff
- TOS version tracking and update notifications
- User notifications when TOS changes
- Forcing re-acceptance of updated TOS
- Real-time message translation (as users type)
- OCR/automatic extraction of license expiration dates
- License expiration email reminders
- Translation quality review or editing
- Support for additional languages beyond English/Spanish
- Translation caching optimization (Redis/advanced caching)

**Future Enhancements (Mentioned but Deferred):**
- TOS versioning and acceptance tracking
- Admin dashboard for license verification
- Automated license expiration reminders
- OCR for automatic license data extraction
- Translation memory/glossary for consistent terminology
- Professional translation review workflow

### Technical Considerations

**Existing Technology Stack:**
- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5.x
- Drizzle ORM (PostgreSQL)
- NextAuth.js v5
- Tailwind CSS 4.x
- React Hook Form + Zod validation
- Sonner (toast notifications)
- Server Actions for API

**Integration Points:**
- Google Translate API (new dependency)
  - Requires API key configuration
  - Cost considerations per character translated
  - Rate limiting and error handling

- next-intl library (new dependency)
  - JSON translation files: `/locales/en.json`, `/locales/es.json`
  - Middleware for language detection
  - Provider wrapper for app

**File Upload Patterns:**
- Existing `/api/upload` endpoint handles uploads
- 100MB size limit configured
- Returns relative URL path
- Auto-saves to profile via server actions

**Database Migration:**
- Add new fields to profiles and users tables
- Consider data migration for existing users:
  - Default `tosAccepted` to `true` for existing users (grandfather clause)
  - Or require re-acceptance on next login
  - Default `languagePreference` to `'en'`

**Phone Number Considerations:**
- Existing phone numbers may be unformatted
- Need utility function to handle various input formats
- Format on display, not necessarily on storage
- tel: link should work with or without formatting

**License Verification Logic:**
- Simple date comparison: `new Date() > chauffeurLicenseExpiresAt`
- Set `chauffeurLicenseVerified = false` if expired
- Display "Expired" or "Verified" badge in search results
- Consider background job to periodically check all licenses

**Translation Architecture:**
- Two-layer translation:
  1. Static UI text via next-intl (fast, pre-translated)
  2. Dynamic user content via Google Translate API (on-demand, cached)
- Consider caching strategy for translated user content
- Store original language of user content for future reference
- Handle translation failures gracefully (show original text)

**Performance Considerations:**
- License thumbnails in search results need optimization
- Use Next.js Image component for automatic optimization
- Consider lazy loading for license images
- Translation API calls should be debounced/cached
- Batch translate messages where possible

**Security Considerations:**
- Validate file uploads (type, size, content)
- Sanitize user input for TOS display
- Secure Google Translate API key (environment variable)
- Rate limit translation API calls to prevent abuse
- Ensure phone numbers are only visible to appropriate users (parents viewing drivers)

**Browser Compatibility:**
- tel: links work on all modern mobile browsers
- Language detection uses navigator.language API (widely supported)
- Local storage fallback if not available
