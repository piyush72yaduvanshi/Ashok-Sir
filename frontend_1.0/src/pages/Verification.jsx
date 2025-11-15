import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import api from "../config/api";

const VerificationPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter Mobile, 2: Enter OTP
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // Step 1: Generate OTP
  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/generate-otp", { mobileNo });
      console.log("OTP Response:", res.data);
      setMessage("✅ OTP sent successfully to your mobile!");
      setStep(2);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "❌ Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/verify-otp", { mobileNo, otp });
      console.log("Verify Response:", res.data);
      setSuccessModal(true);
      setMessage("✅ Account verified successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "❌ Invalid OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100 p-6">
      {/* Confetti Animation */}
      <AnimatePresence>
        {successModal && <Confetti numberOfPieces={400} recycle={false} />}
      </AnimatePresence>

      {/* Verification Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-3xl font-extrabold text-green-600">
            Verify Your Account
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1
              ? "Enter your mobile number to receive OTP"
              : "Enter the OTP sent to your mobile"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleGenerateOTP}
            className="space-y-5"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
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
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </motion.form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleVerifyOTP}
            className="space-y-5"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Enter OTP *
              </label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none text-lg text-center tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                OTP sent to {mobileNo}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
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
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-600 font-medium py-2 hover:text-gray-800 transition"
            >
              ← Change Mobile Number
            </button>
          </motion.form>
        )}

        {/* Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </motion.p>
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-3">
                Verification Successful!
              </h2>
              <p className="text-gray-600 mb-5">
                Your account has been verified. Redirecting to dashboard...
              </p>
              <div className="loader border-4 border-green-200 border-t-green-600 rounded-full w-10 h-10 mx-auto animate-spin"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerificationPage;
