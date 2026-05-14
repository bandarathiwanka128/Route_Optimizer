# Backend - Route Optimizer

Node.js/Express backend server for Route Optimizer application.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Server runs on `http://localhost:5000`

### Available Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/routes` - Get routes (currently empty)

## Project Structure

```
backend/
├── server.js       # Main server file
├── package.json    # Dependencies and scripts
└── routes/         # (Add route handlers here)
```

## Adding More Endpoints

Edit `server.js` to add more API endpoints as needed.

Example:

```javascript
app.post('/api/optimize-route', (req, res) => {
  // Your route optimization logic here
  res.json({ optimized: true });
});
```

## Environment Variables

Create a `.env` file if needed:

```
PORT=5000
NODE_ENV=development
```

## Technologies

- Express.js - Web framework
- CORS - Cross-Origin Resource Sharing
- Node.js - JavaScript runtime
