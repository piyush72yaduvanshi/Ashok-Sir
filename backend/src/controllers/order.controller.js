const { Order, Food } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { items, orderType, discount, customerName, tableNumber, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    let subtotal = 0;
    const orderItems = [];

    // Validate and calculate order items
    for (const item of items) {
      const food = await Food.findById(item.foodId);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food item with ID ${item.foodId} not found`,
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Food item "${food.name}" is currently unavailable`,
        });
      }

      // Check if food belongs to franchise or is universal
      if (!food.isUniversal && food.franchiseId?.toString() !== req.user.franchiseId?.toString()) {
        return res.status(403).json({
          success: false,
          message: `Food item "${food.name}" is not available for your franchise`,
        });
      }

      const itemSubtotal = parseFloat(food.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        foodId: food._id,
        foodName: food.name,
        quantity: item.quantity,
        price: food.price,
        subtotal: itemSubtotal,
        specialInstructions: item.specialInstructions || null,
      });
    }

    const discountAmount = discount || 0;
    const tax = (subtotal - discountAmount) * 0.05; // 5% GST
    const totalAmount = subtotal + tax - discountAmount;

    // Generate order number
    const orderCount = await Order.countDocuments({
      franchiseId: req.user.franchiseId,
    });
    const franchiseCode = req.user.franchiseId ? req.user.franchiseId.toString().slice(-4).toUpperCase() : 'XXXX';
    const orderNumber = `${franchiseCode}${String(orderCount + 1).padStart(6, '0')}`;

    const order = await Order.create({
      orderNumber,
      franchiseId: req.user.franchiseId,
      orderType: orderType || 'DINE_IN',
      subtotal,
      tax,
      discount: discountAmount,
      totalAmount,
      customerName,
      tableNumber,
      notes,
      createdBy: req.user.id,
      items: orderItems,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodId')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      orderType, 
      paymentStatus, 
      startDate, 
      endDate, 
      search,
      page = 1,
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    // Franchise users can only see their orders
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    // Filters
    if (status) {
      filter.status = status;
    }

    if (orderType) {
      filter.orderType = orderType;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Search by order number or customer name
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.foodId', 'name category')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
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

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const order = await Order.findOne(filter)
      .populate('items.foodId')
      .populate('createdBy', 'name email')
      .populate('franchiseId', 'businessName address phone gstNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, orderType, discount, customerName, tableNumber, notes } = req.body;

    // Check if order exists and belongs to franchise
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (req.user.role === 'FRANCHISE_ADMIN' && existingOrder.franchiseId?.toString() !== req.user.franchiseId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own franchise orders',
      });
    }

    // Check if order can be updated
    if (existingOrder.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed orders',
      });
    }

    let updateData = {
      orderType,
      customerName,
      tableNumber,
      notes,
    };

    // If items are being updated, recalculate totals
    if (items && items.length > 0) {
      let subtotal = 0;
      const orderItems = [];

      // Validate and calculate new items
      for (const item of items) {
        const food = await Food.findById(item.foodId);

        if (!food || !food.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Food item "${food?.name || 'Unknown'}" is not available`,
          });
        }

        const itemSubtotal = parseFloat(food.price) * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          foodId: food._id,
          foodName: food.name,
          quantity: item.quantity,
          price: food.price,
          subtotal: itemSubtotal,
          specialInstructions: item.specialInstructions || null,
        });
      }

      const discountAmount = discount || existingOrder.discount;
      const tax = (subtotal - discountAmount) * 0.05;
      const totalAmount = subtotal + tax - discountAmount;

      updateData = {
        ...updateData,
        subtotal,
        tax,
        discount: discountAmount,
        totalAmount,
        items: orderItems,
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true })
      .populate('items.foodId')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: PENDING, COMPLETED, CANCELLED',
      });
    }

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const order = await Order.findOneAndUpdate(
      filter,
      {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      { new: true }
    ).populate('items.foodId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists and belongs to franchise
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (req.user.role === 'FRANCHISE_ADMIN' && existingOrder.franchiseId?.toString() !== req.user.franchiseId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own franchise orders',
      });
    }

    // Check if order can be deleted
    if (existingOrder.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed orders',
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case 'week':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lte: now,
          },
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
        break;
      default:
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            $lte: now,
          },
        };
    }

    const filter = { ...dateFilter };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, status: 'PENDING' }),
      Order.countDocuments({ ...filter, status: 'COMPLETED' }),
      Order.countDocuments({ ...filter, status: 'CANCELLED' }),
      Order.aggregate([
        { $match: { ...filter, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
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