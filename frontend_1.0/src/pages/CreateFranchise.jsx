import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import api from "../config/api";

const FranchiseRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [message, setMessage] = useState("");


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/create-franchise-user", formData);
      console.log("Response:", res.data);
      setSuccessModal(true);
      setMessage("✅ Franchise registered successfully!");

      setFormData({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        adminPassword: "",
      });

      setTimeout(() => {
        navigate("/verify");
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "❌ Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6">
      {/* Confetti Animation */}
      <AnimatePresence>
        {successModal && <Confetti numberOfPieces={400} recycle={false} />}
      </AnimatePresence>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl"
      >
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-2">
          Franchise Registration
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Register your restaurant franchise with NCB Billing System 🍴
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Business Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              placeholder="Smart Billing Solutions"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              placeholder="Ravi Kumar"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="franchise1@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="9889187202"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="123 MG Road"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              placeholder="Bangalore"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              placeholder="Karnataka"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              placeholder="560001"
              value={formData.pincode}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Admin Password
            </label>
            <input
              type="password"
              name="adminPassword"
              placeholder="Enter secure password"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-1/2 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition duration-300 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Register Franchise"
              )}
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-6 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm"
            >
              <h2 className="text-2xl font-bold text-green-600 mb-3">
                🎉 Registration Successful!
              </h2>
              <p className="text-gray-600 mb-5">
                Redirecting to verification page...
              </p>
              <div className="loader border-4 border-indigo-200 border-t-indigo-600 rounded-full w-10 h-10 mx-auto animate-spin"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FranchiseRegister;
