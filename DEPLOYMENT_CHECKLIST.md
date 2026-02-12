# Deployment Checklist - Enhanced Features

## Pre-Deployment

### 1. Environment Variables

- [ ] Add `GOOGLE_TRANSLATE_API_KEY` to production environment
- [ ] Verify `DATABASE_URL` is configured
- [ ] Verify `NEXTAUTH_SECRET` is configured
- [ ] Verify `NEXTAUTH_URL` points to production domain
- [ ] Verify `GOOGLE_MAPS_API_KEY` is configured

**Setup Instructions**: See `/agent-os/specs/enhanced-features/ENV_SETUP_GUIDE.md`

### 2. Database Migrations

- [ ] Review migration files in `/drizzle/`
- [ ] Test migrations on staging database
- [ ] Run migrations on production:
  ```bash
  npx drizzle-kit push
  ```
- [ ] Verify all new fields exist:
  - `users.tos_accepted`
  - `profiles.chauffeur_license_url`
  - `profiles.chauffeur_license_uploaded_at`
  - `profiles.chauffeur_license_expires_at`
  - `profiles.chauffeur_license_verified`
  - `profiles.language_preference`
  - `messages.original_language`
- [ ] Verify grandfather clause applied (existing users have `tos_accepted = true`)

### 3. Google Cloud Configuration

- [ ] Google Cloud project created
- [ ] Cloud Translation API enabled
- [ ] API key generated and restricted to Translation API only
- [ ] Billing enabled on Google Cloud project
- [ ] Budget alerts configured ($20/month recommended)
- [ ] Usage monitoring dashboard set up

### 4. Code Review

- [ ] All new files reviewed for code quality
- [ ] No debug logs or console.log statements in production code
- [ ] Error handling verified in all server actions
- [ ] Security: API keys not exposed in client-side code
- [ ] Security: Rate limiting tested

### 5. Translation Files

- [ ] `/locales/en.json` deployed
- [ ] `/locales/es.json` deployed
- [ ] All Spanish translations reviewed for accuracy
- [ ] No missing translation keys

---

## Testing on Staging

### Feature 1: Chauffeur License

- [ ] Driver can upload chauffeur license (PDF, JPG, PNG)
- [ ] Drag-and-drop works
- [ ] URL fallback input works
- [ ] Date picker functional
- [ ] Verification badge shows correct status (Verified/Expired)
- [ ] License thumbnail displays in parent dashboard
- [ ] Full-size view works in profile dialog
- [ ] Expiration date validation works

### Feature 2: Phone Numbers

- [ ] Phone numbers formatted as (XXX) XXX-XXXX
- [ ] tel: links work on mobile devices
- [ ] Phone numbers visible in search results
- [ ] Phone numbers visible in profile dialog
- [ ] Access control maintained (parents only see phone numbers)

### Feature 3: Terms of Service

- [ ] TOS checkbox required on registration
- [ ] Form validation prevents signup without TOS acceptance
- [ ] TOS modal opens and displays content
- [ ] Database field `tos_accepted` saves correctly
- [ ] Existing users have `tos_accepted = true`

### Feature 4: Translation

- [ ] Language toggle visible in navbar
- [ ] EN/ES buttons switch language
- [ ] Language persists in localStorage
- [ ] Language persists in database (logged-in users)
- [ ] Login page translates
- [ ] Register page translates
- [ ] Driver dashboard translates
- [ ] Parent dashboard translates
- [ ] Translation API endpoints respond correctly
- [ ] Rate limiting works (100 requests/hour/user)

### Cross-Feature Testing

- [ ] Complete driver onboarding workflow (TOS → upload license → add phone)
- [ ] Complete parent search workflow (TOS → search → view license → call)
- [ ] Language switch works with all features
- [ ] All features work together without conflicts

### Performance Testing

- [ ] Page load times acceptable (<3 seconds)
- [ ] Image uploads work without timeout
- [ ] Translation API responds quickly (<1 second per request)
- [ ] No memory leaks in language switching
- [ ] Mobile responsive design works on all features

---

## Deployment Process

### Step 1: Deploy Code

```bash
# Build production bundle
npm run build

# Deploy to hosting platform (Vercel, Netlify, etc.)
vercel --prod
# or
npm run deploy
```

### Step 2: Configure Environment Variables

**On Vercel**:
```bash
vercel env add GOOGLE_TRANSLATE_API_KEY production
```

**On Netlify**:
- Go to Site Settings → Environment Variables
- Add `GOOGLE_TRANSLATE_API_KEY`

**On other platforms**: Follow platform-specific instructions

### Step 3: Run Database Migrations

```bash
# Connect to production database
export DATABASE_URL="postgresql://..."

# Apply migrations
npx drizzle-kit push
```

### Step 4: Verify Deployment

- [ ] Visit production URL
- [ ] Test all 4 features
- [ ] Check error monitoring (Sentry, etc.)
- [ ] Monitor API usage in Google Cloud Console
- [ ] Check database connections
- [ ] Verify SSL certificate

### Step 5: Monitor Initial Usage

**First 24 Hours**:
- [ ] Monitor error rates
- [ ] Check translation API usage and costs
- [ ] Monitor database performance
- [ ] Review user feedback

**First Week**:
- [ ] Analyze translation API costs (should be <$10 with free tier)
- [ ] Review Spanish translation quality
- [ ] Monitor license upload success rate
- [ ] Check phone number click-through rate

---

## Post-Deployment

### Documentation Updates

- [ ] Update user documentation with new features
- [ ] Create driver onboarding guide (with screenshots)
- [ ] Create parent guide for using search features
- [ ] Document language switching for support team

### Monitoring & Alerts

- [ ] Set up error alerts (Sentry, Bugsnag, etc.)
- [ ] Set up performance monitoring
- [ ] Configure Google Cloud billing alerts
- [ ] Set up uptime monitoring

### User Communication

- [ ] Email existing users about new features
- [ ] Create blog post or announcement
- [ ] Update marketing materials
- [ ] Social media announcement

### Ongoing Maintenance

- [ ] Weekly: Review translation API costs
- [ ] Weekly: Check for expired chauffeur licenses
- [ ] Monthly: Review Spanish translations for improvements
- [ ] Monthly: Analyze feature usage metrics
- [ ] Quarterly: Review and update TOS content

---

## Rollback Plan

If critical issues arise:

### Step 1: Identify Issue

- Check error monitoring dashboard
- Review recent deployments
- Identify affected feature

### Step 2: Quick Fixes

**Translation API issues**:
```bash
# Disable translation temporarily
export GOOGLE_TRANSLATE_API_KEY=""
# App will fallback to original text
```

**Database issues**:
```sql
-- Rollback specific migration
-- Backup database first!
```

### Step 3: Full Rollback

```bash
# Revert to previous deployment
vercel rollback
# or
git revert <commit-hash>
git push origin main
```

### Step 4: Communication

- [ ] Notify users of temporary issues
- [ ] Update status page
- [ ] Post incident report after resolution

---

## Success Metrics

### Week 1

- [ ] 0 critical bugs reported
- [ ] <5 minor bugs reported
- [ ] >80% drivers upload chauffeur license
- [ ] >50% users interact with language toggle
- [ ] Translation API costs <$5

### Month 1

- [ ] >90% drivers have valid chauffeur license
- [ ] >70% phone number click-through on mobile
- [ ] >60% users use Spanish language option
- [ ] Translation API costs <$20
- [ ] User satisfaction >4.5/5

---

## Support Resources

- **Technical Documentation**: `/agent-os/specs/enhanced-features/`
- **Environment Setup**: `/agent-os/specs/enhanced-features/ENV_SETUP_GUIDE.md`
- **Implementation Report**: `/agent-os/specs/enhanced-features/FINAL_IMPLEMENTATION_REPORT.md`
- **Google Cloud Console**: https://console.cloud.google.com/
- **Translation API Dashboard**: https://console.cloud.google.com/apis/api/translate.googleapis.com/

---

## Emergency Contacts

- **Technical Lead**: [Add contact]
- **Database Admin**: [Add contact]
- **DevOps**: [Add contact]
- **Support Team**: [Add contact]

---

**Checklist Version**: 1.0
**Last Updated**: January 28, 2026
**Next Review**: Before production deployment
