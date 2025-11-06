const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobileNo: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  role: Joi.string().valid('SUPER_ADMIN', 'FRANCHISE_ADMIN').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const generateOTPSchema = Joi.object({
  mobileNo: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
});

const verifyOTPSchema = Joi.object({
  mobileNo: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp: Joi.string().length(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  generateOTPSchema,
  verifyOTPSchema,
};