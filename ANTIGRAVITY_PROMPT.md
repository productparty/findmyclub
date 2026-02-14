# Antigravity Prompt: Build Out Find My Club

Use the following prompt with Claude (Antigravity / Claude Code) to systematically improve the Find My Club project. Work through phases in order — each phase builds on the previous one.

---

## The Prompt

```
You are helping me build out Find My Club, a golf course discovery and recommendation platform. The project has a React/Vite/MUI frontend deployed on Vercel, a Python/FastAPI backend deployed on Railway, and Supabase (PostgreSQL + PostGIS) for database and auth.

Here is the current state (read PROJECT_ASSESSMENT.md for the full analysis):

**What works today:**
- Club search by ZIP code with 15+ filters (price, difficulty, holes, membership, amenities)
- Personalized recommendations using a scoring engine (distance, price, difficulty, amenities, services)
- Supabase authentication (login, signup, password reset, email verification)
- Interactive Leaflet maps with numbered markers
- Favorites system
- User profile management
- Deployed: Vercel (frontend) + Railway (backend) + Supabase (DB)

**What needs work (in priority order):**

### Phase 1: Security & Stability (do this first)
1. Remove or environment-gate all debug endpoints (`/api/debug/*`, `/api/cors-debug`, `/api/verify-auth-setup`, `/api/test-*`)
2. Add input validation for ZIP codes (5-digit US format) on both frontend and backend
3. Add rate limiting to auth and search endpoints (use slowapi or similar)
4. Stop logging environment variables at startup in `server/app.py`
5. Fix the empty `Authorization: ''` header being sent on unauthenticated requests in `golf-club-ui/src/api/client.ts`
6. Remove `__pycache__` from git tracking

### Phase 2: Code Cleanup & Bug Fixes
7. Remove dead legacy files: `server/server.js`, `server/app.js`, `server/index.js`, `server/sendgrid.js`, `server/svgTransform.js`
8. Consolidate root `package.json` to only contain workspace orchestration scripts — remove duplicated dependencies
9. Fix duplicate `useEffect` for map center calculation in `golf-club-ui/src/pages/FindClub/FindClubUpdated.tsx` (lines ~203-208 and ~267-273)
10. Fix `getCurrentPageCourses` being called as a function in `RecommendClubUpdated.tsx` when it's a `useMemo` value (not a function)
11. Replace deprecated `.dict()` with `.model_dump()` in `server/app.py` (Pydantic v2)
12. Remove duplicate type files — consolidate `types/Club.ts` and `types/golf-club.ts`
13. Connect the custom theme colors from `theme.ts` to the MUI `ThemeProvider` in `App.tsx`

### Phase 3: Testing Foundation
14. Set up pytest for backend with fixtures for DB mocking — write tests for:
    - Recommendation engine scoring (unit tests)
    - API endpoint responses (with mocked DB)
    - Input validation
15. Set up Vitest for frontend — write tests for:
    - `useClubSearch` hook
    - `ClubCard` component rendering
    - Auth context behavior
16. Add a GitHub Actions CI workflow that runs lint + tests on PR

### Phase 4: Database & Backend Improvements
17. Set up Alembic for database migrations
18. Add connection pooling (replace per-request `psycopg2.connect()` with a pool)
19. Fix the inconsistent query in `recommend_courses` endpoint — it references `c.location` and a `zip_codes` table that don't match the `golfclub` table schema used elsewhere
20. Make the profile update endpoint (`PUT /api/profiles/current`) save ALL profile fields including amenity preferences (currently only saves 8 of 20+ fields)

### Phase 5: Feature Enhancement
21. Improve the recommendation engine:
    - Weight amenities/services based on user preferences (not just club availability)
    - Add partial scoring for price/difficulty (adjacent tiers get partial credit)
    - Add a "why this recommendation" explanation per club
22. Add the club submission API endpoint (the frontend page exists at `/submit-club` but there's no backend)
23. Wire up the weather integration (hooks exist in `useWeather.ts` but aren't connected to club detail pages)
24. Add user reviews/ratings for clubs

### Phase 6: Production Readiness
25. Add proper error monitoring (Sentry or similar)
26. Set up CI/CD pipeline for automated deployment
27. Add SEO meta tags and Open Graph support
28. Performance audit — lazy load pages, optimize bundle size, add image optimization
29. Accessibility audit and fixes
30. Add API documentation (FastAPI auto-generates OpenAPI — clean it up and host at `/docs`)

**Important context:**
- Frontend is in `golf-club-ui/` — React 18, Vite 7, MUI 7, React Query, React Router 6, Leaflet
- Backend is in `server/` — Python 3.10, FastAPI, psycopg2, Supabase client
- Database has PostGIS enabled for geospatial queries
- Auth uses Supabase JWT tokens validated server-side
- Deployment: Vercel (frontend), Railway via Docker (backend), Supabase (managed DB)
- The `.env.example` files in both `server/` and `golf-club-ui/` document all required environment variables

Start with Phase 1. For each change, explain what you're doing and why. After each phase, summarize what was done and what's next. Don't skip ahead — each phase builds on the last.
```

---

## How to Use This Prompt

1. **Start a new Claude Code session** in the `/findmyclub` project directory
2. **Paste the prompt above** to kick off Phase 1
3. **After Phase 1 is complete**, say: "Phase 1 looks good, proceed to Phase 2"
4. **Continue phase by phase** — review each before moving on
5. **If you want to skip to a specific phase**, say: "Skip to Phase 5, the earlier phases are done"

## Tips for Best Results
- **One phase at a time** keeps changes reviewable and revertible
- **Commit after each phase** so you can roll back if needed
- **Test after each phase** before moving to the next
- **Customize the phases** — remove items you don't need, add features you want
- **Add context** as you go — if Claude asks about your Supabase schema, share it
