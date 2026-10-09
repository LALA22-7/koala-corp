# 🐨 Koala Corp. — AI Workforce OS

> **The Operating Layer for Supervised AI Business Work.**  
> Create, coordinate, supervise, and measure specialized digital workers within verifiable business workflows and explicit human-in-the-loop governance.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🌟 Executive Overview

Modern businesses and digital agencies are adopting AI, but their tools are fragmented across ad-hoc chat windows, spreadsheets, standalone automation scripts, and manual coordinators. The result is invisible work, zero auditability, high error risk, and organizational anxiety.

**Koala Corp.** transforms fragmented AI into a cohesive, accountable **AI Workforce OS**:
* **Work First, Agents Second**: Work is structured into repeatable, multi-step workflows—not open-ended chat rooms.
* **Human-in-the-Loop Oversight**: Consequential decisions (budget changes, outbound client communications, sensitive record updates) automatically halt and route to human supervisors for authorization.
* **Defined Autonomous Boundaries**: Each AI worker has explicit permissions, operational mandates, and hard policy bounds.
* **Outcomes Over Token Counts**: Tracks real business metrics—hours saved, blended labor value, autonomous throughput, and first-pass accuracy.

---

## 📸 Key Interfaces & Capabilities

### 1. Operations Overview (Command Center) — `/`
* **Real-time KPI metrics**: Active workflows, completed runs, review queue, and system exceptions.
* **Hero Command Strip**: Features the authentic Koala mascot with physics-based floating animation and active status telemetry.
* **Needs Attention Queue**: Instantly highlights pending approvals, failed task runs, and connection authorization warnings.
* **Work Under Management**: Live tabular view of ongoing and recent task executions.

### 2. Workflows & Step Execution — `/workflows` & `/workflows/[id]`
* **Workflow Catalog**: Filter by active, paused, or draft states across client tenancies.
* **Visual Vertical Step Sequence**: Step-by-step audit track (Data Ingestion → Validation → Anomaly Analysis → Quality Review → Routing).
* **Live Simulated Execution**: Trigger workflow runs with live state progression and step output inspection.
* **Failure Recovery**: Inspect failure root causes and re-trigger simulated runs with one click.

### 3. Approvals & Governance Queue — `/approvals`
* **Supervisory Trust Layer**: Dedicated review queue for high-consequence proposals.
* **Policy Trigger Attribution**: Explains *why* human review was triggered (e.g., *"Policy Rule: Outbound message with monetary claim > $500 requires human sign-off"*).
* **Evidence & Payload Inspector**: Review collected evidence, draft email diffs, and calculated figures before approving.
* **Decision Controls**: **Approve** (resumes workflow), **Request Revision** (returns notes to worker), **Reject** (logs rationale), or **Snooze**.

### 4. Workforce Directory & Profiles — `/workforce` & `/workforce/[id]`
* **Specialized AI Workers**: Configured for specific functions (e.g., *Maya Rodriguez — Invoicing Specialist*, *Elena Rostova — Dispute Analyst*).
* **Autonomous Boundaries**: Enforces strict operational rules (e.g., *"Cannot modify pricing tiers"*, *"10 requests/min rate limit"*).
* **Worker Mandates**: Inspect model specifications (Claude 3.5 Sonnet / GPT-4o), prompt guidelines, granted permissions, and execution histories.
* **Worker Provisioning**: Deploy new digital workers with custom mandates and boundaries via the modal builder.

### 5. Activity Log & Audit Trail — `/activity`
* **Immutable Event Log**: Chronological audit stream recording every automated step, decision, and system warning.
* **Multi-Factor Filters**: Filter by event type, responsible worker, client tenancy, or search query.
* **Raw JSON Inspector**: View exact event payloads for compliance and engineering debugging.
* **Audit Export**: Working one-click export of filtered event logs to JSON.

### 6. Integrations Directory — `/integrations`
* **Enterprise Ecosystem**: Pre-configured connectors for Google Ads, Meta Ads, Google Analytics, HubSpot CRM, Slack, and Stripe.
* **Health & Auth Monitoring**: Identifies expired OAuth tokens or rate-limiting warnings.
* **Workflow Dependency Mapping**: View which workflows depend on specific data connections.
* **Connect / Disconnect Dialogs**: Interactive credential validation modal with zero-knowledge vault simulation.

### 7. Reports & Analytics — `/reports`
* **Executive ROI Summary**: Calculates estimated hours saved (380+ hrs) and blended labor value ($24,000+).
* **Daily Throughput Chart**: Interactive visual volume chart of task runs over the week.
* **Supervisory Oversight Ratio**: Visual breakdown of fully autonomous runs (94.2%) vs human interventions (5.8%).
* **Worker League Table**: Performance ratings, task throughput, and reliability rankings.

### 8. Settings & Autonomy Policies — `/settings`
* **Workspace Identity**: Manage organization name and domain.
* **Global Autonomy Boundaries**: Organization-wide toggles for external communications, internal database updates, and budget modifications.
* **Brand Showcase & Dark Mode**: Interactive mascot showcase with live Dark Mode toggle.
* **State Reset**: Instant "Reset Prototype State" button to restore fresh baseline seed data anytime.

---

## 🎨 Design System & Aesthetics

* **Visual Identity**: Built around the authentic **Friendly Koala Corp.** mascot on signature **Koala Lime (`#A4D233` / `#A6F33C`)** and **Deep Obsidian Charcoal (`#121411`)**.
* **Glassmorphism**: Custom tokens (`.glass-panel`, `.glass-card`, `.glass-header`, `.glass-badge`) with `backdrop-filter: blur(16px)` and subtle frosted borders.
* **Typography**:
  * Headings: **Space Grotesk** (geometric, authoritative).
  * Body: **Inter** (clean, highly readable).
  * Telemetry & Code: **JetBrains Mono** (precise, technical).
* **Micro-Animations**:
  * Physics-based floating animation on mascot (`animate-float`).
  * Live status indicator pulse (`status-pulse`).
  * Smooth card elevations and button glows on hover.
* **Dark Mode**: Complete light/dark theme toggle persisted to `localStorage` and synchronized via React Context.
* **Collapsable Sidebar**: Smooth 240px to 76px animated rail toggle with hover tooltips and centered mascot branding.
* **Command Palette (`⌘K`)**: Universal search modal to jump to any workflow, worker, or approval item instantly.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Custom Glassmorphism Tokens |
| **Icons** | Lucide React |
| **State Management** | Centralized React Context + Reducer (`useApp`) |
| **Asset Optimization** | Next.js Image + Pre-rendered High-Res PNGs |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.17.0` or higher (Node 20+ recommended)
* **npm**: `v9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/koala-corp.git
   cd koala-corp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🚢 Deploying to Vercel (Step-by-Step)

The application is built specifically for zero-config deployment on **Vercel**:

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Koala Corp AI Workforce OS prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/koala-corp.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   * Go to [vercel.com](https://vercel.com) and log in.
   * Click **"Add New..."** → **"Project"**.
   * Select your `koala-corp` GitHub repository and click **Import**.

3. **Configure Project Settings**:
   * **Framework Preset**: Next.js (automatically detected)
   * **Root Directory**: `./` (or leave default)
   * **Build Command**: `npm run build`
   * **Output Directory**: `.next`
   * No environment variables are required for the standalone prototype.

4. **Deploy**:
   * Click **Deploy**. Vercel will build and deploy your site in ~45 seconds.
   * You will receive a live production URL (e.g. `https://koala-corp.vercel.app`).

### Option 2: Deploy using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login and deploy
vercel
```

---

## 📂 Project Architecture

```
koala-corp/
├── public/
│   ├── koala-mascot.png        # Zoomed-in transparent koala mascot
│   ├── koala-brand-full.png    # Transparent mascot + wordmark
│   ├── koala-badge.png         # Rounded lime artwork badge
│   └── logo.png                # Original source artwork
├── src/
│   ├── app/
│   │   ├── activity/page.tsx   # Activity audit trail & JSON exporter
│   │   ├── approvals/page.tsx  # Human-in-the-loop review queue
│   │   ├── integrations/page.tsx # External connections directory
│   │   ├── reports/page.tsx    # Executive ROI & throughput analytics
│   │   ├── settings/page.tsx   # Workspace policies & dark mode showcase
│   │   ├── workflows/
│   │   │   ├── page.tsx        # Workflow catalog & creation modal
│   │   │   └── [id]/page.tsx   # Step timeline, run simulator, recovery
│   │   ├── workforce/
│   │   │   ├── page.tsx        # AI worker directory & provisioning
│   │   │   └── [id]/page.tsx   # Worker mandate, parameters & audit history
│   │   ├── globals.css         # Glassmorphism tokens, dark theme & keyframes
│   │   ├── layout.tsx          # Root layout with ThemeProvider & AppShell
│   │   └── page.tsx            # Operations Overview Command Center
│   ├── components/
│   │   ├── app-shell.tsx       # Collapsable sidebar, header, ⌘K palette
│   │   ├── logo.tsx            # Koala brand components with float physics
│   │   ├── theme-toggle.tsx    # Persistent Dark Mode toggle component
│   │   └── ui.tsx              # Glassmorphic Card, Button, Modal, Badges
│   └── lib/
│       ├── seed-data.ts        # Comprehensive agency demo dataset
│       ├── store.tsx           # Centralized reactive reducer store
│       ├── types.ts            # Core TypeScript data contracts
│       └── utils.ts            # Date formatters, colors, duration helpers
├── next.config.ts              # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Designed with craft for **Koala Corp.** — *The AI Workforce OS*.
