# Tech Stack

## Framework & Runtime
- **Application Framework:** Next.js 16.1.1 (App Router)
- **Language/Runtime:** TypeScript 5.x, Node.js
- **Package Manager:** npm
- **Output Mode:** Standalone (Docker-ready)

## Frontend
- **JavaScript Framework:** React 19.2.3
- **CSS Framework:** Tailwind CSS 4.x (with PostCSS)
- **UI Components:** Custom component library with shadcn/ui patterns
- **Icons:** Lucide React (v0.562.0)
- **Styling Utilities:**
  - clsx (v2.1.1) - conditional className composition
  - class-variance-authority (v0.7.1) - variant-based styling
  - tailwind-merge (v3.4.0) - intelligent class merging
- **Fonts:** Outfit (Google Fonts)
- **Animation:** Framer Motion (v12.23.26)
- **Maps Integration:** @vis.gl/react-google-maps (v1.7.1) - Google Maps API wrapper

## Backend & API
- **API Architecture:** Next.js Server Actions
- **Server Actions Config:** Body size limit 100mb (for image uploads)

## Database & Storage
- **Database:** PostgreSQL
- **ORM/Query Builder:** Drizzle ORM (v0.38.3)
- **Migration Tool:** Drizzle Kit (v0.30.1)
- **Database Driver:** postgres (v3.4.5)
- **Database Extensions:** PostGIS (geography type for route storage)

## Database Schema
- **User Roles:** Enum-based (admin, driver, parent)
- **Key Tables:**
  - users - authentication and base user data
  - profiles - extended user information (phone, licenses, photos)
  - routes - driver routes with geography/PostGIS
  - messages - direct communication between users
- **File Storage Fields:**
  - Profile images (single URL)
  - Vehicle photos (JSONB array of URLs)
  - License documents (single URL)

## Authentication & Security
- **Authentication:** NextAuth.js v5 (beta.25)
- **Auth Strategy:** Credentials provider with email/password
- **Password Hashing:** bcryptjs (v2.4.3)
- **Session Management:** JWT tokens with role-based data
- **Protected Routes:** Server-side session validation

## Forms & Validation
- **Form Management:** React Hook Form (v7.69.0)
- **Schema Validation:** Zod (v4.2.1)
- **Form Resolvers:** @hookform/resolvers (v5.2.2)

## User Experience
- **Notifications:** Sonner (v2.0.7) - toast notifications
- **Date Handling:** date-fns (v4.1.0)
- **Session Provider:** Custom SessionProviderWrapper for client-side access

## Testing & Quality
- **Test Framework:** Not yet configured
- **Linting/Formatting:** ESLint 9.x with Next.js config

## Deployment & Infrastructure
- **Containerization:** Docker with docker-compose.yml
- **Dockerfile:** Multi-stage build with standalone output
- **Hosting:** To be determined (configured for Docker deployment)
- **CI/CD:** Not yet configured

## Third-Party Services
- **Maps API:** Google Maps JavaScript API (for geocoding and visualization)
- **File Storage:** To be determined (currently using direct URL storage)
- **Email:** Not yet configured
- **Monitoring:** Not yet configured

## Planned Additions for New Features

### For Miami-Dade Chauffeur's License Upload
- **File Upload Handling:** Leverage existing 100mb server action limit
- **Storage Solution:** Recommend cloud storage (AWS S3, Cloudflare R2, or Vercel Blob)
- **Image Optimization:** Consider next/image optimization for license display

### For Internationalization (i18n)
- **i18n Framework:** Recommend next-intl or next-i18next
- **Translation Files:** JSON-based translation dictionaries (en.json, es.json)
- **Language Detection:** Browser language detection + user preference storage
- **Storage:** Local storage or database user preferences

### For Terms of Service
- **TOS Storage:** Static markdown file or database record
- **Acceptance Tracking:** Add tosAccepted field and timestamp to users/profiles table
- **Versioning:** Track TOS version for future updates

## Development Tools
- **Agent OS:** v2.1.1 (standards-based development)
- **Project Structure:** Modular standards (frontend, backend, global, testing)
