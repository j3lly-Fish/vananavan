# Environment Setup Guide - Enhanced Features

## Required Environment Variables

### New Variables (Enhanced Features)

Add these to your `.env` or `.env.local` file:

```bash
# Google Translate API Key
# Required for: User-generated content translation (messages, bios, routes)
# Setup instructions: See "Google Cloud Setup" section below
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### Existing Variables (Should Already Be Set)

```bash
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000  # Update for production

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Google Cloud Setup (Step-by-Step)

### 1. Create/Select Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click "New Project"
   - Name: `vananavan` (or your preferred name)
   - Organization: Select if applicable
   - Click "Create"
5. Wait for project creation (usually takes 10-30 seconds)
6. Select your new project from the dropdown

### 2. Enable Cloud Translation API

1. In the Google Cloud Console, go to **Navigation Menu** (☰) > **APIs & Services** > **Library**
2. In the search bar, type: `Cloud Translation API`
3. Click on **Cloud Translation API** from the results
4. Click the **Enable** button
5. Wait for the API to be enabled (usually instant)

### 3. Create API Key

1. Go to **Navigation Menu** (☰) > **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** at the top
3. Select **API Key**
4. A popup will show your new API key - **Copy it immediately**
5. Click **Restrict Key** (recommended for security)

### 4. Restrict API Key (Recommended)

1. Under **API restrictions**, select **Restrict key**
2. Check only: ✅ **Cloud Translation API**
3. (Optional) Under **Application restrictions**, you can:
   - Restrict to specific IP addresses (for server-side only)
   - Restrict to specific HTTP referrers (for client-side)
   - For this app, we recommend "None" since it's server-side only
4. Click **Save**

### 5. Enable Billing (Required)

**Important**: Google Translate API requires a billing account, but includes free tier:
- Free tier: $10 credit per month
- After free tier: $20 per 1 million characters

To enable billing:

1. Go to **Navigation Menu** (☰) > **Billing**
2. If no billing account exists, click **Add billing account**
3. Fill in payment information
4. Link billing account to your project
5. Go to **Billing** > **Budgets & alerts**
6. Create a budget alert (recommended):
   - Name: `Translation API Budget`
   - Budget amount: $20/month (or your preferred limit)
   - Set email alerts at 50%, 90%, and 100%

### 6. Add API Key to Environment

1. Open your project's `.env` or `.env.local` file
2. Add the line:
   ```bash
   GOOGLE_TRANSLATE_API_KEY=AIzaSyD...your-key-here...
   ```
3. Save the file
4. Restart your development server

---

## Verify Setup

### Test Database Connection

```bash
npm run db:push  # or npx drizzle-kit push
```

Expected output:
```
✓ Changes applied
```

### Test Google Translate API

Create a test file `test-translate.js`:

```javascript
const { Translate } = require('@google-cloud/translate').v2;

async function testTranslation() {
    const translate = new Translate({
        key: process.env.GOOGLE_TRANSLATE_API_KEY
    });

    try {
        const [translation] = await translate.translate('Hello, world!', 'es');
        console.log('✓ Translation successful:', translation);
        console.log('✓ Google Translate API is working!');
    } catch (error) {
        console.error('✗ Translation failed:', error.message);
        console.error('Check your GOOGLE_TRANSLATE_API_KEY');
    }
}

testTranslation();
```

Run test:
```bash
node test-translate.js
```

Expected output:
```
✓ Translation successful: ¡Hola Mundo!
✓ Google Translate API is working!
```

---

## Cost Monitoring & Rate Limiting

### Built-in Rate Limiting

The application includes rate limiting to prevent excessive API usage:
- **Limit**: 100 translation requests per hour per user
- **Implementation**: In-memory tracking (production should use Redis)
- **Behavior**: Returns original text when limit exceeded

### Monitor Usage in Google Cloud

1. Go to **Navigation Menu** (☰) > **APIs & Services** > **Dashboard**
2. Click **Cloud Translation API**
3. View charts for:
   - Requests per day
   - Errors
   - Latency
4. Set up alerts under **Monitoring** > **Alerting**

### Estimated Costs

Based on typical usage patterns:

| Scenario | Characters/Month | Cost/Month |
|----------|------------------|------------|
| Light usage (10 drivers, 50 messages/day) | ~150,000 | Free tier |
| Medium usage (50 drivers, 200 messages/day) | ~600,000 | Free tier |
| Heavy usage (200 drivers, 1000 messages/day) | ~3,000,000 | ~$60 |

**Note**: Only user-generated content is translated. UI text uses next-intl (no API cost).

---

## Security Best Practices

### 1. API Key Security

❌ **Never** commit API keys to version control:

```bash
# Add to .gitignore (should already be there)
.env
.env.local
.env.*.local
```

✅ **Use environment variables** for all deployments

### 2. Restrict API Key Usage

In Google Cloud Console:
- Restrict API key to only Cloud Translation API
- Use separate keys for dev/staging/production
- Rotate keys periodically (every 90 days recommended)

### 3. Production Deployment

For Vercel/Netlify/Other platforms:

1. Add environment variable in platform dashboard
2. Never expose API key in client-side code
3. All translation happens server-side via server actions

Example for Vercel:
```bash
vercel env add GOOGLE_TRANSLATE_API_KEY
# Paste your API key when prompted
```

---

## Troubleshooting

### Error: "API key not valid"

**Cause**: Invalid or missing API key

**Solution**:
1. Verify API key is correctly copied
2. Check for extra spaces in .env file
3. Ensure Cloud Translation API is enabled
4. Restart development server after adding env variable

### Error: "Billing must be enabled"

**Cause**: Project doesn't have billing enabled

**Solution**:
1. Go to Google Cloud Console > Billing
2. Add billing account
3. Link to project
4. Wait 5-10 minutes for billing to propagate

### Error: "Rate limit exceeded"

**Cause**: User exceeded 100 requests/hour

**Solution**:
- Expected behavior, prevents API abuse
- User will see original (untranslated) text
- Limit resets after 1 hour
- For production, implement Redis-based rate limiting for better control

### Translations not appearing in UI

**Cause**: Task Group 10 (UI Text Translation) not yet implemented

**Solution**:
- Translation files exist at `/locales/en.json` and `/locales/es.json`
- Need to implement next-intl integration (see IMPLEMENTATION_SUMMARY.md)
- Components need to use `useTranslations()` hook

### Language toggle doesn't work

**Cause**: Page reload required for language change

**Solution**:
- This is expected behavior until next-intl routing is fully configured
- Language persists in localStorage and database
- Full next-intl integration will enable seamless switching

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Add `GOOGLE_TRANSLATE_API_KEY` to production environment
- [ ] Verify database migrations applied
- [ ] Test all 4 features in staging environment
- [ ] Set up budget alerts in Google Cloud
- [ ] Review and adjust rate limiting if needed
- [ ] Enable error tracking/monitoring (e.g., Sentry)
- [ ] Document API key rotation schedule
- [ ] Test on mobile devices (phone click-to-call)
- [ ] Verify TOS modal displays correctly
- [ ] Test chauffeur license upload with real files

---

## Support & Resources

- **Google Cloud Translation Docs**: https://cloud.google.com/translate/docs
- **Google Cloud Console**: https://console.cloud.google.com/
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Billing Support**: https://support.google.com/cloud/answer/6293499

For technical questions about the implementation, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Feature details and completion status
- `tasks.md` - Detailed task breakdown
- `spec.md` - Complete specification

---

**Last Updated**: January 28, 2026
