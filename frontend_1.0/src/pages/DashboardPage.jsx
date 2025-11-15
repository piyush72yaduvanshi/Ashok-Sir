import React, { useEffect, useState } from "react";
import api from "../config/api";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Store } from "lucide-react";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchDashboardData();
  }, [period]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      if (res.data.success) {
        setUser(res.data.data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/dashboard?period=${period}`);
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-100">
        <div className="loader border-4 border-indigo-300 border-t-indigo-700 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
          📊 Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>! Here's your business summary.
        </p>
      </motion.div>

      {/* Period Selector */}
      <div className="mb-6 flex space-x-3">
        {["today", "week", "month"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition duration-300 shadow-md ${
              period === p
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-indigo-50"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">₹{summary.summary.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold mt-2">{summary.summary.totalOrders}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Order Value</p>
                  <p className="text-3xl font-bold mt-2">₹{summary.summary.averageOrderValue}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Top Items</p>
                  <p className="text-3xl font-bold mt-2">{summary.topSellingItems.length}</p>
                </div>
                <Package className="w-12 h-12 text-orange-200" />
              </div>
            </motion.div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-indigo-700 mb-4">
                💳 Payment Methods
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Cash</span>
                  <span className="font-bold text-indigo-600">
                    {summary.breakdown.paymentMethods.cash} orders
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Online</span>
                  <span className="font-bold text-green-600">
                    {summary.breakdown.paymentMethods.online} orders
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Order Types */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-indigo-700 mb-4">
                🍽️ Order Types
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Dine In</span>
                  <span className="font-bold text-blue-600">
                    {summary.breakdown.orderTypes.dineIn} orders
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Takeaway</span>
                  <span className="font-bold text-orange-600">
                    {summary.breakdown.orderTypes.takeaway} orders
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Selling Items */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              🔥 Top Selling Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-indigo-100 text-gray-700">
                    <th className="p-3 text-left rounded-tl-lg">Item</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left rounded-tr-lg">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topSellingItems.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-900">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.quantity}</td>
                      <td className="p-3 text-gray-600">₹{item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              📋 Recent Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-indigo-100 text-gray-700">
                    <th className="p-3 text-left rounded-tl-lg">Bill Number</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Payment</th>
                    <th className="p-3 text-left rounded-tr-lg">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((order, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-indigo-600">{order.billNumber}</td>
                      <td className="p-3 text-gray-600">{order.customerName}</td>
                      <td className="p-3 text-gray-900 font-semibold">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="p-3 text-gray-600">{order.paymentMethod}</td>
                      <td className="p-3 text-gray-600">{order.orderType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;