const { Expense } = require('../models');

exports.createExpense = async (req, res) => {
  try {
    const { category, amount, description, expenseDate } = req.body;

    const expense = await Expense.create({
      franchiseId: req.user.franchiseId,
      category,
      amount: parseFloat(amount),
      description,
      expenseDate: new Date(expenseDate),
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { franchiseId, category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    // Franchise users can only see their expenses
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    } else if (franchiseId) {
      filter.franchiseId = franchiseId;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) {
        filter.expenseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.expenseDate.$lte = new Date(endDate);
      }
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('franchiseId', 'businessName')
        .populate('createdBy', 'name')
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const expense = await Expense.findOne(filter)
      .populate('franchiseId', 'businessName')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const expense = await Expense.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    ).populate('franchiseId', 'businessName');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const expense = await Expense.findOneAndDelete(filter);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get expense statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = {
          expenseDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case 'week':
        dateFilter = {
          expenseDate: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lte: now,
          },
        };
        break;
      case 'month':
        dateFilter = {
          expenseDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
        break;
      default:
        dateFilter = {
          expenseDate: {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lte: now,
          },
        };
    }

    const filter = { ...dateFilter };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const [
      totalExpenses,
      totalAmount,
      categoryStats,
    ] = await Promise.all([
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalAmount: totalAmount[0]?.total || 0,
        categoryStats: categoryStats.map(stat => ({
          category: stat._id,
          count: stat.count,
          amount: stat.amount,
        })),
        period,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};