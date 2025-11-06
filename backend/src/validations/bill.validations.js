const Joi = require('joi');

const createBillSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'UPI').required(),
  paidAmount: Joi.number().min(0).optional(),
  customerDetails: Joi.object({
    name: Joi.string().max(100).optional(),
    phone: Joi.string().max(15).optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().max(200).optional(),
  }).optional(),
});

module.exports = {
  createBillSchema,
};
