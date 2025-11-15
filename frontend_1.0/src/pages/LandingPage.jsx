import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap size={32} />,
      title: "Fast Order Billing",
      description:
        "Generate bills instantly for dine-in, takeaway, and online orders without delays.",
      color: "from-orange-400 to-orange-500",
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Smart Analytics",
      description:
        "Get insights on sales, trends, and payment methods — all in one dashboard.",
      color: "from-blue-400 to-blue-500",
    },
    {
      icon: <Shield size={32} />,
      title: "Secure Access",
      description:
        "Protect your restaurant data with secure login and role-based access control.",
      color: "from-green-400 to-green-500",
    },
    {
      icon: <Users size={32} />,
      title: "Multi-Franchise",
      description:
        "Manage multiple franchise locations from a single centralized dashboard.",
      color: "from-purple-400 to-purple-500",
    },
    {
      icon: <ShoppingCart size={32} />,
      title: "POS System",
      description:
        "Modern point-of-sale system with intuitive interface for quick order processing.",
      color: "from-pink-400 to-pink-500",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Revenue Tracking",
      description:
        "Track daily, weekly, monthly, and yearly revenue with detailed breakdowns.",
      color: "from-amber-400 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-orange-700 font-semibold">NCB Fest</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Simplify Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Restaurant Billing
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage orders, track analytics, and streamline operations — all in
            one powerful platform. Boost efficiency and delight your customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold text-lg hover:border-orange-500 hover:text-orange-500 transition-all duration-300"
            >
              Sign In
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div>
              <p className="text-3xl font-bold text-orange-500">10K+</p>
              <p className="text-gray-600 text-sm mt-1">Orders Processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">500+</p>
              <p className="text-gray-600 text-sm mt-1">Restaurants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">99.9%</p>
              <p className="text-gray-600 text-sm mt-1">Uptime</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to run your restaurant smoothly
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants already using NCB Fest to streamline
            their operations and boost revenue.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="px-10 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-gray-700 font-semibold">NCB Fest</span>
            </div>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} NCB Fest. All rights reserved. 🍴
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-orange-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
