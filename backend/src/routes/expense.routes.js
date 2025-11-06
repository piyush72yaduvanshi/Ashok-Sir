const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation.utils');
const { createExpenseSchema, updateExpenseSchema } = require('../validations/expense.validations');

// Expense CRUD operations
router.post('/', authenticate, validate(createExpenseSchema), expenseController.createExpense);
router.get('/', authenticate, expenseController.getAllExpenses);
router.get('/stats', authenticate, expenseController.getExpenseStats);
router.get('/:id', authenticate, expenseController.getExpenseById);
router.put('/:id', authenticate, validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', authenticate, expenseController.deleteExpense);

module.exports = router;
