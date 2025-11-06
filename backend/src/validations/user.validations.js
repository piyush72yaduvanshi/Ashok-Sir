const Joi = require('joi');

const createFranchiseUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  mobileNo: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  franchiseId: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  mobileNo: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createFranchiseUserSchema,
  updateUserSchema,
};
