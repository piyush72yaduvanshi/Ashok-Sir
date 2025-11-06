const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { createFranchiseSchema, updateFranchiseSchema } = require('../validations/franchise.validations');

// Super Admin routes
router.post('/', 
  authenticate, 
  authorize('SUPER_ADMIN'), 
  validate(createFranchiseSchema),
  franchiseController.createFranchise
);
router.get('/', authenticate, authorize('SUPER_ADMIN'), franchiseController.getAllFranchises);
router.get('/:id', authenticate, franchiseController.getFranchiseById);
router.put('/:id', 
  authenticate, 
  authorize('SUPER_ADMIN'), 
  validate(updateFranchiseSchema),
  franchiseController.updateFranchise
);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), franchiseController.deleteFranchise);

// Franchise control routes (Super Admin only)
router.patch('/:id/suspend', authenticate, authorize('SUPER_ADMIN'), franchiseController.suspendFranchise);
router.patch('/:id/reactivate', authenticate, authorize('SUPER_ADMIN'), franchiseController.reactivateFranchise);
router.post('/:id/send-otp', authenticate, authorize('SUPER_ADMIN'), franchiseController.sendActivationOTP);

// Franchise user routes
router.get('/my/profile', authenticate, authorize('FRANCHISE_ADMIN'), franchiseController.getMyFranchise);
router.put('/my/profile', 
  authenticate, 
  authorize('FRANCHISE_ADMIN'), 
  franchiseController.updateMyFranchise
);

module.exports = router;
