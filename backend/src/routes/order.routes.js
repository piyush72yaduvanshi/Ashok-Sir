const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { createOrderSchema, updateOrderSchema, updateOrderStatusSchema } = require('../validations/order.validations');

// Order CRUD operations
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, orderController.getAllOrders);
router.get('/stats', authenticate, orderController.getOrderStats);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id', authenticate, validate(updateOrderSchema), orderController.updateOrder);
router.delete('/:id', authenticate, orderController.deleteOrder);

// Order status management
router.patch('/:id/status', authenticate, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
