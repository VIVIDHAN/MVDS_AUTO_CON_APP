const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 10 Free AI Keys cluster status
router.get('/cluster', aiController.getClusterStatus);

// Rotate active key
router.post('/rotate-key', aiController.rotateKey);

// Vehicle valuation & price code computation
router.post('/valuation', aiController.computeValuation);

// Strategic AI Deal Advisor
router.post('/advisor', aiController.askAdvisor);

module.exports = router;
