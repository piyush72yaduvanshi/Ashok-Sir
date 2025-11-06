const Joi = require('joi');

const createFoodSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(5).max(500).required(),
  category: Joi.string().valid('STARTERS', 'MAIN_COURSE', 'BEVERAGES', 'DESSERTS', 'SNACKS', 'CHAAT').required(),
  price: Joi.number().min(0).required(),
  isUniversal: Joi.boolean().optional(),
  image: Joi.string().uri().optional().allow(null, ''),
  preparationTime: Joi.number().min(1).optional(),
  isAvailable: Joi.boolean().optional(),
});

const updateFoodSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(5).max(500).optional(),
  category: Joi.string().valid('STARTERS', 'MAIN_COURSE', 'BEVERAGES', 'DESSERTS', 'SNACKS', 'CHAAT').optional(),
  price: Joi.number().min(0).optional(),
  isUniversal: Joi.boolean().optional(),
  image: Joi.string().uri().optional().allow(null, ''),
  preparationTime: Joi.number().min(1).optional(),
  isAvailable: Joi.boolean().optional(),
});

module.exports = {
  createFoodSchema,
  updateFoodSchema,
};
