const Joi = require('joi');

const createExpenseSchema = Joi.object({
  category: Joi.string().min(2).max(50).required(),
  amount: Joi.number().min(0).required(),
  description: Joi.string().min(5).max(500).required(),
  expenseDate: Joi.date().required(),
  receiptUrl: Joi.string().uri().optional().allow(null, ''),
});

const updateExpenseSchema = Joi.object({
  category: Joi.string().min(2).max(50).optional(),
  amount: Joi.number().min(0).optional(),
  description: Joi.string().min(5).max(500).optional(),
  expenseDate: Joi.date().optional(),
  receiptUrl: Joi.string().uri().optional().allow(null, ''),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};
