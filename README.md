# Businessplan24

> **Dein Businessplan in 30 Minuten — von KI geschrieben, von dir perfektioniert.**
> Für Gründer:innen, Investoren-Pitches, Banken und die Arbeitsagentur.

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_Sonnet_4.6-Anthropic-d97706?logo=anthropic)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635bff?logo=stripe&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

🌐 **Live:** <https://businessplans24.com>

---

## Warum Businessplan24?

Der Businessplan ist für 99 % der Gründer:innen das größte Hindernis vor dem Start.
Excel-Vorlagen sind leer, Beratungen kosten 800–2.000 € und dauern Wochen.
**Businessplan24 schlägt diesen Knoten in einer halben Stunde durch.**

| Problem | Klassisch | Businessplan24 |
|---|---|---|
| Leeres Blatt | 3–5 Tage Research | Geführter Wizard mit Vorlagen |
| Professionelle Formulierung | Beratung, 80–120 €/h | Claude Sonnet 4.6, sofort |
| Finanzplanung | Excel mit Fehlern | Live-Charts, automatisch konsistent |
| PDF-Export | MS Word Nachbearbeitung | Ein Klick, A4, druckfertig |
| Mehrsprachig | Jedes Mal neu übersetzen | 22 Sprachen geplant |

## Was macht es besonders?

- 🧠 **KI-gestützt, nicht KI-geschrieben.** Claude schreibt den Entwurf, du editierst. Immer mit deiner Stimme, nie generisch.
- 🌍 **Länderspezifische Preise.** Ein Plan kostet in Deutschland 49 €, in Polen 29 €, in Schweden 549 SEK — Purchasing Power Parity integriert.
- 📊 **Echte Finanzcharts.** Kein Screenshot aus Excel — live gerenderte Rentabilitäts-, Liquiditäts- und Cashflow-Grafiken, die sich automatisch an deine Zahlen anpassen.
- 🔐 **DSGVO by default.** Daten bleiben bei uns in Deutschland (Hetzner Frankfurt), Zahlungsabwicklung über Stripe, keine Weitergabe an Dritte.
- ⚡ **Unter 100 kB Initial-Bundle.** Code-Splitting auf Route-Ebene, Charts lazy-geladen — die Seite ist schneller als dein Word-Dokument.

---

## Preismodell

| Plan | Preis (DE) | Für wen |
|---|---|---|
| **Einzelplan** | 49 € einmalig | Du brauchst einen Businessplan, fertig. |
| **Jahresabo** | 99 €/Jahr | Berater:innen, Seriengründer, Business-Coaches — unbegrenzte Pläne + Account + gespeicherte Entwürfe |

Regionale Preise in EUR/CHF/GBP/SEK/NOK/DKK/PLN/CZK/HUF/RON/BGN werden automatisch je nach Herkunftsland gesetzt. Bezahlt wird in lokaler Währung.

---

## Gliederung eines Plans

1. **Executive Summary** — die Kurzfassung, wird am Ende automatisch aus deinen Angaben erzeugt
2. **Geschäftsidee** — Produkte, Kundennutzen, Markt & Wettbewerb
3. **Kunden** — Zielgruppe, Vertriebswege, Kundenbindung
4. **Unternehmen** — Gründer, Team, Partner, Standort, Rechtsform, Risiken
5. **Finanzen** — Umsatz, Kosten, Privatbedarf, Kapitalbedarf & Finanzierung, Rentabilität, Liquidität
6. **Anhang** — ergänzende Dokumente

---

## Tech-Stack

**Frontend** · React 18 · TypeScript 5 · Vite 5 · Zustand · react-i18next · Chart.js 4
**Backend** · Node 20 · Express 4 · better-sqlite3 · Zod
**KI** · Anthropic Claude Sonnet 4.6 via offizielles SDK (mit Prompt-Caching)
**Zahlung** · Stripe Checkout (Einmalkauf + Abo), Webhook-gesteuerte Freischaltung
**PDF** · Puppeteer mit Chromium headless
**Admin** · Google Ads API für Keyword-Research und Kampagnen-Management
**Deployment** · Docker Compose auf Hetzner VPS, Nginx mit Let's Encrypt

---

## Architektur

```
┌──────────────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                           │
│                                                                  │
│  Public shell                 │   Admin shell                    │
│   /               Landing     │    /admin          Dashboard     │
│   /pricing        Preismodell │    /admin/users    Nutzer        │
│   /wizard         AI Wizard   │    /admin/payments Zahlungen     │
│   /preview/:id    PDF + Cart  │    /admin/ads      Google Ads    │
│   /account        User-Dash   │    /admin/ads/keywords Analyse   │
│                                                                  │
│  Code-split per Route · Charts lazy · i18n JSON per Language     │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────┴───────────────────────────────────────┐
│                Hetzner VPS (Frankfurt)                           │
│                                                                  │
│  Nginx  →  docker compose                                        │
│              ├── businessplans24-frontend (Nginx + dist/)        │
│              └── businessplans24-backend  (Express)              │
│                    │                                             │
│                    ├─ Anthropic Messages API (Claude)            │
│                    ├─ Stripe API + Webhook                       │
│                    ├─ Google Ads API (v17)                       │
│                    ├─ Puppeteer (Chromium) → PDF                 │
│                    └─ SQLite  (users, plans, payments, ads)      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Admin-Backoffice

Unter `/admin` läuft ein komplett separates Layout:

- **Dashboard** · Nutzer, aktive Abos, Umsatz 30 Tage, Nutzer pro Land
- **Nutzer** · Liste aller Accounts mit Rolle und Aboeinstellung
- **Zahlungen** · Jede Transaktion mit Status
- **Pläne** · Alle erstellten Businesspläne, bezahlt/unbezahlt
- **Google Ads → Kampagnen** · Performance (Impressions, Klicks, Conversions, Ø CPC) plus lokales Campaign-Management: anlegen, pausieren, starten, länder- und regionsspezifisch
- **Google Ads → Keyword-Analyse** · Seed-Keywords eingeben, Google liefert Ideen, Businessplan24 rechnet automatisch Rentabilität pro Klick aus (CPC × Conversion-Rate vs. Plan-Preis im Zielland) und sortiert: **Läuft** / **Grenzwertig** / **Meiden**

Wenn Google-Ads-Credentials fehlen, läuft der Bereich im **Mock-Modus** mit realistischen Beispieldaten.

---

## Internationalisierung

Sprachen zum Start: **Deutsch · Englisch**.
Geplant (europäische Hauptmärkte):
FR · IT · ES · PT · NL · PL · CS · SK · HU · RO · BG · HR · SL · DA · SV · NO · FI · EL · ET · LV · LT

Jede Sprache liegt als eigenständige JSON-Datei im `frontend/public/locales/<lang>/common.json`. Der Browser lädt **nur** die aktive Sprache — Wechsel ohne Neuladen.

Neue Sprache hinzufügen: Datei kopieren, übersetzen, Code in `SUPPORTED_LANGUAGES` eintragen. Fertig.

---

## Getting started (Dev)

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000

# Backend (anderes Terminal)
cd backend
npm install
cp .env.example .env # ANTHROPIC_API_KEY etc. eintragen
npm run dev          # http://localhost:5000

# Oder voll-containerisiert
docker compose up -d --build
```

Environment-Variablen in `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...           # erforderlich
JWT_SECRET=<32 random bytes>           # erforderlich
STRIPE_SECRET_KEY=sk_live_...          # optional (ohne → Mock-Checkout)
STRIPE_WEBHOOK_SECRET=whsec_...        # optional
GOOGLE_ADS_DEVELOPER_TOKEN=...         # optional (ohne → Mock Ads-Daten)
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...
ADMIN_EMAIL=lucas.schmutz@businessplans24.com
ADMIN_PASSWORD=<initial password>       # wird nur beim ersten Start gesetzt
FRONTEND_ORIGIN=https://businessplans24.com
```

---

## Project structure

```
businessplans24/
├── frontend/
│   ├── public/locales/{de,en}/common.json  # lazy-loaded translations
│   └── src/
│       ├── pages/        Landing, Wizard, Preview, Pricing, Login, Account
│       ├── wizard/       schema.ts (all questions), StepView, FinancePlanner
│       ├── admin/        Admin layout + pages (Dashboard, Ads, Keywords, …)
│       ├── components/   MiniCharts (Rentabilität, Liquidität)
│       ├── store/        Zustand stores (plan, auth, finance)
│       ├── api/          axios client
│       └── i18n/
├── backend/
│   └── src/
│       ├── routes/       generate, plans, auth, pricing, checkout,
│       │                 webhook, export, admin
│       ├── lib/          anthropic, db, auth, pdf, pricing, prompts,
│       │                 googleAds, bootstrap
│       └── middleware/   auth (optional / required / admin-only)
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Deployment

Pull-based deploy via systemd timer auf Hetzner VPS (188.245.172.75). Der Timer läuft alle 60 s, prüft `origin/main`, und führt bei neuem Commit ein lock-geschütztes Rebuild-Script aus. Kein SSH-Secret im CI-Runner, Rollbacks via `git reset`.

```
git push → GitHub → (CI Build Verify) → systemd timer pickup → rebuild → live (<60 s)
```

Nginx auf dem Host terminiert TLS (Let's Encrypt, auto-renew), leitet alles auf `127.0.0.1:8082` weiter.

---

## Roadmap

**v1 (live)**
- ✅ Wizard mit 6 Sektionen und 13+ Feldern
- ✅ Claude-Textgenerierung pro Sektion mit Prompt-Caching
- ✅ Country-basierte Preise (22 EU-Länder)
- ✅ Stripe Einmalkauf + Jahresabo
- ✅ Puppeteer-PDF mit Preview-Watermark
- ✅ Admin-Backoffice mit Google Ads Integration
- ✅ Keyword-Rentabilitäts-Analyse

**v1.1 (nächste Wochen)**
- [ ] 5 zusätzliche Sprachen (FR, IT, ES, NL, PL)
- [ ] E-Mail-Benachrichtigung bei Abo-Ablauf
- [ ] Versionierung von Plänen (Änderungshistorie)
- [ ] Export als Word (.docx) zusätzlich zu PDF

**v2 (Q3)**
- [ ] Beratungs-Marktplatz: Vermittlung an zertifizierte Berater:innen
- [ ] Integration BaFin-konforme Finanzierungsangebote
- [ ] API für Inkubatoren und Wirtschaftsförderungen

---

## Contact

**Businessplan24 UG (haftungsbeschränkt) i. G.**
Lucas Schmutz · Gründer
[lucas.schmutz@businessplans24.com](mailto:lucas.schmutz@businessplans24.com)

Für Presse und Kooperationen: [presse@businessplans24.com](mailto:presse@businessplans24.com).

---

## License

Proprietär. Der Quelltext ist ausschließlich für Audits durch Stripe, Anthropic und Cloud-Hoster zugänglich. Nicht zur Weiterverwendung freigegeben.

© 2026 Businessplan24 UG (i. G.)
