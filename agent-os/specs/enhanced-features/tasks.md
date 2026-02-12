# Task Breakdown: Enhanced Features

## Overview
Total Task Groups: 8
Estimated Total Tasks: 60+
Features: Chauffeur License Upload, Clickable Phone Numbers, Terms of Service, English/Spanish Translation

## Execution Strategy

This spec implements 4 interconnected features with shared dependencies. The execution order is strategically designed to:
1. Build foundation layers first (database, utilities)
2. Implement independent features in parallel where possible
3. Complete dependent features sequentially
4. Test each feature group independently before integration testing

## Task List

### Foundation Layer

#### Task Group 1: Database Schema & Migrations
**Dependencies:** None
**Complexity:** Medium
**Estimated Effort:** 2-3 hours

- [x] 1.0 Complete database schema updates and migrations
  - [x] 1.1 Write 2-8 focused tests for schema changes
    - Test profiles table new fields: chauffeurLicenseUrl, chauffeurLicenseUploadedAt, chauffeurLicenseExpiresAt, chauffeurLicenseVerified, languagePreference
    - Test users table new field: tosAccepted
    - Test messages table new field: originalLanguage
    - Test default values and constraints
    - Skip exhaustive edge case testing
  - [x] 1.2 Update profiles table schema in `/src/db/schema.ts`
    - Add chauffeurLicenseUrl: text('chauffeur_license_url')
    - Add chauffeurLicenseUploadedAt: timestamp('chauffeur_license_uploaded_at')
    - Add chauffeurLicenseExpiresAt: timestamp('chauffeur_license_expires_at')
    - Add chauffeurLicenseVerified: boolean('chauffeur_license_verified').default(false)
    - Add languagePreference: text('language_preference').default('en')
  - [x] 1.3 Update users table schema in `/src/db/schema.ts`
    - Add tosAccepted: boolean('tos_accepted').default(false)
  - [x] 1.4 Update messages table schema in `/src/db/schema.ts`
    - Add originalLanguage: text('original_language')
  - [x] 1.5 Create Drizzle migration file
    - Run drizzle-kit generate to create migration
    - Review generated migration SQL
    - Add grandfather clause: SET tos_accepted = true WHERE created_at < NOW()
  - [x] 1.6 Run migration
    - Execute migration against database
    - Verify all fields created successfully
  - [x] 1.7 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify migrations applied successfully
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- All new fields exist in database with correct types and defaults
- Existing users have tosAccepted = true (grandfather clause)
- Migration runs without errors

---

#### Task Group 2: Utility Functions & Helpers
**Dependencies:** None
**Complexity:** Low
**Estimated Effort:** 1-2 hours

- [x] 2.0 Create utility functions for formatting and translation
  - [x] 2.1 Write 2-8 focused tests for utility functions
    - Test formatPhoneNumber() with various input formats
    - Test phone number formatting edge cases (null, empty, invalid)
    - Test tel: link generation
    - Limit to 2-8 tests maximum
  - [x] 2.2 Create formatPhoneNumber() utility in `/src/lib/utils.ts`
    - Accept various formats: 1234567890, (123) 456-7890, 123-456-7890
    - Return standardized format: (XXX) XXX-XXXX
    - Handle edge cases: null, empty string, invalid formats
  - [x] 2.3 Create formatPhoneLink() utility in `/src/lib/utils.ts`
    - Generate tel: links from formatted phone numbers
    - Strip formatting for tel: link (tel:1234567890)
  - [x] 2.4 Ensure utility function tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify phone formatting works correctly
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- formatPhoneNumber() handles all common formats
- tel: links work on mobile devices
- Functions handle null/empty inputs gracefully

---

### Feature 1: Chauffeur License Upload & Verification

#### Task Group 3: Chauffeur License Backend
**Dependencies:** Task Group 1 (Database Schema)
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

- [x] 3.0 Complete chauffeur license backend logic
  - [x] 3.1 Write 2-8 focused tests for chauffeur license server actions
    - Test updateChauffeurLicense() saves URL, upload date, and expiration date
    - Test date-based verification logic (expired vs verified)
    - Test authentication check
    - Test database update via Drizzle
    - Limit to 2-8 tests maximum
  - [x] 3.2 Create updateChauffeurLicense() server action in `/src/app/dashboard/driver/actions.ts`
    - Accept parameters: licenseUrl (string), expiresAt (Date)
    - Check authentication with auth() from NextAuth
    - Calculate verification status: chauffeurLicenseVerified = (expiresAt > new Date())
    - Update profile via Drizzle: chauffeurLicenseUrl, chauffeurLicenseUploadedAt (now), chauffeurLicenseExpiresAt, chauffeurLicenseVerified
    - Call revalidatePath('/dashboard/driver') for cache invalidation
    - Return success/error response
  - [x] 3.3 Add date validation logic for license expiration
    - Create isLicenseExpired(expiresAt: Date) helper function
    - Compare expiresAt with current date
    - Return boolean for verification badge display
  - [x] 3.4 Ensure chauffeur license backend tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify server action saves data correctly
    - Verify date-based verification logic
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- updateChauffeurLicense() saves all metadata correctly
- Verification status auto-calculates based on expiration date
- Authentication enforced

---

#### Task Group 4: Chauffeur License Upload UI
**Dependencies:** Task Group 3 (Backend)
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

- [x] 4.0 Complete chauffeur license upload UI component
  - [x] 4.1 Write 2-8 focused tests for ChauffeurLicenseManager component
    - Test file upload interaction
    - Test drag-and-drop functionality
    - Test URL fallback input
    - Test date picker for expiration date
    - Test auto-save after upload success
    - Limit to 2-8 tests maximum
  - [x] 4.2 Create ChauffeurLicenseManager component in `/src/components/dashboard/chauffeur-license-manager.tsx`
    - Copy pattern from `/src/components/dashboard/license-manager.tsx`
    - Add file upload with drag-and-drop UI
    - Add URL fallback input field
    - Add date picker for expiration date (HTML5 date input or date-fns)
    - Implement FormData submission to /api/upload endpoint
    - Add 100MB size validation for PDF, JPG, JPEG, PNG
    - Display current license thumbnail if exists
    - Show verification badge (Verified/Expired) based on date
  - [x] 4.3 Integrate auto-save functionality
    - Call updateChauffeurLicense() after successful upload
    - Pass uploaded URL and selected expiration date
    - Show toast notification on success/error
    - Display loading spinner during upload
  - [x] 4.4 Add component to driver dashboard in `/src/app/dashboard/driver/page.tsx`
    - Place in profile settings section
    - Position alongside LicenseManager, ProfilePictureManager, VehiclePhotosManager
    - Label: "Miami-Dade Chauffeur's License"
  - [x] 4.5 Style component to match existing upload components
    - Reuse border, rounded corners, hover effects
    - Match button styling and spacing
    - Consistent badge colors (green = verified, red = expired)
  - [x] 4.6 Ensure chauffeur license UI tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify upload workflow works
    - Verify auto-save calls server action
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Component matches existing upload manager UI patterns
- File upload works with drag-and-drop
- URL fallback works
- Date picker functional
- Auto-save triggers after upload
- Verification badge displays correctly

---

#### Task Group 5: Chauffeur License Display in Parent Dashboard
**Dependencies:** Task Group 3 (Backend), Task Group 4 (Upload UI)
**Complexity:** Medium
**Estimated Effort:** 2-3 hours

- [x] 5.0 Complete license display in parent search results
  - [x] 5.1 Write 2-8 focused tests for license display components
    - Test license thumbnail renders in search results
    - Test verification badge displays correctly
    - Test clickable thumbnail opens full-size view
    - Test Next.js Image optimization
    - Limit to 2-8 tests maximum
  - [x] 5.2 Update findDrivers() server action in `/src/app/dashboard/parent/actions.ts`
    - Include chauffeurLicenseUrl in SELECT query
    - Include chauffeurLicenseVerified in SELECT query
    - Include chauffeurLicenseExpiresAt for date validation
  - [x] 5.3 Update DriverMatch type to include license fields
    - Add chauffeurLicenseUrl?: string
    - Add chauffeurLicenseVerified?: boolean
    - Add chauffeurLicenseExpiresAt?: Date
  - [x] 5.4 Add license thumbnail to driver match cards in `/src/app/dashboard/parent/page.tsx`
    - Use Next.js Image component for optimization
    - Thumbnail size: 100x60 aspect ratio
    - Position: Below profile image or next to vehicle photos
    - Add rounded corners and border matching vehicle photo styling
  - [x] 5.5 Display verification badge next to driver name
    - Green badge with "Verified" text if not expired
    - Red badge with "Expired" text if past expiration date
    - Position next to existing verification badge
  - [x] 5.6 Make thumbnail clickable to view full-size license
    - Open in new tab with target="_blank"
    - OR implement lightbox modal using `/src/components/ui/modal.tsx`
  - [x] 5.7 Ensure license display tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify thumbnail displays correctly
    - Verify verification badge shows correct status
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- License thumbnail visible in all driver match cards
- Thumbnail optimized with Next.js Image
- Verification badge displays correct status (verified/expired)
- Thumbnail clickable to view full license
- UI matches vehicle photo thumbnail styling

---

### Feature 2: Clickable Phone Numbers

#### Task Group 6: Phone Number Display & Click-to-Call
**Dependencies:** Task Group 2 (Utility Functions)
**Complexity:** Low
**Estimated Effort:** 2-3 hours

- [x] 6.0 Complete phone number display with click-to-call
  - [x] 6.1 Write 2-8 focused tests for phone number components
    - Test phone number formatting in search results
    - Test tel: link generation
    - Test phone display in DriverProfileDialog
    - Test phone number visibility (only to parents)
    - Limit to 2-8 tests maximum
  - [x] 6.2 Add phone number to driver match cards in `/src/app/dashboard/parent/page.tsx`
    - Position: Next to Message button or below driver name
    - Use formatPhoneNumber() to display formatted number
    - Wrap in anchor tag with tel: link using formatPhoneLink()
    - Style with blue color and underline on hover
    - Label: "Phone:" or phone icon
  - [x] 6.3 Update DriverProfileDialog in `/src/components/dashboard/driver-profile-dialog.tsx`
    - Add phone number field in contact section
    - Use same formatting and tel: link pattern
    - Position near existing contact buttons
    - Ensure consistent styling with match cards
  - [x] 6.4 Verify phone number access control
    - Confirm phone numbers only visible to parents viewing drivers
    - Existing access control maintained
    - Drivers cannot see other drivers' phone numbers
  - [x] 6.5 Ensure phone number display tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify formatting displays correctly
    - Verify tel: links work on mobile
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Phone numbers display in formatted (XXX) XXX-XXXX format
- tel: links work for click-to-call on mobile
- Phone numbers visible in search results and profile dialog
- Access control maintained (parents only)
- Links styled with blue color and hover underline

---

### Feature 3: Terms of Service Agreement

#### Task Group 7: Terms of Service System
**Dependencies:** Task Group 1 (Database Schema)
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

- [x] 7.0 Complete Terms of Service acceptance system
  - [x] 7.1 Write 2-8 focused tests for TOS components and logic
    - Test TOS checkbox validation (prevents submit if unchecked)
    - Test TOS modal opens and displays content
    - Test acceptTOS() server action updates database
    - Test form submission only works with checkbox checked
    - Limit to 2-8 tests maximum
  - [x] 7.2 Create TOS modal component in `/src/components/tos-modal.tsx`
    - Use existing Modal component from `/src/components/ui/modal.tsx`
    - Add placeholder TOS content sections:
      - User Responsibilities
      - Platform Usage
      - Safety Guidelines
      - Privacy
    - Add scrollable content area
    - Add close button in header
    - Add "I Agree" button in footer
  - [x] 7.3 Create acceptTOS() server action in `/src/app/(auth)/register/actions.ts` or similar
    - Check authentication with auth()
    - Update tosAccepted field in users table to true
    - Return success/error response
  - [x] 7.4 Add TOS checkbox to register page in `/src/app/(auth)/register/page.tsx`
    - Position above submit button
    - Label: "I agree to the Terms of Service"
    - Make "Terms of Service" text clickable to open modal
    - Add React Hook Form validation: checkbox must be checked
  - [x] 7.5 Implement form validation logic
    - Prevent form submission if TOS checkbox unchecked
    - Show validation error message if attempted
    - Auto-set tosAccepted to true after successful signup
  - [x] 7.6 Style TOS components
    - Checkbox follows form input styling
    - Link to modal styled with blue color and underline
    - Modal matches existing Modal component design
    - Scrollable content with proper padding
  - [x] 7.7 Ensure TOS system tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify checkbox validation works
    - Verify tosAccepted updates in database
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- TOS checkbox required for signup
- Modal displays placeholder content
- Form validation prevents unchecked submission
- tosAccepted field updates to true after signup
- Existing users have tosAccepted = true (grandfather clause)

---

### Feature 4: English/Spanish Translation

#### Task Group 8: Translation Infrastructure
**Dependencies:** Task Group 1 (Database Schema)
**Complexity:** High
**Estimated Effort:** 5-6 hours

- [x] 8.0 Set up translation infrastructure with next-intl
  - [x] 8.1 Write 2-8 focused tests for translation infrastructure
    - Test language detection priority (browser → profile → default)
    - Test language toggle switching
    - Test localStorage persistence
    - Test updateLanguagePreference() server action
    - Limit to 2-8 tests maximum
  - [x] 8.2 Install next-intl dependency
    - Run: npm install next-intl
    - Update package.json
  - [x] 8.3 Create translation files
    - Create `/locales/en.json` with all UI strings
    - Create `/locales/es.json` with Spanish translations
    - Organize by sections: common, auth, dashboard, forms, errors
  - [x] 8.4 Configure next-intl middleware in `/src/middleware.ts`
    - Implement language detection logic:
      - Priority 1: Browser language (navigator.language)
      - Priority 2: User profile languagePreference
      - Priority 3: Default to 'en'
    - Handle locale routing
  - [x] 8.5 Wrap app with next-intl provider
    - Update root layout or app entry point
    - Pass messages from translation files
    - Configure locale switching
  - [x] 8.6 Create updateLanguagePreference() server action in `/src/app/dashboard/driver/actions.ts`
    - Accept language parameter: 'en' or 'es'
    - Check authentication
    - Update languagePreference in profiles table
    - Call revalidatePath for cache invalidation
  - [x] 8.7 Ensure translation infrastructure tests pass
    - Run ONLY the 2-8 tests written in 8.1
    - Verify language detection works
    - Verify language persistence works
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 8.1 pass
- next-intl installed and configured
- Translation files created for English and Spanish
- Middleware implements language detection priority
- updateLanguagePreference() saves to database

---

#### Task Group 9: Language Toggle Component
**Dependencies:** Task Group 8 (Translation Infrastructure)
**Complexity:** Medium
**Estimated Effort:** 2-3 hours

- [x] 9.0 Create language toggle UI component
  - [x] 9.1 Write 2-8 focused tests for language toggle
    - Test toggle switches language
    - Test updates localStorage
    - Test calls updateLanguagePreference() server action
    - Test displays current language correctly
    - Limit to 2-8 tests maximum
  - [x] 9.2 Create LanguageToggle component in `/src/components/language-toggle.tsx`
    - Design: EN/ES toggle buttons or dropdown
    - Position: Top-right corner near user menu
    - Show active language with highlight or border
    - Add hover states matching navigation styling
  - [x] 9.3 Implement language switching logic
    - On click: Update localStorage with new language
    - Call updateLanguagePreference() server action (if logged in)
    - Trigger next-intl locale change
    - Reload or re-render with new language
  - [x] 9.4 Add LanguageToggle to navigation components
    - Add to main page navigation/header
    - Add to driver dashboard navigation
    - Add to parent dashboard navigation
    - Ensure consistent positioning across all pages
  - [x] 9.5 Style language toggle component
    - Match existing navigation button styling
    - Add active state indicator
    - Responsive design for mobile (may collapse to icon)
  - [x] 9.6 Ensure language toggle tests pass
    - Run ONLY the 2-8 tests written in 9.1
    - Verify language switches on click
    - Verify persistence to localStorage and database
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 9.1 pass
- Language toggle visible on all pages
- Switching language updates UI immediately
- Preference saved to localStorage and database
- Component matches navigation styling

---

#### Task Group 10: UI Text Translation
**Dependencies:** Task Group 9 (Language Toggle)
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

- [x] 10.0 Translate all static UI text with next-intl
  - [x] 10.1 Write 2-8 focused tests for UI text translation
    - Test key UI strings render in correct language
    - Test form labels translate correctly
    - Test button text translates correctly
    - Test error messages translate correctly
    - Limit to 2-8 tests maximum
  - [x] 10.2 Replace hardcoded strings in authentication pages
    - Update `/src/app/(auth)/login/page.tsx`
    - Update `/src/app/(auth)/register/page.tsx`
    - Use useTranslations() hook from next-intl
    - Replace all labels, buttons, placeholders, errors
  - [x] 10.3 Replace hardcoded strings in driver dashboard
    - Update `/src/app/dashboard/driver/page.tsx`
    - Update `/src/app/dashboard/driver/client-page.tsx`
    - Translate section headings, buttons, labels
  - [x] 10.4 Replace hardcoded strings in parent dashboard
    - Update `/src/app/dashboard/parent/page.tsx`
    - Translate search interface, filter labels, buttons
  - [x] 10.5 Replace hardcoded strings in components
    - Update LicenseManager, ProfilePictureManager, VehiclePhotosManager
    - Update ChauffeurLicenseManager (new component)
    - Update DriverProfileDialog
    - Update TOS modal content
  - [x] 10.6 Add translations to `/locales/en.json` and `/locales/es.json`
    - Organize by namespace/section
    - Ensure all strings have translations in both languages
    - Use professional Spanish translations (not machine translated)
  - [x] 10.7 Ensure UI text translation tests pass
    - Run ONLY the 2-8 tests written in 10.1
    - Verify key strings render in selected language
    - Verify translations switch when language changes
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 10.1 pass
- All hardcoded UI strings replaced with next-intl hooks
- Translation files contain all necessary strings
- Spanish translations accurate and natural
- UI displays in selected language throughout app

---

#### Task Group 11: Google Translate API Integration
**Dependencies:** Task Group 8 (Translation Infrastructure)
**Complexity:** High
**Estimated Effort:** 4-5 hours

- [x] 11.0 Integrate Google Translate API for user content
  - [x] 11.1 Write 2-8 focused tests for translation service
    - Test translateText() function translates correctly
    - Test translation caching in component state
    - Test error handling and fallback to original text
    - Test rate limiting logic
    - Limit to 2-8 tests maximum
  - [x] 11.2 Set up Google Translate API credentials
    - Create Google Cloud project
    - Enable Google Translate API
    - Generate API key
    - Add GOOGLE_TRANSLATE_API_KEY to .env file
  - [x] 11.3 Create translation service in `/src/lib/translate.ts`
    - Install @google-cloud/translate or use REST API
    - Create translateText(text: string, targetLang: string, sourceLang?: string)
    - Return translated text string
    - Handle API errors gracefully
  - [x] 11.4 Implement rate limiting for translation API
    - Track API calls per user in memory or Redis
    - Max 100 requests per hour per user
    - Return error if limit exceeded
    - Log rate limit violations
  - [x] 11.5 Add error handling and fallback logic
    - Catch API errors (network, auth, quota)
    - Return original text if translation fails
    - Show toast notification on translation error
    - Log errors for monitoring
  - [x] 11.6 Ensure translation service tests pass
    - Run ONLY the 2-8 tests written in 11.1
    - Verify translateText() returns translated content
    - Verify error handling works
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 11.1 pass
- Google Translate API configured with API key
- translateText() function translates content accurately
- Rate limiting prevents abuse (100 requests/hour/user)
- Error handling returns original text on failure

---

#### Task Group 12: User-Generated Content Translation
**Dependencies:** Task Group 11 (Google Translate API)
**Complexity:** High
**Estimated Effort:** 4-5 hours

- [x] 12.0 Implement auto-translation for user-generated content
  - [x] 12.1 Write 2-8 focused tests for content translation
    - Test driver bio translation on language switch
    - Test message translation on language switch
    - Test route description translation
    - Test translation caching in component state
    - Limit to 2-8 tests maximum
  - [x] 12.2 Add originalLanguage tracking to messages
    - Update message creation to save originalLanguage field
    - Detect language from user's current languagePreference
    - Store in messages table on message send
  - [x] 12.3 Implement driver bio translation
    - Update driver profile display components
    - On language switch: Call translateText() for bio
    - Cache translated bio in component state
    - Display only translated text (not original)
  - [x] 12.4 Implement message translation
    - Update message display components
    - On language switch: Batch translate all messages in conversation
    - Use Promise.all() to translate multiple messages efficiently
    - Cache translated messages in component state during session
    - Display only translated text
  - [x] 12.5 Implement route description translation
    - Update route display components
    - On language switch: Translate route names and descriptions
    - Cache translations in component state
  - [x] 12.6 Add loading indicators during translation
    - Show spinner or skeleton while translating
    - Disable language toggle during active translation
    - Show progress indicator for large message histories
  - [x] 12.7 Implement client-side caching strategy
    - Store translations in component state (React state or zustand)
    - Cache key: originalText + targetLanguage
    - Clear cache on component unmount or session end
    - Do NOT persist to database (minimize storage)
  - [x] 12.8 Ensure content translation tests pass
    - Run ONLY the 2-8 tests written in 12.1
    - Verify bios, messages, routes translate on language switch
    - Verify caching prevents redundant API calls
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 12.1 pass
- Driver bios translate when language switches
- Message conversations translate entirely on language switch
- Route descriptions translate on language switch
- Translations cached in component state during session
- Only translated text displayed (original hidden)
- Loading indicators show during translation

---

### Integration & Testing

#### Task Group 13: End-to-End Testing & Integration
**Dependencies:** All previous task groups (1-12)
**Complexity:** Medium
**Estimated Effort:** 3-4 hours

- [x] 13.0 Review and test all features together
  - [x] 13.1 Review all tests from previous task groups
    - Review database schema tests (1.1)
    - Review utility function tests (2.1)
    - Review chauffeur license backend tests (3.1)
    - Review chauffeur license UI tests (4.1)
    - Review license display tests (5.1)
    - Review phone number tests (6.1)
    - Review TOS tests (7.1)
    - Review translation infrastructure tests (8.1)
    - Review language toggle tests (9.1)
    - Review UI text translation tests (10.1)
    - Review translation service tests (11.1)
    - Review content translation tests (12.1)
    - Total existing tests: approximately 24-96 tests
  - [x] 13.2 Analyze test coverage gaps for Enhanced Features spec only
    - Identify critical user workflows lacking coverage
    - Focus on integration points between features
    - Prioritize end-to-end workflows:
      - Driver uploads chauffeur license → Parent views in search
      - Parent clicks phone number → Mobile call initiated
      - User signs up → TOS acceptance flow
      - User switches language → All content translates
    - Do NOT assess entire application test coverage
  - [x] 13.3 Write up to 10 additional strategic tests maximum
    - Test chauffeur license upload → display workflow
    - Test phone number display with various formats
    - Test TOS acceptance during signup flow
    - Test language switching with user content translation
    - Test expiration date validation for licenses
    - Test translation caching and error handling
    - Test cross-device language preference persistence
    - Focus on integration points, not unit test gaps
    - Skip edge cases unless business-critical
  - [x] 13.4 Run feature-specific tests only
    - Run ONLY tests related to Enhanced Features spec
    - Expected total: approximately 34-106 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 34-106 tests total)
- Critical user workflows for Enhanced Features are covered
- No more than 10 additional tests added in gap analysis
- Testing focused exclusively on this spec's requirements
- All 4 features working together without conflicts

---

#### Task Group 14: Documentation & Deployment Preparation
**Dependencies:** Task Group 13 (Testing)
**Complexity:** Low
**Estimated Effort:** 1-2 hours

- [x] 14.0 Prepare for deployment
  - [x] 14.1 Update environment variables documentation
    - Document GOOGLE_TRANSLATE_API_KEY requirement
    - Add setup instructions for Google Cloud project
    - Document rate limiting configuration
  - [x] 14.2 Create deployment checklist
    - Database migration steps
    - Environment variable setup
    - Translation file deployment
    - Google Translate API quota verification
  - [x] 14.3 Verify production readiness
    - All tests passing
    - No console errors
    - Translation files complete
    - API keys configured
    - Rate limiting tested
  - [x] 14.4 Code review preparation
    - Review all new files for code quality
    - Ensure consistent code style
    - Remove debug logs and console statements
    - Verify error handling in all server actions

**Acceptance Criteria:**
- Environment variables documented
- Deployment checklist complete
- All production requirements verified
- Code ready for review

---

## Feature Dependency Map

```
Foundation (Required First):
├─ Task Group 1: Database Schema (blocks: 3, 7, 8)
└─ Task Group 2: Utility Functions (blocks: 6)

Feature 1: Chauffeur License
├─ Task Group 3: Backend (depends: 1, blocks: 4, 5)
├─ Task Group 4: Upload UI (depends: 3, blocks: 5)
└─ Task Group 5: Display (depends: 3, 4)

Feature 2: Phone Numbers
└─ Task Group 6: Click-to-Call (depends: 2)

Feature 3: Terms of Service
└─ Task Group 7: TOS System (depends: 1)

Feature 4: Translation
├─ Task Group 8: Infrastructure (depends: 1, blocks: 9, 10, 11)
├─ Task Group 9: Language Toggle (depends: 8, blocks: 10, 12)
├─ Task Group 10: UI Translation (depends: 9)
├─ Task Group 11: Google API (depends: 8, blocks: 12)
└─ Task Group 12: Content Translation (depends: 11)

Final:
├─ Task Group 13: Integration Testing (depends: all)
└─ Task Group 14: Documentation (depends: 13)
```

## Parallel Execution Opportunities

After Foundation (Groups 1-2) is complete, these groups can be implemented in parallel by different engineers:

**Parallel Track 1:** Groups 3-5 (Chauffeur License - 1 backend engineer + 1 UI engineer)
**Parallel Track 2:** Group 6 (Phone Numbers - 1 engineer)
**Parallel Track 3:** Group 7 (TOS - 1 engineer)
**Parallel Track 4:** Groups 8-12 (Translation - 1-2 engineers, sequential within track)

Then merge all tracks for Groups 13-14 (Integration & Deployment).

## Estimated Total Timeline

- Foundation Layer: 3-5 hours (Groups 1-2)
- Feature Development: 20-25 hours (Groups 3-12, parallelizable)
- Integration & Deployment: 4-6 hours (Groups 13-14)
- **Total Sequential: 27-36 hours**
- **Total Parallel (4 tracks): 15-20 hours**

## Testing Strategy

- Each task group writes 2-8 focused tests maximum
- Tests focus on critical behaviors only
- Each group runs ONLY its own tests during development
- Integration testing (Group 13) adds up to 10 strategic tests
- Total test count for spec: approximately 34-106 tests
- DO NOT run entire application test suite during development

## Notes

- Google Translate API requires billing enabled on Google Cloud
- Translation costs: $20 per 1M characters
- Rate limiting prevents runaway costs
- Consider translation budget and monitoring
- Spanish translations for UI text should be professional, not machine-translated
- Chauffeur license verification is date-based only (no admin review workflow)
- Existing users automatically have tosAccepted = true (grandfather clause)
- Phone numbers formatted on display, not stored formatted in database
