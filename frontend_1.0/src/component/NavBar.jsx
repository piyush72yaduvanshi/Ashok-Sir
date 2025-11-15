import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-800 tracking-tight">
              NCB Fest
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/dashboard"
                  label="Dashboard"
                  isActive={isActive("/dashboard")}
                  onClick={() => navigate("/dashboard")}
                />
                <NavLink
                  to="/analytics"
                  label="Analytics"
                  isActive={isActive("/analytics")}
                  onClick={() => navigate("/analytics")}
                />
                <NavLink
                  to="/create-franchise"
                  label="Create Franchise"
                  isActive={isActive("/create-franchise")}
                  onClick={() => navigate("/create-franchise")}
                />
                <NavLink
                  to="/food"
                  label="POS"
                  isActive={isActive("/food")}
                  onClick={() => navigate("/food")}
                />
                <NavLink
                  to="/bill"
                  label="Bills"
                  isActive={isActive("/bill")}
                  onClick={() => navigate("/bill")}
                />

                {/* User Menu */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <button
                    onClick={() => navigate("/profile")}
                    className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200"
                    title="Profile"
                  >
                    <User size={20} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {isLoggedIn ? (
              <>
                <MobileNavLink
                  label="Dashboard"
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/dashboard")}
                />
                <MobileNavLink
                  label="Analytics"
                  onClick={() => {
                    navigate("/analytics");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/analytics")}
                />
                <MobileNavLink
                  label="Create Franchise"
                  onClick={() => {
                    navigate("/create-franchise");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/create-franchise")}
                />
                <MobileNavLink
                  label="POS"
                  onClick={() => {
                    navigate("/food");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/food")}
                />
                <MobileNavLink
                  label="Bills"
                  onClick={() => {
                    navigate("/bill");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/bill")}
                />
                <MobileNavLink
                  label="Profile"
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  isActive={isActive("/profile")}
                />
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Nav Link Component
const NavLink = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? "text-orange-500 bg-orange-50"
        : "text-gray-700 hover:text-orange-500 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

// Mobile Nav Link Component
const MobileNavLink = ({ label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
      isActive
        ? "text-orange-500 bg-orange-50"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default Navbar;
