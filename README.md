# FieldLog

**Contractors logged. You verify. Compliant operations.**

A mobile-first pesticide application compliance and contractor management platform for mid-to-large agricultural operations. Contractors log every spray; managers verify compliance against EPA label rules and live weather; every record is immutable and audit-ready. Built for Codefi Vibeathon 2026, Problem 2.

---

## Live demo

**Production URL:** https://fieldlog-kappa.vercel.app

| Role | Email | Password |
|---|---|---|
| Manager | jake@caspianag.com | FieldlogDemo2026! |
| Contractor (Maria Santos) | maria@caspianag.com | FieldlogDemo2026! |
| Contractor (Tyler Reed) | tyler@caspianag.com | FieldlogDemo2026! |

The seed includes 8 applications: 5 compliant, 2 flagged (one wind violation on Maria/North Field/Roundup, one temperature violation on Tyler/South Creek/Engenia), and 1 pending. Both flagged applications drive the compliance engine's "money moment" in the manager dashboard.

---

## What it does

- **Contractors** log spray applications from the field on mobile. GPS captured at submit; live weather pulled from OpenWeatherMap at that exact location.
- **The compliance engine** checks each application against the product's EPA label limits (wind speed, temperature range, max application rate) and tags violations.
- **Managers** see every application in real time, drill into any audit record, and download tamper-proof PDF reports for EPA inspections.

Applications are **immutable after submit** — no UPDATE or DELETE path exists anywhere in the API.

---

## Tech stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Supabase (Postgres + Auth + RLS) · Recharts · Leaflet (Esri satellite tiles) · @react-pdf/renderer · OpenWeatherMap · Upstash Redis (rate limiting) · Vercel.

---

## Local development

```bash
pnpm install
cp .env.local.example .env.local   # fill in Supabase + OWM + Upstash keys
pnpm dev
```

See [BLUEPRINT.md](BLUEPRINT.md) for architecture, [SECURITY.md](SECURITY.md) for the security model, and [docs/handoffs/](docs/handoffs/) for the build log across phases.
