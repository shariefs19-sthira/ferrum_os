# 🏗️ Ferrum OS - Master Project Context & Build Plan

**Owner:** Sharief S (sharief.s19@gmail.com)  
**GitHub:** shariefs19-sthira  
**Status:** Phase 1 - Foundation  
**Last Updated:** 2026-08-27

---

## 1. The Core Vision
Ferrum OS is an "Operating System for Construction." It unbundles the traditional General Contractor model. Instead of one company taking a massive margin, Ferrum OS acts as the central nervous system:
- **Automates:** Design, estimation, procurement, and project management via AI.
- **Orchestrates:** A gig-economy pool of verified professionals (Architects, Engineers, Safety Officers, Subcontractors) who only verify and execute.
- **Delivers:** "Plug and Play" construction. A user can buy a single service (e.g., just painting) or a full "Design-to-Build" package.

---

## 2. Technology Stack (Monorepo Architecture)
- **Frontend (Web):** Next.js 14+ (React) with App Router
- **Frontend (Mobile App):** React Native (via Expo) - Shares 80% code with Web
- **Backend API:** Node.js with NestJS - High-performance API, real-time AI PM chat
- **AI & Vision Microservices:** Python with FastAPI - OCR (Tesseract/PaddleOCR), Computer Vision (YOLOv8), LLM Orchestration (LangChain)
- **Database:** PostgreSQL 15+ with **PostGIS** (for Bhu-Aadhaar/ULPIN land polygons and geo-spatial data) + Redis (caching/AI memory)
- **ORM:** Prisma
- **Infrastructure:** Cloudflare (Edge/DDoS) + AWS/GCP

---

## 3. Monorepo Folder Structure
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
├── docs/                       # All documentation files
└── scripts/                    # Automation and utility scripts
# Create MASTER_PLAN.md
@'
# 🏗️ Ferrum OS - Master Project Context & Build Plan
**Owner:** Sharief S (sharief.s19@gmail.com) | **GitHub:** shariefs19-sthira | **Status:** Phase 1 - Foundation

## 1. The Core Vision
Ferrum OS is an "Operating System for Construction." It unbundles the traditional General Contractor model.
- **Automates:** Design, estimation, procurement, and project management via AI.
- **Orchestrates:** A gig-economy pool of verified professionals who only verify and execute.
- **Delivers:** "Plug and Play" construction.

## 2. Technology Stack (Monorepo Architecture)
- **Frontend (Web):** Next.js 14+ (React) with App Router
- **Frontend (Mobile App):** React Native (via Expo)
- **Backend API:** Node.js with NestJS
- **AI & Vision Microservices:** Python with FastAPI (YOLOv8, LangChain, OCR)
- **Database:** PostgreSQL 15+ with PostGIS + Redis
- **ORM:** Prisma
- **Infrastructure:** Cloudflare + AWS/GCP

## 3. Monorepo Folder Structure
ferrum_os/
├── apps/ (web, mobile, api, ai)
├── packages/ (shared, database, ui)
├── docs/ (All documentation)
└── scripts/ (Automation scripts)

## 4. Key Modules
- **Zero-Friction Input:** Conversational AI, Visual Wizard, Computer Vision, Bhu-Aadhaar Integration
- **Deterministic Core:** IS 800/875/1893/456 codes, Auto-drawings, Professional BOQs
- **AI Project Manager:** Orchestrates professionals, manages procurement
- **Ferrum Guild:** Dynamic marketplace of verified professionals

## 5. Phased Build Plan
- **Phase 1:** Foundation (Current)
- **Phase 2:** Input Matrix (Bhu-Aadhaar, Computer Vision)
- **Phase 3:** Deterministic Core (IS codes, Auto-drawings)
- **Phase 4:** AI PM & MCP
- **Phase 5:** Marketplace & Execution
