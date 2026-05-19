# Phase 6 — Demo Video and Submission

**Goal:** Record a 3-5 minute demo video that wins Demo Quality (20% of score). Submit code ZIP and video before deadline. Everything done.

**Deadline: May 22, 2026**

---

## Pre-Recording Checklist

Do all of this before hitting record:

- [ ] App deployed and fully functional at Vercel URL
- [ ] Seed data verified: 8 applications, 2 flagged (wind + temp), 1 pending
- [ ] Close Slack, email, notifications -- all of them
- [ ] Set browser to incognito window (clean state, no autofill)
- [ ] Have Vercel URL ready in clipboard
- [ ] Demo credentials ready:
  - Manager: jake@caspianag.com / Demo1234!
  - Contractor: maria@caspianag.com / Demo1234! (or new browser tab)
- [ ] Browser zoom at 100%
- [ ] Test audio levels with a 30-second recording first
- [ ] OBS or QuickTime ready to record screen + mic
- [ ] Script read through once (below)

---

## Demo Script (3-4 minutes)

**[0:00 - 0:25] Hook -- Lead with the problem**

Say this. Do not show the app yet.

"Agricultural operations with multiple contractors face a compliance gap that's invisible until an EPA inspector arrives. One spray event -- wrong wind speed, wrong temperature -- can cost $10,000 in fines and your applicator's license. Today, most operations track this with spreadsheets and text messages. There's no audit trail. There's no way to know if contractors followed label requirements. FieldLog fixes that."

Then open the browser to the landing page. Brief visual while talking.

**[0:25 - 0:50] Landing Page -- Show the product exists**

"FieldLog is a mobile-first platform where contractors log every application directly in the field, managers verify compliance in real time, and every record is immutable -- it cannot be altered after submission."

Click "Sign Up" -- navigate to login.

**[0:50 - 1:30] Manager Dashboard -- The money moment first**

Log in as jake@caspianag.com.

"I'm logging in as Jake, the operation manager. I can immediately see my compliance dashboard."

Point to the FLAGGED applications.

"Two applications are flagged in red. Let's look at what happened."

Click into the wind violation (Application 2 -- Maria, North Field, Roundup).

"Maria logged this application on May 17th. At the moment she submitted it, FieldLog automatically captured the weather at her GPS coordinates using the OpenWeatherMap API. Wind speed was 14.2 miles per hour. The Roundup PowerMax 3 label requires wind under 10 miles per hour. The system caught this automatically -- no manual verification, no guesswork."

Show the red flag box. Show the weather section with red indicators.

"Jake can see this immediately. Maria can't alter the record. This is a chain of custody."

Click Export PDF.

"One click generates an audit-ready PDF with all the data -- contractor name, product, EPA registration number, application rate, weather conditions, and the compliance flags. This is what you hand an EPA inspector."

Wait for PDF to download. Open it briefly.

**[1:30 - 2:30] Contractor Flow -- Show the logging experience**

Open a new incognito tab or second browser. Log in as maria@caspianag.com.

"Now I'm Maria -- a contractor in the field. The logging form is designed for a phone. 60 seconds to log a complete application."

Walk through the form:
- Select field: "North Field"
- Select product: "Roundup PowerMax 3" -- show EPA reg number
- Rate applied: 32 oz/acre
- Acreage: 85 acres
- Target pest: "Broadleaf weeds"
- Application start: set to now
- GPS: click "Use My Location"

"Maria taps 'Submit Application.' The app captures GPS coordinates, calls the weather API at those coordinates, runs the compliance check against the product label, and stores an immutable record."

Hit submit. Show the result.

"Green -- compliant. All label requirements met. The record is now in Jake's dashboard."

**[2:30 - 3:00] Back to Manager -- Show the new log appeared**

Switch back to manager tab. Show the new application appeared in the dashboard (or refresh).

"Jake sees it instantly. Contractor visible. Compliant. No spreadsheet, no text message, no paperwork."

**[3:00 - 3:30] Technical highlight -- Optional but powerful**

"Three things no competitor offers together: offline-first logging so contractors work without cell signal, automatic weather capture at the GPS coordinates at the moment of submission, and immutable records that protect both the contractor and the manager. We validated these three features directly with operation managers in Southeast Missouri. They called it a no-brainer at $75 to $100 a month."

**[3:30 - 3:50] Close -- Vision**

"FieldLog is live, deployed, and ready for pilot customers this spray season. The market is 50,000 licensed applicators in the US. We are starting in Missouri and expanding to 10 surrounding states. The product gap is real. The validation is done. The build is complete."

---

## Recording Instructions

**Tool:** OBS Studio (free, no watermark) or QuickTime (Mac, screen recording)

**Settings:**
- Resolution: 1080p minimum
- Audio: use a headset or sit close to the microphone
- Do a 30-second test recording before the full take

**Tips:**
- One clean take is better than choppy editing
- Speak at a measured pace -- do not rush
- Pause 2 seconds after the hook line before showing the app
- If you make a small mistake, keep going -- it shows authenticity
- The flagged application moment is the emotional peak -- slow down there

**File output:** MP4, under 100MB
If file is too large: trim any dead time, export at 1080p (not 4K), use HandBrake to compress.

---

## Submission Checklist

### Code ZIP

- [ ] git status is clean (no uncommitted changes)
- [ ] pnpm run build passes 0 errors one final time
- [ ] .env.local is NOT in the ZIP (verify .gitignore)
- [ ] README.md exists with:
  - What FieldLog is (2 sentences)
  - Tech stack
  - Demo credentials (jake@caspianag.com / Demo1234!)
  - Deployed URL
  - How to run locally (pnpm install, env vars, pnpm dev)
- [ ] ZIP the project folder: exclude node_modules, .next, .env.local
  ```bash
  zip -r fieldlog.zip . -x "node_modules/*" -x ".next/*" -x ".env.local" -x ".git/*"
  ```
- [ ] ZIP file is under 100MB (verify: ls -lh fieldlog.zip)

### Submission Description (paste into vibeathon platform)

```
FieldLog — Pesticide Application Compliance and Contractor Management Platform

FieldLog solves the compliance gap that mid-to-large agricultural operations face when
managing multiple spray contractors. Contractors log applications in the field using a
mobile-first interface. At the moment of submission, FieldLog automatically captures
real-time weather data at the contractor's GPS coordinates, checks conditions against the
EPA product label requirements, and stores an immutable audit record. Managers see every
contractor log in real time with compliance badges -- flagged applications appear
immediately in red. One-click PDF export generates a complete audit-ready document for
EPA inspections.

Three validated differentiators: offline-first logging, automatic weather capture at the
point of application, and immutable contractor records. No competitor offers all three.

Tech stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth +
RLS), Vercel, OpenWeatherMap API.

Demo credentials (live at [VERCEL_URL]):
  Manager login: jake@caspianag.com / Demo1234!
  Contractor login: maria@caspianag.com / Demo1234!

The demo includes 8 pre-seeded applications including two flagged compliance violations
(one wind violation, one temperature violation) to demonstrate the compliance engine.
```

### Video

- [ ] Video is MP4 or MOV
- [ ] Video is under 5 minutes
- [ ] Video is under 100MB
- [ ] Audio is clear throughout
- [ ] Flagged application moment is clearly visible
- [ ] PDF export is shown

### Platform Submission Order

1. Submit code ZIP first (video upload unlocks after code submit)
2. Write description in the submission form
3. Add deployed Vercel URL to the optional Live URL field
4. Upload video after code is confirmed submitted
5. Verify both are submitted before deadline

---

## README.md (create this before zipping)

```markdown
# FieldLog

Pesticide application compliance and contractor management platform for mid-to-large
agricultural operations.

## What It Does

Contractors log spray applications in the field. FieldLog automatically captures
real-time weather at their GPS location, checks conditions against EPA product label
requirements, and stores an immutable audit record. Managers see all contractor
logs with compliance status in real time. One-click PDF export for EPA inspections.

## Tech Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Vercel
- OpenWeatherMap API
- react-pdf

## Live Demo

[VERCEL_URL]

Demo credentials:
- Manager: jake@caspianag.com / Demo1234!
- Contractor: maria@caspianag.com / Demo1234!

The demo includes 8 pre-seeded applications with 2 flagged compliance violations.

## Local Development

1. Install dependencies: pnpm install
2. Copy .env.example to .env.local and fill in your keys
3. Apply migrations in supabase/migrations/ to your Supabase project
4. Run seed: npx tsx scripts/seed.ts
5. Start dev server: pnpm dev

## Key Features

- Contractor mobile logging form (offline-capable PWA)
- Automatic weather capture at GPS coordinates via OpenWeatherMap
- EPA compliance check against product label requirements
- Immutable audit logs (no UPDATE or DELETE on applications)
- Manager dashboard with real-time compliance status
- Flagged applications shown in red with detailed flag reasons
- Contractor account management
- Audit-ready PDF export
```
