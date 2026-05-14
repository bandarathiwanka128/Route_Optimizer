# Route Optimizer — Sunquick Lanka Field Dispatch

> **Route Optimization Test Assignment**  
> Submitted by: **Thiwanka Bandara Herath**

A full-stack field technician dispatch system that fetches pending job locations, groups duplicate-location jobs into single stops, calculates the most efficient visit order using a nearest-neighbour algorithm, and displays the live route on Google Maps with real road distances and travel times.

---

## Live Demo

| Service | URL |
|---|---|
| **Frontend (Live App)** | https://route-optimizer-a557.vercel.app |
| **Backend API** | https://route-optimizer-mocha.vercel.app/api |

---

## Features

| | Feature |
|---|---|
| ✅ | Calculates distances between locations (Haversine formula) |
| ✅ | Identifies the nearest next location (nearest-neighbour TSP) |
| ✅ | Avoids duplicate location visits — jobs at the same store merged into one stop |
| ✅ | Returns the optimized route order via REST API |
| ⭐ | Google Maps Directions API for real road routing |
| ⭐ | Estimated travel time per leg (e.g. "1 hour 18 mins") |
| ⭐ | Interactive route map with markers and road polyline |
| ⭐ | Full REST API (Express.js MVC) |
| ⭐ | Unit tests (Jest — 22 tests across 2 suites) |

---

## Project Structure

```
Route_Optimizer/
├── backend/
│   ├── controllers/
│   │   └── jobController.js      # Route handlers: fetch, optimize, complete
│   ├── models/
│   │   └── jobModel.js           # normalizeJob() — validates & maps raw API fields
│   ├── routes/
│   │   └── jobRoutes.js          # Express route definitions
│   ├── utils/
│   │   └── apiUtils.js           # haversine(), groupIntoStops(), optimizeStops()
│   ├── tests/
│   │   ├── apiUtils.test.js      # 13 unit tests for optimization logic
│   │   └── jobModel.test.js      # 9 unit tests for data normalization
│   ├── server.js                 # Express entry point — PORT 5050
│   ├── vercel.json               # Vercel serverless deployment config
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── MapView.jsx        # Google Map + DirectionsRenderer + RouteSummaryPanel
    │   │   ├── JobList.jsx        # Left panel stop cards with per-job completion
    │   │   └── ErrorBoundary.jsx
    │   ├── services/
    │   │   └── apiService.js      # Axios HTTP client
    │   ├── App.jsx                # Root component, global state
    │   ├── App.css                # All styles
    │   └── index.js
    ├── .env.example               # Required environment variables
    ├── vercel.json                # SPA routing config for Vercel
    └── package.json
```

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18.2 |
| Frontend | @react-google-maps/api | 2.20.8 |
| Frontend | Axios | 1.16 |
| Backend | Node.js + Express | 4.18 |
| Backend | Axios | 1.16 |
| Testing | Jest | 29 |
| Hosting | Vercel | — |
| Maps | Google Maps Platform | — |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**
- **Google Maps API Key** with these APIs enabled:
  - Maps JavaScript API
  - Directions API

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/bandarathiwanka128/Route_Optimizer.git
cd Route_Optimizer
```

---

### 2. Backend Setup

```bash
cd backend
npm install
node server.js
```

The backend starts at **http://localhost:5050**

```
================================================
  Route Optimizer Backend
  http://localhost:5050
  GET /api/jobs           - raw jobs
  GET /api/jobs/optimized - optimized route
================================================
```

> **Note:** The external Beeceptor API has a free-tier rate limit. If it returns HTTP 429, the backend automatically uses built-in demo data (4 jobs, 3 locations). All features remain fully functional. A **"Demo data"** badge appears in the app header.

---

### 3. Frontend Setup

```bash
# Open a new terminal tab
cd frontend
npm install
```

Create the environment file:

```bash
# Windows PowerShell
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `frontend/.env` and set your values:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_API_URL=http://localhost:5050/api
```

Start the frontend:

```bash
npm start
```

The app starts at **http://localhost:3101**

> The `proxy` field in `package.json` forwards API calls to the backend during development, so you do not need to set `REACT_APP_API_URL` for local development if both servers are on the default ports.

---

### 4. Run Unit Tests

```bash
cd backend
npm test
```

Expected output — all 22 tests passing:

```
PASS  tests/apiUtils.test.js
  haversine
    ✓ returns 0 for identical coordinates
    ✓ calculates approximate distance between two known points
    ✓ is symmetric (A→B equals B→A)
  groupIntoStops
    ✓ merges duplicate store names into one stop
    ✓ merged stop contains all jobs for that store
    ✓ assigns unique stopIds
    ✓ is case-insensitive when grouping store names
    ✓ single-job stores become one-job stops
  optimizeStops
    ✓ returns the same number of stops
    ✓ visits nearest stop first (nearest-neighbour heuristic)
    ✓ attaches distanceFromPrev to each stop
    ✓ returns empty array for empty input
    ✓ does not mutate the original stops array

PASS  tests/jobModel.test.js
  normalizeJob
    ✓ returns a normalized job object for valid input
    ✓ parses string coordinates to numbers
    ✓ returns null when geo_lat is missing
    ✓ returns null when geo_lng is missing
    ✓ returns null when coordinates are non-numeric strings
    ✓ falls back to ticket_id when id is absent
    ✓ uses "Unknown" when store_name is absent
    ✓ uses "N/A" when job_type is absent
    ✓ falls back to type field when job_type is absent
    ✓ defaults territory to empty string when absent

Test Suites: 2 passed, 2 total
Tests:       22 passed, 22 total
```

---

## API Documentation

### Base URLs

```
Local:       http://localhost:5050/api
Production:  https://route-optimizer-mocha.vercel.app/api
```

---

### `GET /api/jobs/optimized`

Returns all pending jobs grouped into stops and sorted in nearest-neighbour optimized order starting from Horana.

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `origin` | object | Starting point — Horana Head Office `{ lat, lng, name }` |
| `route` | array | Ordered stops, each containing a `jobs[]` array |
| `totalJobs` | number | Total individual job count |
| `totalStops` | number | Unique location count (after grouping) |
| `totalDistanceKm` | number | Sum of straight-line distances (km) |
| `source` | string | `"live"` or `"fallback"` |

**Sample response:**

```json
{
  "origin": { "lat": 6.7148, "lng": 80.0627, "name": "Head Office - Horana" },
  "route": [
    {
      "stopId": "stop-1",
      "store_name": "SURANGA CATERS- NEGAMBO",
      "territory": "Negombo",
      "geo_lat": 7.2067,
      "geo_lng": 79.8496,
      "distanceFromPrev": 73.85,
      "jobs": [
        { "id": 1, "job_type": "Hardware", "status": "Pending", "territory": "Negombo" }
      ]
    },
    {
      "stopId": "stop-3",
      "store_name": "DOLPHINE HOTEL",
      "territory": "Negombo",
      "geo_lat": 7.2798,
      "geo_lng": 79.8561,
      "distanceFromPrev": 8.23,
      "jobs": [
        { "id": 3, "job_type": "Dispensing",   "status": "Pending", "territory": "Negombo" },
        { "id": 4, "job_type": "Registration", "status": "Pending", "territory": "Negombo" }
      ]
    }
  ],
  "totalJobs": 4,
  "totalStops": 3,
  "totalDistanceKm": 86.51,
  "source": "fallback"
}
```

---

### `GET /api/jobs`

Returns raw normalized jobs (flat list, not grouped, not optimized). Useful for debugging.

---

### `PATCH /api/jobs/:id/complete`

Marks a job as completed. Attempts to update the external Beeceptor API; falls back gracefully if read-only.

**Path parameter:** `id` — the job ID to mark complete

**Sample response:**

```json
{
  "id": "1",
  "status": "Completed",
  "apiUpdated": false,
  "message": "Managed locally (external API is read-only)"
}
```

---

### `GET /api/health`

Health check endpoint.

```json
{ "status": "OK", "timestamp": "2026-05-14T08:30:00.000Z" }
```

---

## How the Optimization Works

```
Origin: Horana (6.7148, 80.0627)

Step 1 — Group jobs by location:
  Raw jobs: 4 (including 2 at DOLPHINE HOTEL)
  After groupIntoStops(): 3 unique stops
  → DOLPHINE HOTEL visited ONCE with both jobs

Step 2 — Nearest-neighbour TSP from Horana:
  Iteration 1: Closest to Horana → SURANGA CATERS (73.85 km)
  Iteration 2: Closest to SURANGA → GOLDI SANDS (3.47 km)
  Iteration 3: Only remaining → DOLPHINE HOTEL (8.23 km)

Step 3 — Google Directions API:
  Road route calculated for the ordered stops
  Returns actual driving distances and travel times per leg
```

**Optimized route (demo data):**

| Order | Location | Jobs | Road Distance | Travel Time |
|---|---|---|---|---|
| START | Head Office — Horana | — | — | — |
| 1 | SURANGA CATERS- NEGAMBO | 1 (Hardware) | 73.8 km | 1 hr 18 min |
| 2 | GOLDI SANDS | 1 (Power) | 3.5 km | 11 min |
| 3 | DOLPHINE HOTEL ★ | 2 (Dispensing + Registration) | 7.5 km | 17 min |

> ★ Two raw jobs merged into one stop — visited once.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Google Maps API key (Maps JS API + Directions API) |
| `REACT_APP_API_URL` | Backend base URL — e.g. `http://localhost:5050/api` |

### Backend

No `.env` required for local development. In Vercel production, `PORT` is set automatically.

---

## Deployment (Vercel)

The project deploys as two separate Vercel projects from the same repository.

### Backend

1. Vercel → **Add New Project** → `Route_Optimizer`
2. Root Directory: `backend`
3. Framework: **Other** (auto-detected as Express)
4. No environment variables needed
5. Deploy → note the URL (e.g. `https://route-optimizer-mocha.vercel.app`)

### Frontend

1. Vercel → **Add New Project** → `Route_Optimizer`
2. Root Directory: `frontend`
3. Framework: **Create React App** (auto-detected)
4. Add environment variables:
   - `REACT_APP_GOOGLE_MAPS_API_KEY` = your key
   - `REACT_APP_API_URL` = `https://your-backend.vercel.app/api`
5. Deploy

---

## External API

```
GET https://service-connect.free.beeceptor.com/tickets
```

The backend normalizes raw fields from this API using `normalizeJob()` and falls back to built-in demo data if the API is unavailable (rate limit, timeout, or empty response).

---

## Repository

**GitHub:** https://github.com/bandarathiwanka128/Route_Optimizer.git  
**Author:** Thiwanka Bandara Herath  
**Assignment:** Route Optimization Test Assignment — Sunquick Lanka Pvt Ltd
