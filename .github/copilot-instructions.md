# Route Optimizer - Setup Instructions

## ✅ Project Setup Complete

Your React + Node.js project is ready to use!

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## Project Structure

- **frontend/** - React application (supports .jsx and .js files)
  - `npm start` - Start development server
  - `npm run build` - Create production build
  
- **backend/** - Node.js/Express server
  - `npm start` - Start backend server
  - `server.js` - Main entry point

## Files & Components

### Frontend
- `src/App.jsx` - Main React component
- `src/index.js` - React DOM entry point
- `src/App.css` - Application styling

### Backend
- `server.js` - Express server with API endpoints
- CORS enabled for cross-origin requests
- Health check endpoint: `/api/health`

## What You Can Do Next

1. **Add more React components** in `frontend/src/components/`
2. **Create API routes** in `backend/server.js`
3. **Connect to a database** in the backend
4. **Add authentication** layer
5. **Deploy** to production

## Notes

- Frontend proxies requests to backend (port 5000)
- Both servers run independently on different ports
- React hot reload is enabled for development
- Use .jsx or .js files interchangeably in React

## Support

Refer to the individual README.md files in:
- `frontend/README.md` - React setup details
- `backend/README.md` - Node.js backend details
- `README.md` - Project overview
