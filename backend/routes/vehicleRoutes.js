const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getAll);
router.get('/:id', vehicleController.getById);
router.post('/', vehicleController.create);
router.put('/:id', vehicleController.update);
router.post('/:id/sell', vehicleController.markSold);
router.delete('/:id', vehicleController.delete);

module.exports = router;
