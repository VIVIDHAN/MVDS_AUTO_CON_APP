const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAll);
router.post('/', serviceController.create);
router.put('/:id/status', serviceController.updateStatus);
router.delete('/:id', serviceController.delete);

module.exports = router;
