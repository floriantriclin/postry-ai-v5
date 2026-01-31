# Postry AI - Documentation Index

**Type:** Monolith
**Primary Language:** TypeScript
**Architecture:** Fullstack Serverless with API Routes
**Last Updated:** 2026-01-27

## Project Overview

Postry AI is a fullstack web application that helps users discover their unique writing style through an interactive quiz and generates personalized LinkedIn posts using AI. Built with Next.js 16, deployed on Vercel, using Supabase for data persistence and Google Gemini 2.5 Flash for AI-powered content generation.

## Quick Reference

- **Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS 4
- **Entry Point:** `app/page.tsx` (Landing page)
- **Architecture Pattern:** Fullstack Monolith with API Routes
- **Database:** Supabase (PostgreSQL with RLS)
- **Deployment:** Vercel (Serverless Functions + Edge Network)

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - Executive summary and high-level architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure
- [Architecture](./architecture-main.md) - Detailed technical architecture
- [Component Inventory](./component-inventory-main.md) - Catalog of major components and UI elements
- [Development Guide](./development-guide-main.md) - Local setup and development workflow
- [API Contracts](./api-contracts-main.md) - API endpoints and schemas
- [Data Models](./data-models-main.md) - Database schema and models
- [State Management Patterns](./state-management-patterns-main.md) - State management architecture
- [Technology Stack](./technology-stack.md) - Complete technology inventory
- [Deployment Guide](./deployment-guide-main.md) - Deployment process and infrastructure

### Project Structure

- [Project Structure](./project-structure.md) - Project classification and structure
- [Project Parts Metadata](./project-parts-metadata.json) - Machine-readable structure

## Existing Documentation

### Product & Planning

- [Project Brief](./brief.md) - Product vision and strategy (v6.0)
- [PRD](./_bmad-output/planning-artifacts/PRD.md) - Product Requirements Document (v3.1, sharded)
- [Architecture](./_bmad-output/planning-artifacts/Architecture.md) - Architecture documentation (v2.0, sharded)
- [Epics](./_bmad-output/implementation-artifacts/epic-1-acquisition.md) - 4 Epic documents
- [Stories](./_bmad-output/implementation-artifacts/story-1-1-tech-init.md) - 34 User story documents

### Technical Specifications

- [ICE Protocol](./specs/ice_protocol.md) - ICE protocol specification
- [ICE Data Classification](./specs/ice_data_classification.md) - Data classification specification

### Quality Assurance

- [E2E Test Guide](./qa/e2e-test-guide.md) - Complete E2E testing guide
- [E2E Migration Analysis](./qa/e2e-migration-analysis.md) - E2E test migration analysis
- [Testing Standards](./_bmad-output/planning-artifacts/architecture/testing-standards.md) - Testing standards and best practices
- [QA Assessments](./qa/assessments/) - 50+ test design, risk, and NFR assessment files
- [Quality Gates](./qa/gates/) - Quality gates documentation

### Project Management

- [PM Decisions](./pm/) - Project management decisions and reports

### Technical Recommendations

- [Recommendations](./recommendations/) - 13 technical recommendation and fix documents

### UX Design

- [UX Design](./ux/theme-selector-redefined.md) - UX design documentation

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm
- Supabase account
- Google Gemini API key (optional - falls back to mocks)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd postry-ai

# Install dependencies
npm install

# Configure environment variables
# Create .env file with required variables (see development guide)

# Start development server
npm run dev
```

### Run Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests (requires dev server running)
npm run test:e2e
```

## For AI-Assisted Development

This documentation was generated specifically to enable AI agents to understand and extend this codebase.

### When Planning New Features:

**UI-only features:**
→ Reference: `architecture-main.md`, `component-inventory-main.md`

**API/Backend features:**
→ Reference: `architecture-main.md`, `api-contracts-main.md`, `data-models-main.md`

**Full-stack features:**
→ Reference: All architecture docs

**Deployment changes:**
→ Reference: `deployment-guide-main.md`

### Key Files for AI Agents

- **Architecture:** `architecture-main.md` - Complete technical architecture
- **API Reference:** `api-contracts-main.md` - All API endpoints
- **Data Models:** `data-models-main.md` - Database schema
- **Components:** `component-inventory-main.md` - Component catalog
- **State Management:** `state-management-patterns-main.md` - State patterns
- **Source Tree:** `source-tree-analysis.md` - Directory structure

### BMAD Planning Artifacts

For product planning and requirements:
- **PRD:** `_bmad-output/planning-artifacts/PRD.md` (sharded, see `prd/` folder)
- **Architecture:** `_bmad-output/planning-artifacts/Architecture.md` (sharded, see `architecture/` folder)
- **Epics & Stories:** `_bmad-output/implementation-artifacts/`

---

_Documentation generated by BMAD Method `document-project` workflow_
