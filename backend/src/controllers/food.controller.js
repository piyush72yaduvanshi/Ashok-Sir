const { Food } = require('../models');

exports.createFood = async (req, res) => {
  try {
    const { name, description, category, price, isUniversal, image, preparationTime } = req.body;

    // Only super admin can create universal foods
    if (isUniversal && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can create universal food items',
      });
    }

    
    const existingFood = await Food.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [
        { franchiseId: req.user.franchiseId },
        { isUniversal: true },
      ],
    });

    if (existingFood) {
      return res.status(400).json({
        success: false,
        message: 'Food item with this name already exists',
      });
    }

    const food = await Food.create({
      name,
      description,
      category,
      price: parseFloat(price),
      franchiseId: isUniversal ? null : req.user.franchiseId,
      isUniversal: isUniversal || false,
      image,
      preparationTime: preparationTime || 15,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `${isUniversal ? 'Universal' : 'Franchise'} food item created successfully`,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllFoods = async (req, res) => {
  try {
    const { franchiseId, category, isAvailable, isUniversal, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // For franchise users, show their foods + universal foods
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.$or = [
        { franchiseId: req.user.franchiseId },
        { isUniversal: true },
      ];
    } else if (franchiseId) {
      // Super admin filtering by specific franchise
      filter.$or = [{ franchiseId }, { isUniversal: true }];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by availability
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    // Filter by universal status (for super admin)
    if (isUniversal !== undefined && req.user.role === 'SUPER_ADMIN') {
      filter.isUniversal = isUniversal === 'true';
    }

    // Search by name or description
    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
      Object.assign(filter, searchFilter);
    }

    const [foods, total] = await Promise.all([
      Food.find(filter)
        .populate('createdBy', 'name email')
        .populate('franchiseId', 'businessName')
        .sort({ isUniversal: -1, name: 1 }) // Universal foods first
        .skip(skip)
        .limit(limit),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        foods,
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

exports.updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if food exists and user has permission
    const existingFood = await Food.findById(id);

    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Check permissions
    if (existingFood.isUniversal && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can update universal food items',
      });
    }

    if (!existingFood.isUniversal && existingFood.franchiseId?.toString() !== req.user.franchiseId?.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own franchise food items',
      });
    }

    // Prevent changing universal status by franchise users
    const updateData = { ...req.body };
    if (req.user.role !== 'SUPER_ADMIN') {
      delete updateData.isUniversal;
      delete updateData.franchiseId;
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if food exists and user has permission
    const existingFood = await Food.findById(id);

    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    // Check permissions
    if (existingFood.isUniversal && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can delete universal food items',
      });
    }

    if (!existingFood.isUniversal && existingFood.franchiseId?.toString() !== req.user.franchiseId?.toString() && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own franchise food items',
      });
    }

    await Food.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle food availability globally (Super Admin only)
exports.toggleGlobalAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    if (!food.isUniversal) {
      return res.status(400).json({
        success: false,
        message: 'This action is only available for universal food items',
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    res.json({
      success: true,
      message: `Universal food item ${isAvailable ? 'enabled' : 'disabled'} globally`,
      data: updatedFood,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get food categories
exports.getFoodCategories = async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.$or = [
        { franchiseId: req.user.franchiseId },
        { isUniversal: true },
      ];
    }

    const categories = await Food.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
