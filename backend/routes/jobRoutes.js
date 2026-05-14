const express = require('express');
const { getOptimizedRoute, getRawJobs, completeJob } = require('../controllers/jobController');

const router = express.Router();

router.get('/', getRawJobs);
router.get('/optimized', getOptimizedRoute);
router.patch('/:id/complete', completeJob);

module.exports = router;
