const { Order, Bill, Expense, Franchise } = require('../models');

// Super Admin: Get analytics for all franchises
exports.getAllFranchisesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, franchiseId, franchiseName } = req.query;

    const dateFilter = {
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    let franchiseFilter = {};
    if (franchiseId) {
      franchiseFilter._id = franchiseId;
    }
    if (franchiseName) {
      franchiseFilter.businessName = { $regex: franchiseName, $options: 'i' };
    }

    // Get all franchises
    const franchises = await Franchise.find(franchiseFilter);

    const analyticsData = await Promise.all(
      franchises.map(async (franchise) => {
        const [orders, bills, expenses, userCount, foodCount] = await Promise.all([
          Order.find({
            franchiseId: franchise._id,
            ...dateFilter,
          }).populate('items.foodId'),
          Bill.find({
            franchiseId: franchise._id,
            paidAt: dateFilter.createdAt,
          }),
          Expense.find({
            franchiseId: franchise._id,
            expenseDate: dateFilter.createdAt,
          }),
          User.countDocuments({ franchiseId: franchise._id }),
          // You'll need to implement Food count based on your Food model
          0, // Placeholder for food count
        ]);

        const totalOrders = orders.length;
        const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalRevenue - totalExpenses;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate popular items for this franchise
        const itemStats = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            const key = item.foodId?.toString() || item.foodName;
            if (!itemStats[key]) {
              itemStats[key] = {
                foodName: item.foodName,
                quantity: 0,
                revenue: 0,
              };
            }
            itemStats[key].quantity += item.quantity;
            itemStats[key].revenue += parseFloat(item.subtotal);
          });
        });

        const popularItems = Object.values(itemStats)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        return {
          franchiseId: franchise._id,
          businessName: franchise.businessName,
          ownerName: franchise.ownerName,
          city: franchise.city,
          state: franchise.state,
          isActive: franchise.isActive,
          totalOrders,
          totalRevenue,
          totalExpenses,
          netProfit,
          averageOrderValue,
          popularItems,
          userCount,
          foodCount,
        };
      })
    );

    // Calculate overall totals
    const overallStats = {
      totalFranchises: franchises.length,
      totalOrders: analyticsData.reduce((sum, f) => sum + f.totalOrders, 0),
      totalRevenue: analyticsData.reduce((sum, f) => sum + f.totalRevenue, 0),
      totalExpenses: analyticsData.reduce((sum, f) => sum + f.totalExpenses, 0),
      totalNetProfit: analyticsData.reduce((sum, f) => sum + f.netProfit, 0),
      averageRevenuePerFranchise: analyticsData.length > 0 ? 
        analyticsData.reduce((sum, f) => sum + f.totalRevenue, 0) / analyticsData.length : 0,
    };

    // Top performing franchises
    const topPerformingFranchises = analyticsData
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Global popular items
    const globalItemStats = {};
    analyticsData.forEach(franchise => {
      franchise.popularItems.forEach(item => {
        if (!globalItemStats[item.foodName]) {
          globalItemStats[item.foodName] = {
            foodName: item.foodName,
            quantity: 0,
            revenue: 0,
            franchiseCount: new Set(),
          };
        }
        globalItemStats[item.foodName].quantity += item.quantity;
        globalItemStats[item.foodName].revenue += item.revenue;
        globalItemStats[item.foodName].franchiseCount.add(franchise.franchiseId);
      });
    });

    const globalPopularItems = Object.values(globalItemStats)
      .map(item => ({
        ...item,
        franchiseCount: item.franchiseCount.size,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        overallStats,
        franchiseAnalytics: analyticsData,
        topPerformingFranchises,
        globalPopularItems,
        dateRange: {
          startDate: dateFilter.createdAt.$gte,
          endDate: dateFilter.createdAt.$lte,
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

// Get analytics for a specific franchise
exports.getFranchiseAnalytics = async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const { startDate, endDate, period } = req.query;

    // Determine date range
    let dateFilter;
    if (period) {
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
              $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lte: now,
            },
          };
      }
    } else {
      dateFilter = {
        createdAt: {
          $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: endDate ? new Date(endDate) : new Date(),
        },
      };
    }

    const [orders, bills, expenses] = await Promise.all([
      Order.find({
        franchiseId,
        ...dateFilter,
      }).populate('items.foodId'),
      Bill.find({
        franchiseId,
        paidAt: dateFilter.createdAt,
      }),
      Expense.find({
        franchiseId,
        expenseDate: dateFilter.createdAt,
      }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const grossProfit = totalRevenue * 0.95; // After 5% GST
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Popular items analysis
    const itemStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.foodId?.toString() || item.foodName;
        if (!itemStats[key]) {
          itemStats[key] = {
            foodId: item.foodId,
            foodName: item.foodName,
            quantity: 0,
            revenue: 0,
            orderCount: 0,
          };
        }
        itemStats[key].quantity += item.quantity;
        itemStats[key].revenue += parseFloat(item.subtotal);
        itemStats[key].orderCount += 1;
      });
    });

    const popularItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Daily/hourly breakdown
    const dailyStats = {};
    const hourlyStats = Array(24).fill(0);

    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const hour = order.createdAt.getHours();

      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          orders: 0,
          revenue: 0,
        };
      }
      dailyStats[date].orders += 1;
      hourlyStats[hour] += 1;
    });

    bills.forEach(bill => {
      const date = bill.paidAt.toISOString().split('T')[0];
      if (dailyStats[date]) {
        dailyStats[date].revenue += parseFloat(bill.totalAmount);
      }
    });

    const dailyBreakdown = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Peak hours (top 5 hours with most orders)
    const peakHours = hourlyStats
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Payment method breakdown
    const paymentMethodStats = {};
    bills.forEach(bill => {
      if (!paymentMethodStats[bill.paymentMethod]) {
        paymentMethodStats[bill.paymentMethod] = {
          count: 0,
          amount: 0,
        };
      }
      paymentMethodStats[bill.paymentMethod].count += 1;
      paymentMethodStats[bill.paymentMethod].amount += parseFloat(bill.totalAmount);
    });

    // Order type breakdown
    const orderTypeStats = {};
    orders.forEach(order => {
      if (!orderTypeStats[order.orderType]) {
        orderTypeStats[order.orderType] = {
          count: 0,
          revenue: 0,
        };
      }
      orderTypeStats[order.orderType].count += 1;
    });

    bills.forEach(bill => {
      const order = orders.find(o => o._id.toString() === bill.orderId.toString());
      if (order && orderTypeStats[order.orderType]) {
        orderTypeStats[order.orderType].revenue += parseFloat(bill.totalAmount);
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          totalExpenses,
          netProfit,
          grossProfit,
          averageOrderValue,
        },
        popularItems,
        dailyBreakdown,
        peakHours,
        paymentMethodStats,
        orderTypeStats,
        dateRange: {
          startDate: dateFilter.createdAt.$gte,
          endDate: dateFilter.createdAt.$lte,
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

// Get revenue reports
exports.getRevenueReport = async (req, res) => {
  try {
    const { franchiseId, period, startDate, endDate } = req.query;

    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'daily':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
            $lte: now,
          },
        };
        break;
      case 'weekly':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
            $lte: now,
          },
        };
        break;
      case 'monthly':
        dateFilter = {
          paidAt: {
            $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1), // 12 months
            $lte: now,
          },
        };
        break;
      default:
        dateFilter = {
          paidAt: {
            $gte: startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lte: endDate ? new Date(endDate) : now,
          },
        };
    }

    const filter = { ...dateFilter };
    if (franchiseId) {
      filter.franchiseId = franchiseId;
    }

    const bills = await Bill.find(filter)
      .populate('franchiseId', 'businessName city state')
      .sort({ paidAt: 1 });

    // Group by period
    const revenueData = {};
    bills.forEach(bill => {
      let key;
      const date = new Date(bill.paidAt);

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!revenueData[key]) {
        revenueData[key] = {
          period: key,
          totalRevenue: 0,
          totalBills: 0,
          franchises: new Set(),
        };
      }

      revenueData[key].totalRevenue += parseFloat(bill.totalAmount);
      revenueData[key].totalBills += 1;
      if (bill.franchiseId) {
        revenueData[key].franchises.add(bill.franchiseId._id.toString());
      }
    });

    const reportData = Object.values(revenueData).map(item => ({
      ...item,
      franchiseCount: item.franchises.size,
      averagePerBill: item.totalBills > 0 ? item.totalRevenue / item.totalBills : 0,
    }));

    res.json({
      success: true,
      data: {
        reportData,
        summary: {
          totalRevenue: reportData.reduce((sum, item) => sum + item.totalRevenue, 0),
          totalBills: reportData.reduce((sum, item) => sum + item.totalBills, 0),
          averageRevenue: reportData.length > 0 ? 
            reportData.reduce((sum, item) => sum + item.totalRevenue, 0) / reportData.length : 0,
        },
        period,
        dateRange: dateFilter.paidAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};