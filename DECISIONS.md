# Architecture Decisions Log

---

## ADR-001 — Applications Table is Immutable After Submit

**Date:** 2026-05-18
**Decision:** Once an application is submitted by a contractor, no UPDATE or DELETE is permitted via any API route. The record is permanent.
**Reason:** Creates a tamper-proof audit trail. Protects both the contractor (record of what they actually did) and the manager (proof of contractor accountability). An EPA inspector seeing immutable records with timestamps and chain of custody is a meaningful trust signal. Mutability would undermine the core product promise.
**Implementation:** RLS policy on applications table grants contractors INSERT only (no UPDATE, no DELETE). Managers get SELECT only. No API route exposes UPDATE or DELETE for applications.
**Alternatives considered:** Allowing a "correction" flow with admin override. Rejected — adds complexity and weakens the immutability guarantee.

---

## ADR-002 — Weather Captured Server-Side at Submission Time

**Date:** 2026-05-18
**Decision:** Weather data is fetched by the API route at the moment of application submission using the GPS coordinates submitted by the contractor. The contractor never manually enters weather data.
**Reason:** Manual weather entry is the most commonly missing or inaccurate data point in compliance records (confirmed by customer interviews). Auto-capture eliminates human error, removes a compliance gap, and is one of the three validated key differentiators vs. SprayMapper.
**Implementation:** POST /api/applications fetches OpenWeatherMap current conditions using lat/lng from the request body, runs compliance check, then inserts both the application and weather_snapshot in a single server-side transaction.
**Alternatives considered:** Letting contractors manually input weather. Rejected — defeats the core value proposition.

---

## ADR-003 — Role-Based Routing via Middleware

**Date:** 2026-05-18
**Decision:** Next.js middleware reads the user's role from their Supabase session and enforces route-level access. /contractor/* is contractor-only. /manager/* is manager-only.
**Reason:** Client-side guards can be bypassed. Server-side middleware catches every request before the page renders.
**Implementation:** src/middleware.ts reads supabase auth cookie, fetches profile.role, redirects unauthorized users to /login.
**Alternatives considered:** Client-side useEffect guards only. Rejected — security enforced at wrong layer.

---

## ADR-004 — Next.js API Routes Over Supabase Edge Functions

**Date:** 2026-05-18
**Decision:** Business logic lives in Next.js API routes, not Supabase Edge Functions.
**Reason:** Vibeathon time constraint. Next.js API routes are faster to develop, easier to debug locally, and deploy automatically with Vercel. The compliance engine and weather fetch are simpler to test in this context.
**Implementation:** src/app/api/* handles all business logic. Supabase is the database and auth layer only.
**Alternatives considered:** Supabase Edge Functions. Rejected for this build due to local dev friction and time constraint.

---

## ADR-005 — OpenWeatherMap for Weather Data

**Date:** 2026-05-18
**Decision:** OpenWeatherMap Current Weather API for weather capture.
**Reason:** Free tier available immediately, no credit card required, straightforward API with wind speed, direction, temperature, and humidity in one response. Sufficient for demo and pilot.
**Implementation:** src/lib/weather.ts wraps the /data/2.5/weather endpoint. Called server-side only -- API key never exposed to client.
**Endpoint:** GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=imperial
**Alternatives considered:** WeatherAPI.com, Tomorrow.io. OpenWeatherMap chosen for free tier simplicity.

---

## ADR-006 — Seed Data Required Before Demo

**Date:** 2026-05-18
**Decision:** scripts/seed.ts must be executed and verified before recording the demo video. The app must show real-looking data including at least two FLAGGED applications.
**Reason:** Judges viewing an empty dashboard cannot evaluate the product. The two flagged applications (wind violation and temp violation) are the core demo moments that demonstrate impact to the 40% Impact & Relevance criterion.
**Seed target:** 1 operation, 1 manager, 2 contractors, 3 fields, 5 products, 8 applications (5 compliant, 2 flagged, 1 pending).

---

## ADR-007 — Single Next.js App (Landing Page + App)

**Date:** 2026-05-18
**Decision:** The landing page lives at / in the same Next.js app as the contractor and manager routes.
**Reason:** One deployed Vercel URL for judges. One ZIP file for submission. Simpler demo flow -- judges can see the landing page and click into the app from one URL.
**Alternatives considered:** Separate static site for landing page. Rejected -- adds complexity for no judging benefit.

---

## ADR-008 — react-pdf for PDF Export

**Date:** 2026-05-18
**Decision:** react-pdf library for generating audit-ready PDF exports server-side.
**Reason:** Generates real PDFs with structured layout (not HTML-to-PDF screenshots). Output looks professional for an audit document.
**Implementation:** src/lib/pdf.ts. Called from GET /api/export/[id]. Returns PDF as binary response with Content-Disposition: attachment header.
**Alternatives considered:** jsPDF + html2canvas. Rejected -- screenshot-based PDFs look unprofessional for a compliance audit document.
