# Find My Club - Project Assessment

## Executive Summary

**Find My Club** is a golf course discovery and recommendation platform with a working React frontend (Vite + MUI) deployed on Vercel, a Python/FastAPI backend deployed on Railway, and a Supabase PostgreSQL database with PostGIS for geospatial queries. The project has a solid foundation with real functionality — club search by ZIP code, personalized recommendations, user profiles, favorites, and interactive maps. However, it needs significant work on testing, code quality, security hardening, and feature completeness before it's production-ready.

**Maturity Level: Early MVP (~40% complete)**

---

## Architecture Overview

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React Frontend    │────▶│   FastAPI Backend     │────▶│   Supabase      │
│   (Vite + MUI)      │     │   (Python 3.10)       │     │   (PostgreSQL   │
│   Vercel            │     │   Railway/Docker      │     │    + PostGIS)   │
│                     │     │                        │     │                 │
│   - React 18        │     │   - FastAPI 0.109      │     │   - Auth        │
│   - MUI 7           │     │   - psycopg2           │     │   - Realtime    │
│   - React Query     │     │   - Supabase client    │     │   - Storage     │
│   - React Router 6  │     │   - Azure Maps API     │     │                 │
│   - Leaflet maps    │     │   - Recommendation     │     │                 │
│   - Zod validation  │     │     engine             │     │                 │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
```

---

## What's Working

### Frontend (golf-club-ui/)
- **10+ pages**: Landing, Dashboard, Find Club, Recommend Club, Favorites, Profile, Club Detail, Login, Create Account, Password Reset, etc.
- **Auth flow**: Supabase-based sign-in/sign-up/sign-out with protected routes
- **Club search**: ZIP code + radius + filters (price, difficulty, holes, membership, 11 amenity toggles)
- **Recommendations**: Profile-based club scoring with visual highlights for high matches
- **Interactive maps**: Leaflet maps with numbered markers and click-to-navigate
- **Favorites**: Add/remove clubs to favorites, persistent via Supabase
- **Pagination, sorting, URL state persistence, localStorage caching**
- **Error boundaries, loading skeletons, responsive design**
- **Vercel Analytics integration**

### Backend (server/)
- **7 API endpoints** under `/api/`: health, find_clubs, get_recommendations, profiles (GET/PUT), club detail, search
- **PostGIS spatial queries**: ST_DWithin, ST_Distance for radius-based search
- **Recommendation engine**: Scoring based on distance (25%), price match (25%), difficulty (20%), amenities (15%), services (15%)
- **Supabase auth token validation** on protected endpoints
- **CORS, request logging, global exception handler**
- **Docker deployment** via Railway

### Infrastructure
- Vercel (frontend) + Railway (backend) + Supabase (DB/auth)
- Docker + health checks configured
- .env.example files for both frontend and backend
- Dependabot configured (currently disabled)

---

## Critical Issues

### 1. Security
- **Debug endpoints exposed in production**: `/api/debug/token`, `/api/debug/profile`, `/api/debug/routes`, `/api/cors-debug`, `/api/verify-auth-setup` — these leak auth tokens, route info, and environment variables
- **Environment variables logged at startup**: `app.py:866` iterates and logs ALL non-secret env vars, and secret filtering is naive (misses `TOKEN`, `URL` with embedded creds, etc.)
- **No rate limiting** on any endpoint (auth, search, recommendations)
- **No input validation** on ZIP codes (no regex, no length check — raw string passed to external API)
- **Authorization header sent even when empty**: `client.ts:37` sends `Authorization: ''` on unauthenticated requests

### 2. Code Quality
- **Duplicate package.json**: Root `package.json` duplicates many dependencies from `golf-club-ui/package.json` with version mismatches (MUI 5 vs 7, vite 6 vs 7, etc.)
- **Dead code**: `server.js`, `app.js`, `index.js`, `sendgrid.js`, `svgTransform.js` in server/ appear to be legacy Node.js files from a previous iteration
- **Duplicate `useEffect`** in `FindClubUpdated.tsx:203-208` and `:267-273` — identical map center calculation runs twice
- **`getCurrentPageCourses` called as function vs property inconsistently** in `RecommendClubUpdated.tsx` — `useMemo` returns a value, not a function, but it's called as `getCurrentPageCourses()` on lines 82-83
- **`.model.dict()` deprecated** in Pydantic v2 — should use `.model_dump()`
- **`__pycache__` files committed** to git
- **Two duplicate type files**: `types/Club.ts` and `types/golf-club.ts`

### 3. Testing
- **No real test suite**: The `test_endpoints.py` is an integration test script that requires a running server + real credentials — not a proper unit/integration test
- **No frontend tests**: `App.test.js` exists but is a CRA leftover; Jest config exists but no actual test files
- **Zero test coverage** for recommendation engine, API endpoints, React components, hooks

### 4. Database
- **No migrations**: No Alembic, no migration files — schema changes are manual
- **Raw SQL everywhere**: No ORM usage despite SQLAlchemy being in requirements
- **Two different query patterns**: `find_clubs` uses `gc.geom::geography` while `recommend_courses` uses `c.location::geography` and references a `zip_codes` table — likely one of these is broken
- **No connection pooling**: Creates new psycopg2 connections per request

### 5. Frontend Architecture
- **No centralized error handling** for API calls (each page handles errors differently)
- **localStorage used for state persistence** instead of URL params or React Query cache
- **Theme created with `createTheme()` empty** in App.tsx but a separate `theme.ts` exists with colors — not connected
- **Mixed import styles**: Some pages use the API client, others use hooks, some call fetch directly
- **No loading state management** for initial data fetches

---

## Improvement Areas (Prioritized)

### P0 - Must Fix Before Any Public Use
1. Remove or gate all debug endpoints behind an environment check
2. Add ZIP code input validation (regex, length limits)
3. Add rate limiting (at minimum on auth endpoints)
4. Stop logging environment variables at startup
5. Fix the empty Authorization header on unauthenticated requests
6. Remove `__pycache__` from git and add to `.gitignore`

### P1 - Foundation for Building Out
7. Clean up dead code (legacy Node.js files in server/)
8. Consolidate the duplicate `package.json` — the root should only orchestrate, not duplicate deps
9. Add a proper testing framework (pytest for backend, Vitest for frontend)
10. Set up database migrations (Alembic)
11. Add connection pooling (psycopg2.pool or switch to asyncpg)
12. Fix the duplicate useEffect and getCurrentPageCourses bug

### P2 - Feature Completeness
13. User reviews and ratings for clubs
14. Club submission flow (the page exists but submit endpoint is missing)
15. Email notifications (SendGrid is in deps but not wired up)
16. Social features (share a club, invite friends)
17. Profile completeness (amenity preferences aren't saved to profile update endpoint)
18. Weather integration (hooks exist but aren't connected)

### P3 - Polish
19. Proper theming (connect theme.ts colors to MUI ThemeProvider)
20. SEO (meta tags, Open Graph, sitemap)
21. Performance (lazy loading pages, image optimization)
22. Accessibility audit
23. CI/CD pipeline (GitHub Actions for lint, test, build, deploy)
24. Monitoring and alerting

---

## Tech Debt Summary

| Category | Items | Severity |
|----------|-------|----------|
| Security | 5 debug endpoints exposed, no rate limiting, env var logging | High |
| Dead Code | 5+ unused server files, duplicate types | Medium |
| Testing | 0% coverage, no test framework configured | High |
| Database | No migrations, no pooling, inconsistent schemas | High |
| Dependencies | Duplicate package.json, version mismatches | Medium |
| Code Bugs | Duplicate useEffect, useMemo called as function | Medium |

---

## Recommendation Engine Analysis

The current scoring algorithm (`recommendation_engine.py`) is simple but functional:
- **Distance** (25%): Inverse linear decay over 100mi max
- **Price match** (25%): Binary — exact match or zero
- **Difficulty match** (20%): Binary — exact match or zero
- **Amenities** (15%): Proportion of 6 amenities present (not user-preference weighted)
- **Services** (15%): Proportion of 5 services present (not user-preference weighted)

**Key gaps**: Amenities/services scoring doesn't consider what the USER wants, just what the club has. A golfer who wants a driving range should score clubs with driving ranges higher — but currently all amenities are weighted equally regardless of user preferences.
