const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { registerSchema, loginSchema, generateOTPSchema, verifyOTPSchema } = require('../validations/auth.validations');
const { createFranchiseUserSchema } = require('../validations/user.validations');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/generate-otp', validate(generateOTPSchema), authController.generateOTP);
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

// Super Admin only - Create franchise user
router.post('/create-franchise-user', 
  authenticate, 
  authorize('SUPER_ADMIN'),
  validate(createFranchiseUserSchema),
  authController.createFranchiseUser
);

module.exports = router;
