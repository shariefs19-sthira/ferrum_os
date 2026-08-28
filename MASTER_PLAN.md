# 🏗️ Ferrum OS - Master Project Context & Build Plan

**Owner:** Sharief S (sharief.s19@gmail.com)  
**GitHub:** shariefs19-sthira  
**Status:** Phase 2 - Product Launch & Integration  
**Last Updated:** 2026-08-28

---

## 1. The Core Vision

Ferrum OS is an "Operating System for Construction." It unbundles the traditional General Contractor model. Instead of one company taking a massive margin, Ferrum OS acts as the central nervous system:

- **Automates:** Design, estimation, procurement, and project management via AI.
- **Orchestrates:** A gig-economy pool of verified professionals (Architects, Engineers, Safety Officers, Subcontractors) who only verify and execute.
- **Delivers:** "Plug and Play" construction. A user can buy a single service (e.g., just painting) or a full "Design-to-Build" package.

---

## 2. Product Portfolio Status

The Ferrum OS product suite is now tracked across the P1-P9 roadmap. Current live status is as follows:

- **P1 – LandIntel:** Live. ULPIN lookup flows are active and enhanced with a real-API lookup path plus offline fallback behavior when the external service is unavailable.
- **P2 – DesignStudio:** Planned / not yet launched; concept work remains staged for the next product release.
- **P3 – Structura:** Live product page in the web app and linked from the product grid.
- **P4 – BOQ Pro:** Live MVP. Quantity takeoff and cost estimation flows remain active and are being matured toward full production readiness.
- **P5 – ProMarket:** Live product page in the web app.
- **P6 – BuildOS:** Live product page in the web app.
- **P7 – ProcureHub:** Live product page in the web app.
- **P8 – InvestFlow:** Live product page in the web app.
- **P9 – CommunityBuild:** Live product page in the web app.

> Current platform status: P1-P9 are tracked in the product roadmap. Most pages are active, with P2 remaining the only staged product while the rest of the suite is live or MVP-ready.

---

## 3. Technology Stack (Monorepo Architecture)

To ensure seamless Web and Mobile App performance at a global scale:

- **Frontend (Web):** Next.js 14+ (React) with App Router
- **Frontend (Mobile App):** React Native (via Expo) - Shares 80% code with Web
- **Backend API:** Node.js with NestJS - High-performance API, real-time AI PM chat
- **AI & Vision Microservices:** Python with FastAPI - OCR (Tesseract/PaddleOCR), Computer Vision (YOLOv8), LLM Orchestration (LangChain)
- **Database:** PostgreSQL 15+ with **PostGIS** (for Bhu-Aadhaar/ULPIN land polygons and geo-spatial data) + Redis (caching/AI memory)
- **ORM:** Prisma or TypeORM
- **Infrastructure:** Cloudflare (Edge/DDoS) + AWS/GCP
- **Containerization:** Docker + Kubernetes for scaling

---

## 4. Monorepo Folder Structure

```text
ferrum_os/
├── apps/
│   ├── web/                    # Next.js Website
│   ├── mobile/                 # React Native App (Expo)
│   ├── api/                    # NestJS Backend
│   └── ai/                     # Python FastAPI (Vision, OCR, LLM)
├── packages/
│   ├── shared/                 # Shared types, constants, utilities
│   ├── database/               # PostgreSQL schema, Prisma models
│   └── ui/                     # Shared React components
├── docs/
│   ├── MASTER_PLAN.md          # This file
│   ├── IDEA_LOG.md             # New features & ideas backlog
│   ├── AI_WORKFLOW.md          # AI agent coordination guide
│   ├── ACTIVITY_LOG.md         # Timestamped activity log
│   └── QUICK_START.md          # Quick start guide
└── infrastructure/
    ├── docker/                 # Docker configurations
    └── k8s/                    # Kubernetes manifests
```

---

## 5. Current Delivery Priorities

1. Finalize live product-page polish across the P3-P9 portfolio.
2. Continue LandIntel API hardening and data-source integration.
3. Mature BOQ Pro estimation workflows into a production-ready experience.
4. Keep build artifacts ignored and repository line endings normalized for clean CI and local dev churn.
