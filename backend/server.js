const express = require('express');
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`\n================================================`);
  console.log(`  Route Optimizer Backend`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  GET /api/jobs           - raw jobs`);
  console.log(`  GET /api/jobs/optimized - optimized route`);
  console.log(`================================================\n`);
});

module.exports = app;
