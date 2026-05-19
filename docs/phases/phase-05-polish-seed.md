# Phase 5 — Polish, Seed Data, and Deploy

**Goal:** Seed data loaded. App looks production-quality. Landing page live. Deployed to Vercel. Everything ready for demo recording.

**Estimated time:** 3-4 hours

---

## Module 5.1 — Seed Data Script

**This module is non-negotiable. An empty app loses. Run seed before anything else in this phase.**

### scripts/seed.ts

Run with: `npx tsx scripts/seed.ts`
Install tsx if needed: `pnpm add -D tsx`

The seed script uses the Supabase service role key directly. It bypasses RLS.

### Seed Order (must follow this order due to FK constraints)

1. Create operation: "Caspian Ag Services"
2. Create manager auth user: jake@caspianag.com, password: Demo1234!
3. Create manager profile: Jake Caspian, role: manager, linked to operation
4. Create contractor auth users:
   - maria@caspianag.com, password: Demo1234!
   - tyler@caspianag.com, password: Demo1234!
5. Create contractor profiles:
   - Maria Santos, role: contractor
   - Tyler Reed, role: contractor
6. Create fields (linked to operation):
   - North Field, 120ac, lat: 36.8087, lng: -89.5833
   - South Creek Field, 85ac, lat: 36.7654, lng: -89.6102
   - East Timber Field, 60ac, lat: 36.7891, lng: -89.5512
7. Insert products (5 total):
   - Roundup PowerMax 3 | EPA: 524-549 | glyphosate | wind: 10mph | temp: 40-90F | RU: false | re_entry: 4hr | max_rate: 51 oz/acre
   - Engenia (Dicamba) | EPA: 7969-345 | dicamba | wind: 10mph | temp: 50-85F | RU: true | re_entry: 48hr | max_rate: 12.8 oz/acre
   - Atrazine 4L | EPA: 100-497 | atrazine | wind: 10mph | temp: 40-90F | RU: true | re_entry: 12hr | max_rate: 64 oz/acre
   - Liberty 280 SL | EPA: 264-829 | glufosinate | wind: 10mph | temp: 50-85F | RU: false | re_entry: 4hr | max_rate: 29 oz/acre
   - Headline AMP | EPA: 7969-326 | pyraclostrobin + metconazole | wind: 10mph | temp: 40-85F | RU: false | re_entry: 12hr | max_rate: 10.5 oz/acre

8. Insert applications + weather_snapshots (8 total):

**Application 1 (COMPLIANT) -- Maria, North Field, Roundup, May 15**
- rate_applied: 32, acreage: 120, target_pest: "Broadleaf weeds"
- application_start: 2026-05-15T08:00:00Z
- weather: wind_speed: 6.2, temp: 74.5, humidity: 58, conditions: "Clear"
- compliance_status: 'compliant', compliance_flags: []

**Application 2 (FLAGGED - WIND VIOLATION) -- Maria, North Field, Roundup, May 17**
- THIS IS THE MONEY DEMO MOMENT
- rate_applied: 32, acreage: 85, target_pest: "Broadleaf weeds"
- application_start: 2026-05-17T13:30:00Z
- weather: wind_speed: 14.2, wind_direction: 210, temp: 76.8, humidity: 62, conditions: "Clear"
- compliance_status: 'flagged'
- compliance_flags: ["Wind speed 14.2 mph exceeded label limit of 10 mph"]

**Application 3 (FLAGGED - TEMP VIOLATION) -- Tyler, South Creek, Engenia, May 16**
- THIS IS THE SECOND DEMO MOMENT
- rate_applied: 12.8, acreage: 85, target_pest: "Waterhemp"
- application_start: 2026-05-16T14:00:00Z
- weather: wind_speed: 7.8, temp: 92.3, humidity: 71, conditions: "Clear"
- compliance_status: 'flagged'
- compliance_flags: ["Temperature 92.3F exceeded label maximum of 85F"]

**Application 4 (COMPLIANT) -- Tyler, South Creek, Liberty, May 14**
- rate_applied: 22, acreage: 85, target_pest: "Grasses"
- application_start: 2026-05-14T09:15:00Z
- weather: wind_speed: 4.5, temp: 68.2, humidity: 64, conditions: "Partly Cloudy"
- compliance_status: 'compliant', compliance_flags: []

**Application 5 (COMPLIANT) -- Maria, East Timber, Headline AMP, May 13**
- rate_applied: 8.0, acreage: 60, target_pest: "Fungal disease"
- application_start: 2026-05-13T07:30:00Z
- weather: wind_speed: 3.1, temp: 71.0, humidity: 55, conditions: "Clear"
- compliance_status: 'compliant', compliance_flags: []

**Application 6 (COMPLIANT) -- Tyler, North Field, Atrazine, May 12**
- rate_applied: 48, acreage: 120, target_pest: "Annual grasses"
- application_start: 2026-05-12T10:00:00Z
- weather: wind_speed: 5.7, temp: 66.4, humidity: 70, conditions: "Overcast"
- compliance_status: 'compliant', compliance_flags: []

**Application 7 (COMPLIANT) -- Maria, South Creek, Liberty, May 11**
- rate_applied: 22, acreage: 85, target_pest: "Volunteer corn"
- application_start: 2026-05-11T08:45:00Z
- weather: wind_speed: 8.3, temp: 63.5, humidity: 66, conditions: "Partly Cloudy"
- compliance_status: 'compliant', compliance_flags: []

**Application 8 (PENDING) -- Tyler, East Timber, Roundup, submitted 30 min ago**
- rate_applied: 32, acreage: 60, target_pest: "Broadleaf weeds"
- application_start: current timestamp minus 30 minutes
- weather: wind_speed: 9.1, temp: 78.4, humidity: 60, conditions: "Clear"
- compliance_status: 'pending', compliance_flags: null
(Pending = weather capture succeeded but compliance check not yet run -- demonstrates real workflow)

### Checklist
- [ ] Seed script runs without errors
- [ ] jake@caspianag.com logs in and sees manager dashboard
- [ ] Dashboard shows 8 applications total (2 flagged, 5 compliant, 1 pending)
- [ ] Maria Santos's wind violation (Application 2) shows as FLAGGED in red
- [ ] Tyler Reed's temp violation (Application 3) shows as FLAGGED in red
- [ ] PDF export works for the flagged application
- [ ] Contractor login (maria@caspianag.com) works and shows history

---

## Module 5.2 — Landing Page

Convert the existing HTML landing page design into a Next.js page at src/app/page.tsx.

The existing HTML (from vibeathon prep) has all the right content. Recreate it in React/Tailwind. Keep the same sections:

1. Header/Nav -- FieldLog logo, Features, How It Works, Sign Up button -> /login
2. Hero -- headline, subheadline, CTA button -> /login
3. Trust Bar -- 4 stats (30-50% time saved, audit-ready, offline-first, contractor visibility)
4. Features (6 cards) -- Contractor Visibility, Audit-Ready Logs, Works Offline, Weather Integration, Team Management, PDF Exports
5. How It Works (3 steps) -- Create Team, Contractors Log, Verify and Export
6. Testimonial -- "Finally a tool that lets me stay in control while trusting my contractors"
7. CTA Section -- Early access signup with name/email form (just logs to console or shows confirmation -- no backend needed)
8. Footer

Use brand colors from src/constants/index.ts. Do not use inline hex values directly in JSX.

### Checklist
- [ ] Landing page renders at /
- [ ] Sign Up / Get Early Access buttons link to /login
- [ ] Logo and tagline correct
- [ ] All 6 feature cards present
- [ ] Mobile responsive
- [ ] No console errors

---

## Module 5.3 — UI Polish Pass

Work through every screen and verify:

**Global:**
- [ ] Favicon set (can use simple FieldLog text or SVG)
- [ ] Page titles set via Next.js metadata API on every page
- [ ] Loading states on all data fetches (skeleton or spinner)
- [ ] Empty states on all lists (no blank screens)
- [ ] Error states on all data fetches (inline message, not crashed page)

**Contractor Form:**
- [ ] Works on 375px width (iPhone SE width)
- [ ] Input labels visible and clear
- [ ] Submit button disabled during loading
- [ ] GPS capture shows coordinates or graceful fallback

**Manager Dashboard:**
- [ ] Flagged row is immediately visually distinct from first glance
- [ ] Stat cards show correct numbers
- [ ] Filter tabs work
- [ ] Application cards clickable (full card, not just a link)

**Application Detail:**
- [ ] Full data visible
- [ ] Export button works
- [ ] Back button returns to dashboard

**Contractor Management:**
- [ ] Contractor list shows application counts
- [ ] Create contractor form submits and shows temp password

---

## Module 5.4 — Vercel Deploy

1. Push all code to GitHub (new private repo -- do not push .env.local)
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard (Settings > Environment Variables):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENWEATHERMAP_API_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
4. Deploy
5. Verify deployed URL:
   - Landing page loads
   - Jake manager login works
   - Maria contractor login works
   - Dashboard shows seed data
   - PDF export generates
6. Add deployed URL to submission description

### Checklist
- [ ] App deployed and accessible at Vercel URL
- [ ] All env vars set in Vercel (not in code)
- [ ] Login works on deployed URL
- [ ] Seed data visible on deployed URL
- [ ] PDF export works on deployed URL
- [ ] No build errors in Vercel logs
- [ ] .env.local not in git history (git log --all -- .env.local returns nothing)

---

## Phase 5 Acceptance Criteria

- [ ] Seed data loaded and verified (8 applications, 2 flagged)
- [ ] Landing page live at /
- [ ] App deployed to Vercel
- [ ] All screens polished (loading, empty, error states)
- [ ] Mobile layout verified on 375px width
- [ ] Demo credentials work on deployed URL:
  - Manager: jake@caspianag.com / Demo1234!
  - Contractor: maria@caspianag.com / Demo1234!
  - Contractor: tyler@caspianag.com / Demo1234!
- [ ] Handoff written to docs/handoffs/phase-05-complete.md
- [ ] Committed: "feat: Phase 5 complete - Polish and Seed"
- [ ] Tagged: git tag phase-05-complete
