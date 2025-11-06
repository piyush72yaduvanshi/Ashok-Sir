const { Franchise, User, Order, Bill, Expense, Food } = require('../models');
const { sendOTPSMS, generateOTP, getOTPExpiry } = require('../utils/otp.utils');

exports.createFranchise = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gstNumber,
      panNumber,
      documents,
    } = req.body;

    // Check if franchise with same email or GST exists
    const existingFranchise = await Franchise.findOne({
      $or: [{ email }, { gstNumber }],
    });

    if (existingFranchise) {
      return res.status(400).json({
        success: false,
        message: 'Franchise already exists with this email or GST number',
      });
    }

    const franchise = await Franchise.create({
      businessName,
      ownerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gstNumber,
      panNumber,
      documents: documents || [],
      createdBy: req.user.id,
      isActive: false, // Will be activated after user verification
    });

    res.status(201).json({
      success: true,
      message: 'Franchise created successfully. Create user credentials next.',
      data: franchise,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Franchise with this email or GST number already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllFranchises = async (req, res) => {
  try {
    const { search, status, city, state } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search by business name or owner name
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status !== undefined) {
      filter.isActive = status === 'active';
    }

    // Filter by location
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    const [franchises, total] = await Promise.all([
      Franchise.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Franchise.countDocuments(filter),
    ]);

    // Get counts for each franchise
    const franchisesWithCounts = await Promise.all(
      franchises.map(async (franchise) => {
        const [userCount, orderCount, foodCount, billCount] = await Promise.all([
          User.countDocuments({ franchiseId: franchise._id }),
          Order.countDocuments({ franchiseId: franchise._id }),
          Food.countDocuments({ franchiseId: franchise._id }),
          Bill.countDocuments({ franchiseId: franchise._id }),
        ]);

        return {
          ...franchise.toObject(),
          _count: {
            users: userCount,
            orders: orderCount,
            foods: foodCount,
            bills: billCount,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        franchises: franchisesWithCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
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

exports.getFranchiseById = async (req, res) => {
  try {
    const { id } = req.params;

    const franchise = await Franchise.findById(id)
      .populate('createdBy', 'name email');

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Get related data
    const [users, foods, orders, bills, counts, totalRevenue, totalExpenses] = await Promise.all([
      User.find({ franchiseId: id })
        .select('id name email mobileNo isActive isVerified createdAt')
        .limit(10),
      Food.find({ franchiseId: id, isUniversal: false })
        .limit(10)
        .sort({ createdAt: -1 }),
      Order.find({ franchiseId: id })
        .populate('items.foodId')
        .limit(10)
        .sort({ createdAt: -1 }),
      Bill.find({ franchiseId: id })
        .limit(5)
        .sort({ createdAt: -1 }),
      Promise.all([
        User.countDocuments({ franchiseId: id }),
        Order.countDocuments({ franchiseId: id }),
        Food.countDocuments({ franchiseId: id }),
        Bill.countDocuments({ franchiseId: id }),
        Expense.countDocuments({ franchiseId: id }),
      ]),
      Bill.aggregate([
        { $match: { franchiseId: franchise._id } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: { franchiseId: franchise._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    const [userCount, orderCount, foodCount, billCount, expenseCount] = counts;

    res.json({
      success: true,
      data: {
        ...franchise.toObject(),
        users,
        foods,
        orders,
        bills,
        _count: {
          users: userCount,
          orders: orderCount,
          foods: foodCount,
          bills: billCount,
          expenses: expenseCount,
        },
        stats: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalExpenses: totalExpenses[0]?.total || 0,
          netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
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

exports.updateFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const franchise = await Franchise.findByIdAndUpdate(id, updateData, { new: true });

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    res.json({
      success: true,
      message: 'Franchise updated successfully',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFranchise = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if franchise has active orders or bills
    const [orderCount, billCount] = await Promise.all([
      Order.countDocuments({ franchiseId: id }),
      Bill.countDocuments({ franchiseId: id }),
    ]);

    if (orderCount > 0 || billCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete franchise with existing orders or bills. Consider suspending instead.',
      });
    }

    const franchise = await Franchise.findByIdAndDelete(id);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    res.json({
      success: true,
      message: 'Franchise deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Suspend franchise (block access)
exports.suspendFranchise = async (req, res) => {
  try {
    const { id } = req.params;

    const franchise = await Franchise.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Also deactivate all users of this franchise
    await User.updateMany(
      { franchiseId: id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Franchise suspended successfully',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reactivate franchise
exports.reactivateFranchise = async (req, res) => {
  try {
    const { id } = req.params;

    const franchise = await Franchise.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Reactivate verified users of this franchise
    await User.updateMany(
      { 
        franchiseId: id,
        isVerified: true,
      },
      { isActive: true }
    );

    res.json({
      success: true,
      message: 'Franchise reactivated successfully',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send activation OTP to franchise
exports.sendActivationOTP = async (req, res) => {
  try {
    const { id } = req.params;

    const franchise = await Franchise.findById(id);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    const user = await User.findOne({ 
      franchiseId: id, 
      role: 'FRANCHISE_ADMIN' 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No franchise admin user found. Create user first.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry,
    });

    await sendOTPSMS(user.mobileNo, otp);

    res.json({
      success: true,
      message: 'Activation OTP sent to franchise mobile number',
      mobileNo: user.mobileNo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get franchise profile (for franchise users)
exports.getMyFranchise = async (req, res) => {
  try {
    if (!req.user.franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'No franchise associated with this user',
      });
    }

    const franchise = await Franchise.findById(req.user.franchiseId);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found',
      });
    }

    // Get users and counts
    const [users, counts] = await Promise.all([
      User.find({ franchiseId: req.user.franchiseId })
        .select('id name email mobileNo isActive isVerified'),
      Promise.all([
        Order.countDocuments({ franchiseId: req.user.franchiseId }),
        Food.countDocuments({ franchiseId: req.user.franchiseId }),
        Bill.countDocuments({ franchiseId: req.user.franchiseId }),
      ]),
    ]);

    const [orderCount, foodCount, billCount] = counts;

    res.json({
      success: true,
      data: {
        ...franchise.toObject(),
        users,
        _count: {
          orders: orderCount,
          foods: foodCount,
          bills: billCount,
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

// Update franchise profile (for franchise users)
exports.updateMyFranchise = async (req, res) => {
  try {
    if (!req.user.franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'No franchise associated with this user',
      });
    }

    const allowedFields = ['businessName', 'ownerName', 'phone', 'address', 'city', 'state', 'pincode', 'documents'];
    const updateData = {};
    
    // Only allow specific fields to be updated by franchise users
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const franchise = await Franchise.findByIdAndUpdate(
      req.user.franchiseId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Franchise profile updated successfully',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};