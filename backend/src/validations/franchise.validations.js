const Joi = require('joi');

const createFranchiseSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required(),
  ownerName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  address: Joi.string().min(10).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required(),
  panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
});

const updateFranchiseSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).optional(),
  ownerName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  address: Joi.string().min(10).max(200).optional(),
  city: Joi.string().min(2).max(50).optional(),
  state: Joi.string().min(2).max(50).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createFranchiseSchema,
  updateFranchiseSchema,
};