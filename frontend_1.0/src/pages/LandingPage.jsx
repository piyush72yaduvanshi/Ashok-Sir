import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    
    <div className="bg-gradient-to-br from-indigo-100 via-white to-purple-100 min-h-screen flex flex-col items-center text-center px-6 py-10">
      {/* Hero Section */}
      <section className="mt-16 max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-4">
          Simplify Your <span className="text-indigo-600">Restaurant Billing</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Manage orders, print bills, and track payments — all in one
          user-friendly dashboard. Boost efficiency and delight your customers.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-indigo-700 transition duration-300"
        >
          Get Started →
        </button>
      </section>

      {/* Feature Section */}
      <section className="mt-20 grid md:grid-cols-3 gap-10 max-w-5xl">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3523/3523063.png"
            alt="Order"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Fast Order Billing
          </h3>
          <p className="text-gray-500 text-sm">
            Generate bills instantly for dine-in, takeaway, and online orders
            without delays.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3557/3557755.png"
            alt="Analytics"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Smart Reports
          </h3>
          <p className="text-gray-500 text-sm">
            Get insights on sales, discounts, and payment methods — all in one
            dashboard.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2821/2821663.png"
            alt="Security"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Secure Access
          </h3>
          <p className="text-gray-500 text-sm">
            Protect your restaurant data with secure login and role-based
            access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-gray-500 text-sm">
        © {new Date().getFullYear()} NCB Billing System | All Rights Reserved 🍴
      </footer>
    </div>
  );
};

export default LandingPage;
