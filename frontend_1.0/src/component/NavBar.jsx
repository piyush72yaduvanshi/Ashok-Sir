import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      {/* Left Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center cursor-pointer"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/3565/3565418.png"
          alt="NCB Logo"
          className="w-10 h-10 mr-3"
        />
        <h1 className="text-2xl font-bold text-indigo-600 tracking-wide">
          NCB Billing
        </h1>
      </div>

      {/* Right Side Buttons */}
      <div className="flex space-x-4">
        {!isLoggedIn ? (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
          >
            Login
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
