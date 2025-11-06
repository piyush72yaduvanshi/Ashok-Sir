const { Bill, Order } = require('../models');

exports.createBill = async (req, res) => {
  try {
    const { orderId, paymentMethod, paidAmount, customerDetails } = req.body;

    const order = await Order.findById(orderId)
      .populate('items.foodId')
      .populate('franchiseId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to franchise (for franchise users)
    if (req.user.role === 'FRANCHISE_ADMIN' && order.franchiseId._id.toString() !== req.user.franchiseId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create bills for your own franchise orders',
      });
    }

    // Check if order is already billed
    const existingBill = await Bill.findOne({ orderId });

    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been billed',
      });
    }

    const subtotal = parseFloat(order.subtotal);
    const cgst = parseFloat((subtotal * 0.025).toFixed(2)); // 2.5%
    const sgst = parseFloat((subtotal * 0.025).toFixed(2)); // 2.5%
    const totalAmount = parseFloat(order.totalAmount);
    const paidAmountValue = paidAmount ? parseFloat(paidAmount) : totalAmount;
    const changeAmount = paidAmountValue > totalAmount ? parseFloat((paidAmountValue - totalAmount).toFixed(2)) : 0;

    // Generate bill number
    const billCount = await Bill.countDocuments({
      franchiseId: order.franchiseId._id,
    });
    const businessCode = order.franchiseId.businessName.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || 'BIL';
    const billNumber = `${businessCode}${String(billCount + 1).padStart(6, '0')}`;

    const bill = await Bill.create({
      billNumber,
      franchiseId: order.franchiseId._id,
      orderId,
      subtotal,
      cgst,
      sgst,
      discount: parseFloat(order.discount),
      totalAmount,
      paymentMethod,
      paidAmount: paidAmountValue,
      changeAmount,
      customerDetails: customerDetails || {},
      paidAt: new Date(),
      generatedBy: req.user.id,
    });

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod,
      completedAt: new Date(),
    });

    // Fetch complete bill data
    const completeBill = await Bill.findById(bill._id)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.foodId'
        }
      })
      .populate('franchiseId')
      .populate('generatedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: completeBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllBills = async (req, res) => {
  try {
    const { 
      franchiseId, 
      paymentMethod, 
      startDate, 
      endDate, 
      search,
      page = 1,
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    // Franchise users can only see their bills
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    } else if (franchiseId) {
      filter.franchiseId = franchiseId;
    }

    // Filters
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) {
        filter.paidAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.paidAt.$lte = new Date(endDate);
      }
    }

    // Search by bill number or order number
    if (search) {
      const orders = await Order.find({
        orderNumber: { $regex: search, $options: 'i' }
      }).select('_id');
      
      filter.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { orderId: { $in: orders.map(o => o._id) } }
      ];
    }

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('orderId', 'orderNumber customerName orderType')
        .populate('franchiseId', 'businessName')
        .populate('generatedBy', 'name')
        .sort({ paidAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Bill.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        bills,
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

exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const bill = await Bill.findOne(filter)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.foodId',
          select: 'name category description'
        }
      })
      .populate('franchiseId')
      .populate('generatedBy', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate bill PDF (placeholder - would need PDF library like puppeteer or jsPDF)
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const bill = await Bill.findOne(filter)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.foodId'
        }
      })
      .populate('franchiseId')
      .populate('generatedBy', 'name');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Generate HTML for PDF (this would be converted to PDF using a library)
    const billHTML = generateBillHTML(bill);

    res.json({
      success: true,
      message: 'Bill PDF data generated',
      data: {
        billId: bill._id,
        billNumber: bill.billNumber,
        htmlContent: billHTML,
        // In a real implementation, you would return PDF buffer or URL
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Print bill (returns formatted data for printing)
exports.printBill = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role === 'FRANCHISE_ADMIN') {
      filter.franchiseId = req.user.franchiseId;
    }

    const bill = await Bill.findOne(filter)
      .populate({
        path: 'orderId',
        populate: {
          path: 'items.foodId'
        }
      })
      .populate('franchiseId');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Format bill data for thermal printer
    const printData = {
      header: {
        businessName: bill.franchiseId.businessName,
        address: bill.franchiseId.address,
        phone: bill.franchiseId.phone,
        gstNumber: bill.franchiseId.gstNumber,
      },
      bill: {
        billNumber: bill.billNumber,
        orderNumber: bill.orderId.orderNumber,
        date: bill.paidAt.toLocaleDateString(),
        time: bill.paidAt.toLocaleTimeString(),
        customerName: bill.orderId.customerName,
        tableNumber: bill.orderId.tableNumber,
      },
      items: bill.orderId.items.map(item => ({
        name: item.foodName,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.subtotal),
      })),
      totals: {
        subtotal: parseFloat(bill.subtotal),
        cgst: parseFloat(bill.cgst),
        sgst: parseFloat(bill.sgst),
        discount: parseFloat(bill.discount),
        total: parseFloat(bill.totalAmount),
        paid: parseFloat(bill.paidAmount),
        change: parseFloat(bill.changeAmount),
        paymentMethod: bill.paymentMethod,
      },
    };

    res.json({
      success: true,
      message: 'Bill print data generated',
      data: printData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get bill statistics
exports.getBillStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case 'week':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lte: now,
          },
        };
        break;
      case 'month':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
        break;
      default:
        dateFilter = {
          paidAt: {
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
      totalBills,
      totalRevenue,
      averageBillValue,
      paymentMethodStats,
    ] = await Promise.all([
      Bill.countDocuments(filter),
      Bill.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Bill.aggregate([
        { $match: filter },
        { $group: { _id: null, average: { $avg: '$totalAmount' } } }
      ]),
      Bill.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            amount: { $sum: '$totalAmount' }
          }
        }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalBills,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageBillValue: averageBillValue[0]?.average || 0,
        paymentMethodStats: paymentMethodStats.map(stat => ({
          method: stat._id,
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

// Helper function to generate HTML for bill
function generateBillHTML(bill) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill - ${bill.billNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .bill-details { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .totals { margin-top: 20px; text-align: right; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${bill.franchiseId.businessName}</h2>
        <p>${bill.franchiseId.address}</p>
        <p>Phone: ${bill.franchiseId.phone} | GST: ${bill.franchiseId.gstNumber}</p>
      </div>
      
      <div class="bill-details">
        <p><strong>Bill No:</strong> ${bill.billNumber}</p>
        <p><strong>Order No:</strong> ${bill.orderId.orderNumber}</p>
        <p><strong>Date:</strong> ${bill.paidAt.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bill.paidAt.toLocaleTimeString()}</p>
        ${bill.orderId.customerName ? `<p><strong>Customer:</strong> ${bill.orderId.customerName}</p>` : ''}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${bill.orderId.items.map(item => `
            <tr>
              <td>${item.foodName}</td>
              <td>${item.quantity}</td>
              <td>₹${parseFloat(item.price).toFixed(2)}</td>
              <td>₹${parseFloat(item.subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <p>Subtotal: ₹${parseFloat(bill.subtotal).toFixed(2)}</p>
        <p>CGST (2.5%): ₹${parseFloat(bill.cgst).toFixed(2)}</p>
        <p>SGST (2.5%): ₹${parseFloat(bill.sgst).toFixed(2)}</p>
        ${parseFloat(bill.discount) > 0 ? `<p>Discount: -₹${parseFloat(bill.discount).toFixed(2)}</p>` : ''}
        <p><strong>Total: ₹${parseFloat(bill.totalAmount).toFixed(2)}</strong></p>
        <p>Paid (${bill.paymentMethod}): ₹${parseFloat(bill.paidAmount).toFixed(2)}</p>
        ${parseFloat(bill.changeAmount) > 0 ? `<p>Change: ₹${parseFloat(bill.changeAmount).toFixed(2)}</p>` : ''}
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated by: ${bill.generatedBy.name}</p>
      </div>
    </body>
    </html>
  `;
}