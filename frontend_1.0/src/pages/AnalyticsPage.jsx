import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react";
import api from "../config/api";

const AnalyticsPage = () => {
  const [period, setPeriod] = useState("today");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, categoryRes] = await Promise.all([
        api.get(`/api/v1/analytics?period=${period}`),
        api.get(`/api/v1/analytics/category-sales?period=${period}`),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
        setTrends(analyticsRes.data.trends || []);
      }

      if (categoryRes.data.success) {
        setCategorySales(categoryRes.data.categorySales || []);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "7days", label: "7 Days" },
    { value: "monthly", label: "This Month" },
    { value: "yearly", label: "This Year" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <BarChart3 className="text-orange-500" size={32} />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your business performance and insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {loading && !analytics ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : analytics ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<ShoppingCart />}
                label="Total Orders"
                value={analytics.totalOrders}
                color="blue"
                delay={0.1}
              />
              <StatCard
                icon={<DollarSign />}
                label="Total Revenue"
                value={`₹${analytics.totalRevenue.toLocaleString()}`}
                color="green"
                delay={0.2}
              />
              <StatCard
                icon={<TrendingUp />}
                label="Avg Order Value"
                value={`₹${analytics.averageOrderValue.toLocaleString()}`}
                color="orange"
                delay={0.3}
              />
              <StatCard
                icon={<Users />}
                label="Cash Orders"
                value={analytics.paymentMethods.cash.count}
                color="purple"
                delay={0.4}
              />
            </div>

            {/* Payment & Order Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="text-orange-500" size={20} />
                  Payment Methods
                </h3>
                <div className="space-y-4">
                  <PaymentBar
                    label="Cash"
                    count={analytics.paymentMethods.cash.count}
                    revenue={analytics.paymentMethods.cash.revenue}
                    total={analytics.totalRevenue}
                    color="bg-green-500"
                  />
                  <PaymentBar
                    label="Online"
                    count={analytics.paymentMethods.online.count}
                    revenue={analytics.paymentMethods.online.revenue}
                    total={analytics.totalRevenue}
                    color="bg-blue-500"
                  />
                </div>
              </motion.div>

              {/* Order Types */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="text-orange-500" size={20} />
                  Order Types
                </h3>
                <div className="space-y-4">
                  <PaymentBar
                    label="Dine In"
                    count={analytics.orderTypes.dineIn.count}
                    revenue={analytics.orderTypes.dineIn.revenue}
                    total={analytics.totalRevenue}
                    color="bg-purple-500"
                  />
                  <PaymentBar
                    label="Takeaway"
                    count={analytics.orderTypes.takeaway.count}
                    revenue={analytics.orderTypes.takeaway.revenue}
                    total={analytics.totalRevenue}
                    color="bg-orange-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Popular Items */}
            {analytics.popularItems && analytics.popularItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-md p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-orange-500" size={20} />
                  Top Selling Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Item
                        </th>
                        <th className="text-right py-3 px-4 text-gray-600 font-medium">
                          Quantity
                        </th>
                        <th className="text-right py-3 px-4 text-gray-600 font-medium">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.popularItems.slice(0, 5).map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-800 font-medium">
                            ₹{item.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Category Sales */}
            {categorySales.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-md p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="text-orange-500" size={20} />
                  Category Sales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySales.map((category, index) => (
                    <CategoryCard key={index} category={category} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trends Chart */}
            {trends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-orange-500" size={20} />
                  Revenue Trends
                </h3>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <TrendBar
                      key={index}
                      label={trend.date || trend.month}
                      revenue={trend.revenue}
                      orders={trend.orders}
                      maxRevenue={Math.max(...trends.map((t) => t.revenue))}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color, delay }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Payment Bar Component
const PaymentBar = ({ label, count, revenue, total, color }) => {
  const percentage = total > 0 ? (revenue / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600 text-sm">
          {count} orders • ₹{revenue.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all duration-200">
    <h4 className="font-semibold text-gray-800 mb-2">{category.category}</h4>
    <div className="space-y-1 text-sm">
      <p className="text-gray-600">
        Quantity: <span className="font-medium text-gray-800">{category.quantity}</span>
      </p>
      <p className="text-gray-600">
        Revenue:{" "}
        <span className="font-medium text-gray-800">
          ₹{category.revenue.toLocaleString()}
        </span>
      </p>
      <p className="text-gray-600">
        Orders: <span className="font-medium text-gray-800">{category.orderCount}</span>
      </p>
    </div>
  </div>
);

// Trend Bar Component
const TrendBar = ({ label, revenue, orders, maxRevenue }) => {
  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        <span className="text-sm text-gray-600">
          {orders} orders • ₹{revenue.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
