# Route Optimization App

A full-stack route optimization solution that determines an efficient travel route for field jobs, starting from **Sunquick Lanka Pvt Ltd** in Biyagama.

## Project Structure

```text
route-optimization-app/
|-- backend/
|   |-- controllers/
|   |   `-- jobController.js
|   |-- models/
|   |   `-- jobModel.js
|   |-- routes/
|   |   `-- jobRoutes.js
|   |-- utils/
|   |   `-- apiUtils.js
|   |-- server.js
|   `-- package.json
|-- frontend/
|   |-- public/
|   |   `-- index.html
|   |-- src/
|   |   |-- components/
|   |   |   |-- JobList.jsx
|   |   |   `-- MapView.jsx
|   |   |-- services/
|   |   |   `-- apiService.js
|   |   |-- App.jsx
|   |   |-- App.css
|   |   `-- index.js
|   |-- .env.example
|   `-- package.json
|-- .gitignore
`-- README.md
```

## How It Works

1. Backend fetches pending jobs from `https://service-connect.free.beeceptor.com/tickets`.
2. If the external API is rate-limited or unavailable, backend uses fallback demo jobs.
3. Backend applies the nearest-neighbour route heuristic from Sunquick Lanka's coordinates.
4. Frontend displays the ordered stop list and plots the route on OpenStreetMap tiles.

## Setup

### Backend

```bash
cd backend
npm install
node server.js
```

Server runs on `http://localhost:5050`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

App usually runs on `http://localhost:3000`. If Windows has reserved that port, run with another port:

```powershell
$env:PORT="3101"
npm start
```

The map uses OpenStreetMap tiles and does not require a Google Maps API key.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | Raw job list |
| GET | `/api/jobs/optimized` | Optimized route |

## License

ISC
