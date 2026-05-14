# Frontend - Route Optimizer

React frontend application for Route Optimizer.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The app opens on `http://localhost:3000` with hot reload enabled.

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── index.js         # Entry point
│   ├── index.css        # Global styles
│   └── components/      # (Add components here)
└── package.json
```

## File Support

- **.jsx** - React JSX components (recommended)
- **.js** - JavaScript files and React components

Both file types are fully supported.

## Key Files

- `src/App.jsx` - Main React component
- `src/index.js` - Application entry point
- `public/index.html` - HTML template

## Technologies

- React 18
- React DOM
- React Scripts (Create React App)

## Proxy Configuration

The frontend proxies API requests to `http://localhost:5000` (backend server).
