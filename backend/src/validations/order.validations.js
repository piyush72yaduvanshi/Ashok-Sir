const Joi = require('joi');

const orderItemSchema = Joi.object({
  foodId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  specialInstructions: Joi.string().max(200).optional().allow(null, ''),
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  orderType: Joi.string().valid('DINE_IN', 'TAKEAWAY').optional(),
  discount: Joi.number().min(0).optional(),
  customerName: Joi.string().max(100).optional().allow(null, ''),
  tableNumber: Joi.string().max(20).optional().allow(null, ''),
  notes: Joi.string().max(500).optional().allow(null, ''),
});

const updateOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).optional(),
  orderType: Joi.string().valid('DINE_IN', 'TAKEAWAY').optional(),
  discount: Joi.number().min(0).optional(),
  customerName: Joi.string().max(100).optional().allow(null, ''),
  tableNumber: Joi.string().max(20).optional().allow(null, ''),
  notes: Joi.string().max(500).optional().allow(null, ''),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELLED').required(),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
};
