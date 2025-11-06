const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { createFoodSchema, updateFoodSchema } = require('../validations/food.validations');

// All authenticated users can view foods
router.get('/', authenticate, foodController.getAllFoods);
router.get('/categories', authenticate, foodController.getFoodCategories);

// Create, update, delete foods
router.post('/', authenticate, validate(createFoodSchema), foodController.createFood);
router.put('/:id', authenticate, validate(updateFoodSchema), foodController.updateFood);
router.delete('/:id', authenticate, foodController.deleteFood);

// Super Admin only - Global availability toggle for universal foods
router.patch('/:id/global-availability', 
  authenticate, 
  authorize('SUPER_ADMIN'), 
  foodController.toggleGlobalAvailability
);

module.exports = router;
