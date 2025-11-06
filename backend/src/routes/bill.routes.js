const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { createBillSchema } = require('../validations/bill.validations');

// Bill CRUD operations
router.post('/', authenticate, validate(createBillSchema), billController.createBill);
router.get('/', authenticate, billController.getAllBills);
router.get('/stats', authenticate, billController.getBillStats);
router.get('/:id', authenticate, billController.getBillById);

// Bill generation and printing
router.get('/:id/pdf', authenticate, billController.generateBillPDF);
router.get('/:id/print', authenticate, billController.printBill);

module.exports = router;
