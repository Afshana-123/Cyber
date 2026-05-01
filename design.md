# ChainTrust — Design System & UI Specification
**Blockchain-Based Public Fund Tracking & Anti-Corruption Platform**

---

## 1. Brand Identity

### Product Name
**ChainTrust** — *Public Ledger AI*

### Tagline
*"Every rupee. Every block. Every citizen."*

### Brand Personality
- Authoritative yet accessible
- Trustworthy and transparent
- Technologically advanced but human-centered
- Institutional gravitas with fintech polish

---

## 2. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary-950` | `#0a0f2e` | Deep navy — sidebar bg, headers |
| `--color-primary-900` | `#0f1a4a` | Dark indigo — sidebar hover |
| `--color-primary-700` | `#1e3a8a` | Royal blue — primary buttons, active states |
| `--color-primary-500` | `#3b82f6` | Bright blue — links, highlights |
| `--color-primary-200` | `#bfdbfe` | Light blue — tinted backgrounds |
| `--color-primary-50`  | `#eff6ff` | Near-white blue — page backgrounds |

### Accent Palette (Trust / Verified)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-emerald-600` | `#059669` | Verified badge, approved status |
| `--color-emerald-500` | `#10b981` | Success states, fund verified |
| `--color-emerald-100` | `#d1fae5` | Verified background tint |
| `--color-emerald-50`  | `#ecfdf5` | Light success bg |

### Semantic Palette

| Token | Hex | Semantic Role |
|-------|-----|---------------|
| `--color-amber-500`   | `#f59e0b` | Warning — investigating, under review |
| `--color-amber-100`   | `#fef3c7` | Warning background |
| `--color-red-600`     | `#dc2626` | Danger — fraud flagged, critical |
| `--color-red-100`     | `#fee2e2` | Danger background |
| `--color-slate-900`   | `#0f172a` | Primary text |
| `--color-slate-600`   | `#475569` | Secondary text |
| `--color-slate-300`   | `#cbd5e1` | Borders, dividers |
| `--color-slate-100`   | `#f1f5f9` | Card backgrounds |
| `--color-white`       | `#ffffff` | Surface, cards |

### Gradient Definitions

```css
/* Hero gradient — sidebar & top bar accent */
--gradient-primary: linear-gradient(135deg, #0a0f2e 0%, #1e3a8a 100%);

/* Subtle card shimmer */
--gradient-card: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);

/* Risk score — low to high */
--gradient-risk: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #dc2626 100%);

/* Glassmorphism overlay */
--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);

/* Fund flow nodes */
--gradient-flow: linear-gradient(180deg, #3b82f6 0%, #1e3a8a 100%);
```

---

## 3. Typography

### Font Stack

```css
/* Display / Headings */
font-family: 'DM Sans', 'Sora', sans-serif;

/* Body / UI Text */
font-family: 'IBM Plex Sans', 'DM Sans', sans-serif;

/* Monospace — Transaction IDs, hashes */
font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
```

> **Why DM Sans + IBM Plex?** DM Sans gives geometric authority at large sizes. IBM Plex carries institutional credibility (used by IBM, banks, UN agencies) with excellent data density at small sizes. The mono variant makes blockchain hashes feel technical and precise.

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display XL | 48px | 700 | 1.1 | -0.03em |
| Display L | 36px | 700 | 1.15 | -0.02em |
| Heading 1 | 28px | 600 | 1.2 | -0.01em |
| Heading 2 | 22px | 600 | 1.3 | -0.01em |
| Heading 3 | 18px | 600 | 1.4 | 0 |
| Body L | 16px | 400 | 1.6 | 0 |
| Body M | 14px | 400 | 1.5 | 0 |
| Body S | 13px | 400 | 1.5 | 0 |
| Caption | 11px | 500 | 1.4 | 0.04em |
| Mono | 13px | 400 | 1.4 | 0 |

---

## 4. Spacing System

Uses an 8px base grid:

```
4px   — micro (icon gaps, badge padding)
8px   — xs
12px  — sm
16px  — md (default padding)
24px  — lg
32px  — xl
48px  — 2xl (section gaps)
64px  — 3xl
96px  — 4xl
```

---

## 5. Elevation & Shadow System

```css
/* Level 0 — flat, no shadow */
--shadow-0: none;

/* Level 1 — cards at rest */
--shadow-1: 0 1px 3px rgba(10, 15, 46, 0.06), 0 1px 2px rgba(10, 15, 46, 0.04);

/* Level 2 — hovered cards */
--shadow-2: 0 4px 12px rgba(10, 15, 46, 0.08), 0 2px 6px rgba(10, 15, 46, 0.05);

/* Level 3 — modals, dropdowns */
--shadow-3: 0 10px 30px rgba(10, 15, 46, 0.12), 0 4px 12px rgba(10, 15, 46, 0.08);

/* Level 4 — alerts, fraud panels */
--shadow-alert: 0 0 0 1px rgba(220, 38, 38, 0.15), 0 8px 24px rgba(220, 38, 38, 0.12);

/* Glow — verified status */
--shadow-verified: 0 0 0 2px rgba(16, 185, 129, 0.3), 0 4px 16px rgba(16, 185, 129, 0.15);
```

---

## 6. Border Radius

```css
--radius-sm: 6px;    /* Badges, tags */
--radius-md: 10px;   /* Buttons, inputs */
--radius-lg: 14px;   /* Cards */
--radius-xl: 20px;   /* Panels, modals */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 7. Component Library

### 7.1 Metric Card (KPI)

```
┌─────────────────────────────────┐
│  🔷 Icon   Label text            │
│                                  │
│  ₹ 2,847 Cr          ↑ 12.4%   │
│  Total Funds Tracked   vs last   │
│                        month     │
│  ▓▓▓▓▓▓▓▒░░░ sparkline          │
└─────────────────────────────────┘
```

**States:** default → hover (shadow-2, slight Y-translate) → active

**Variants:**
- `neutral` — slate border
- `success` — emerald left border + tint bg
- `warning` — amber left border + tint bg
- `danger` — red left border + tint bg + subtle pulse on icon

---

### 7.2 Status Badge

```css
/* Variants */
.badge-verified  { bg: emerald-100; color: emerald-700; }
.badge-flagged   { bg: red-100;     color: red-700;     }
.badge-pending   { bg: amber-100;   color: amber-700;   }
.badge-resolved  { bg: slate-100;   color: slate-600;   }
```

Anatomy: `[● dot] [Label text]` — 11px caps, 500 weight, 4px radius, 6px/12px padding

---

### 7.3 Risk Score Gauge

Circular SVG gauge (270° arc):
- **0–30** → Emerald (Low Risk)
- **31–60** → Amber (Medium Risk)
- **61–85** → Orange (High Risk)
- **86–100** → Red (Critical)

Center displays: large score number + "Risk Score" label + small delta arrow

Animation: stroke-dashoffset transition, 1.2s ease-out on load

---

### 7.4 Fraud Alert Row

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️  [PROJ-2847] Mumbai Metro Extension     Risk: 87  [HIGH]  │
│     Above market rate detected · ₹42.3 Cr overspend          │
│     Flagged by AI · 2 hours ago               [Investigate →]│
└──────────────────────────────────────────────────────────────┘
```

- Left red accent bar (3px)
- Hover: entire row lifts, red border appears
- Pulsing dot on critical items

---

### 7.5 Transaction Table Row

```
TXN-8821941    | Smart Roads Ph2   | ₹1.24 Cr | Govt → Infra Corp | ✅ Verified | 14:32 IST
```

Columns: ID (mono font) | Project | Amount (right-aligned, tabular nums) | Flow | Status | Time

Row hover: `--primary-50` background, subtle transition

---

### 7.6 Fund Flow Diagram (Node Graph)

Node types:
- **Government** → Deep blue hexagon (#1e3a8a)
- **Ministry/Dept** → Blue rounded square
- **Contractor** → Indigo pill
- **Vendor** → Slate card
- **Worker/Beneficiary** → Emerald circle (terminal node)

Edges:
- Verified flows: Emerald solid line with animated dash-flow
- Flagged flows: Red dashed line with warning icon
- Edge width = proportional to fund amount

---

### 7.7 Sidebar Navigation

```
┌─────────────────┐
│  ⬡ ChainTrust   │  ← Logo + wordmark
│  Public Ledger AI│
├─────────────────┤
│  Overview        │
│                  │
│  📊 Dashboard  ● │  ← Active state: white text, primary-700 bg
│  📁 Projects     │
│  📋 Tenders      │
│  💸 Transactions │
│  🚨 Fraud Det.   │  ← Badge: 3 new alerts
│  📜 Audit Logs   │
│  👁️ Public View  │
├─────────────────┤
│  System          │
│  ⚙️ Settings     │
│  ❓ Help         │
├─────────────────┤
│  [Avatar] Arjun  │  ← User profile
│  Admin ▼         │  ← Role switcher
└─────────────────┘
```

Sidebar bg: `--gradient-primary`
Text: white at 80% opacity (inactive), 100% (active)
Active item: `rgba(255,255,255,0.12)` bg, left white border 3px
Width: 240px (expanded), 64px (collapsed)

---

### 7.8 Top Navigation Bar

```
[☰]  [🔍 Search projects, transactions, tenders...]   [🔔 3]  [⬡ Mainnet ●]  [Avatar]
```

- Search: 480px wide, glassmorphism style, cmd+K shortcut hint
- Blockchain status: Green pulsing dot + "Mainnet Live" — clicking shows block explorer
- Notifications: Slide-out panel from right

---

## 8. Screen Specifications

### Screen 1: Admin Dashboard

**Layout:** 240px sidebar + top bar (64px) + main content

**Main content grid:**
```
[Metric] [Metric] [Metric] [Metric]   ← 4-col equal width
[Fund Flow Diagram — 60%] [Risk Gauge — 40%]
[Fraud Alerts Panel — 40%] [Live Transactions — 60%]
[Project Cards — 3-col grid]
```

**Metric Cards (top row):**
1. Total Funds Tracked — ₹28,470 Cr — neutral
2. Active Projects — 142 — success
3. Flagged Transactions — 23 — danger (pulsing icon)
4. System Health Score — 87/100 — success

**Fund Flow Visualization:**
- Animated node graph
- Timeline scrubber below (drag to see historical flow)
- Toggle: "Show by Ministry" / "Show by Project"
- Zoom in/out controls

**Fraud Alert Panel:**
- Header: "🚨 Active Alerts" + count badge
- Sorted by risk score descending
- Each item expandable (show full AI reasoning)
- Quick actions: [Investigate] [Dismiss] [Escalate]

**Project Status Cards:**
- Progress ring (circular)
- Budget bar (target vs actual — overspend shown in red)
- Last blockchain verification timestamp
- Stage label: Planning / Execution / Audit / Complete

---

### Screen 2: Auditor Analytics View

**Triggered by:** Role switcher → Auditor

**Layout changes:**
- Sidebar gains "Audit Tools" section
- Main area becomes denser / more data-rich

**New panels:**

**Immutable Action Timeline:**
```
────●──────────●──────────●──────────●────▶ time
  Contract     First      AI Flag    Escalated
  Signed       Payment    Raised     to CBI
  Jun 2       Jun 15      Jul 3      Jul 5
```
- Click any node: slide-in evidence panel
- Non-editable / tamper-proof visual treatment

**Evidence Panel (slide-in drawer):**
```
┌──────────────────────────────────────────┐
│ 📄 Evidence Pack — TXN-8821941           │
│                                          │
│ Tags: [Multi-sig approved] [AI Flagged]  │
│       [CBI Notified] [Blockchain Sealed] │
│                                          │
│ Transaction Hash:                        │
│ 0x3fa2...8b91 [copy] [view on chain]     │
│                                          │
│ AI Analysis:                             │
│ "Bid price 340% above market median for  │
│  identical scope in 3 neighboring dists" │
│                                          │
│ Supporting Documents: [3 files]          │
│                                          │
│ [📥 Export PDF Report]  [🖨️ Print]       │
└──────────────────────────────────────────┘
```

**Drill-Down Analytics:**
- Contractor network graph (linked entities)
- Bid comparison table
- Spending velocity chart (time series)
- Heatmap: Corruption Risk Index by State/District

**Explainable AI Popup ("Why flagged?"):**
```
┌────────────────────────────────────┐
│ 🤖 Why was this flagged?           │
│                                    │
│ 3 signals detected:                │
│ ① Bid price 3.4× market rate       │
│    Confidence: 94%                 │
│ ② Same vendor awarded 8 contracts  │
│    in 90 days — same official      │
│    Confidence: 87%                 │
│ ③ Invoice dates precede contract   │
│    signing by 12 days              │
│    Confidence: 99%                 │
│                                    │
│ Combined Risk Score: 91/100        │
│ [View full AI report]              │
└────────────────────────────────────┘
```

---

### Screen 3: Public Transparency View

**Design philosophy:** Radically simplified. No jargon. Citizen-first.

**Layout:** No sidebar. Single-column. Wider content area. Soft, warm background.

**Header:**
```
ChainTrust Public Portal
"See how your tax money is being spent"
[🔍 Search any project or city...]
```

**Project Card (public-facing):**
```
┌─────────────────────────────────────────┐
│  🏗️ Mumbai Metro Line 7 Extension        │
│  Maharashtra · Infrastructure            │
│                                          │
│  Budget: ₹4,200 Cr  │  Spent: ₹1,847 Cr│
│  ██████████░░░░░░░░  44% utilized        │
│                                          │
│  Transparency Score   Quality Score      │
│       ⬡ 94/100           ★ 4.2/5        │
│       Excellent           Good           │
│                                          │
│  Last verified: 2 hours ago  ✅          │
│  [View details →]                        │
└─────────────────────────────────────────┘
```

**Stats Bar (top of public view):**
```
₹28,470 Cr tracked  ·  142 active projects  ·  Last updated: just now
```

**Fund Usage Explainer:**
Simple donut chart + legend:
- Construction: 52%
- Materials: 23%
- Labour: 18%
- Admin: 7%

**Transparency Timeline:**
Human-readable milestone feed:
```
✅ Jul 5, 2025 — Payment ₹240 Cr released to Infra Corp
✅ Jun 28, 2025 — Site inspection passed (3rd party auditor)
✅ Jun 15, 2025 — Contract signed. Hash: 0x3f...91
```

**Citizen Feedback Button:**
```
[💬 Report a concern about this project]
```

---

## 9. Motion & Animation Spec

### Principles
- Purposeful: every animation communicates state or guides attention
- Fast: UI transitions ≤ 200ms; data animations ≤ 1200ms
- Smooth: ease-out for enters, ease-in-out for transforms

### Keyframe Library

```css
/* Card entrance */
@keyframes card-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fraud alert pulse */
@keyframes fraud-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
}

/* Fund flow dash animation */
@keyframes flow-dash {
  to { stroke-dashoffset: -20; }
}

/* Status dot pulse (blockchain live) */
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}

/* Risk score gauge fill */
@keyframes gauge-fill {
  from { stroke-dashoffset: 283; }
  to   { stroke-dashoffset: var(--target-offset); }
}
```

### Interaction States

| Interaction | Duration | Easing | Effect |
|-------------|----------|--------|--------|
| Button hover | 150ms | ease-out | +2px Y shadow, bg lighten |
| Card hover | 200ms | ease-out | translateY(-2px), shadow-2 |
| Row hover | 120ms | ease | bg tint fill |
| Modal open | 250ms | cubic-bezier(.16,1,.3,1) | scale 0.96→1, fade |
| Sidebar collapse | 300ms | ease-in-out | width transition |
| Alert enter | 400ms | spring | slide + bounce |
| Number count-up | 1000ms | ease-out | numeric odometer |

---

## 10. Icon System

Use **Lucide Icons** (consistent stroke width: 1.5px)

| Context | Icon | Name |
|---------|------|------|
| Dashboard | `LayoutDashboard` | Main nav |
| Projects | `FolderOpen` | Projects |
| Tenders | `FileText` | Tenders |
| Transactions | `ArrowLeftRight` | Transactions |
| Fraud Detection | `ShieldAlert` | Fraud |
| Audit Logs | `ClipboardList` | Audit |
| Public View | `Eye` | Public |
| Blockchain | `Link` / `Hexagon` | Chain |
| Verified | `ShieldCheck` | Trust |
| Alert | `AlertTriangle` | Warning |
| AI | `Sparkles` | AI flag |
| Export | `Download` | Export |
| Search | `Search` | Search |
| Risk | `Gauge` | Risk score |

---

## 11. Data Visualization Spec

### Chart Library: Recharts (React) or D3.js

**Charts used:**
1. **Metric Sparkline** — 24px height, no axes, emerald/red line
2. **Fund Flow Sankey** — custom D3 node-link diagram
3. **Risk Gauge** — SVG arc, animated stroke
4. **Spending Area Chart** — gradient fill under line, monthly
5. **Budget vs Actual Bar** — grouped horizontal bars
6. **Corruption Heatmap** — India state map, red intensity = risk
7. **Transaction Volume Timeline** — brushable time series

**Color rules for charts:**
- Always use CSS variable tokens, never hardcoded hex
- Colorblind-safe: use both color + shape/pattern encoding
- Gridlines: `--color-slate-100`, 1px
- Axes: `--color-slate-400`, Body S

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Layout change |
|------------|-------|---------------|
| Mobile | < 768px | Sidebar becomes bottom nav, single column |
| Tablet | 768–1023px | Sidebar collapses to 64px icon mode |
| Desktop | 1024–1439px | Full layout, 2-col content area |
| Wide | ≥ 1440px | Full layout, 3-col content area, wider cards |

---

## 13. Accessibility

- **WCAG 2.1 AA** compliance minimum
- All interactive elements keyboard-navigable (tab order)
- Focus rings: 2px solid `--color-primary-500`, 2px offset
- Color never used as the sole information carrier (always + icon or text)
- ARIA labels on all icon-only buttons
- Screen reader landmarks: `<nav>`, `<main>`, `<aside>`, `<header>`
- Minimum touch target: 44×44px
- Font sizes never below 12px
- Reduced motion: `@media (prefers-reduced-motion)` disables all non-essential animations

---

## 14. Dark Mode (Optional Extension)

```css
[data-theme="dark"] {
  --bg-page:    #060b1f;
  --bg-card:    #0d1535;
  --bg-sidebar: #070c20;
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --border:     rgba(255,255,255,0.08);
}
```

---

## 15. Google Stitch Prompt Engineering Notes

When generating in Google Stitch:

1. **Screen order:** Generate Admin → Auditor → Public in that sequence
2. **Anchor colors early** in the prompt: specify exact hex codes
3. **Name components explicitly:** "metric card", "fraud alert row", "node graph"
4. **Specify font names** in the prompt: "DM Sans for headings, IBM Plex Sans for body"
5. **Use spatial language:** "left sidebar 240px", "4-column top row", "split 60/40 panel"
6. **Call out key differentiators:** risk score gauge, fund flow animation, AI popup
7. **State interactions explicitly:** "hover state", "expanded card state", "active nav item"
8. **Include a "do not" list:** no purple, no generic bootstrap cards, no flat 1990s gov style

---

## 16. File & Asset Structure (Dev Handoff)

```
chainrust/
├── design-tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── components/
│   ├── MetricCard/
│   ├── FraudAlertRow/
│   ├── RiskGauge/
│   ├── FundFlowDiagram/
│   ├── TransactionTable/
│   ├── ProjectCard/
│   ├── Sidebar/
│   └── TopBar/
├── screens/
│   ├── AdminDashboard.tsx
│   ├── AuditorView.tsx
│   └── PublicView.tsx
├── hooks/
│   ├── useBlockchainStatus.ts
│   └── useFraudAlerts.ts
└── design.md   ← this file
```

---

*ChainTrust Design System v1.0 — Built for transparency, designed for trust.*
