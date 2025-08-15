import React, { useContext } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";

const HomeNavbar = ({ activeTab, setActiveTab, handleLogout, isUserDropdownOpen, setIsUserDropdownOpen, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <button
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => navigate("/")}
            aria-label="Go to Home"
            style={{ background: "none", border: "none", padding: 0, margin: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="ri-code-s-slash-line text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeMate
            </h1>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate("/projects")}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <i className="ri-folder-line mr-2"></i>
              Projects
            </button>
            <button
              onClick={() => navigate("/developers")}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              <i className="ri-team-line mr-2"></i>
              Developers
            </button>
          </div>

          {/* User Profile Section */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsUserDropdownOpen && setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split('@')[0] || "User"}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <i
                className={`ri-arrow-down-s-line text-gray-400 transition-transform ${
                  isUserDropdownOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.name || user?.email?.split('@')[0] || "User"}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <i className="ri-home-line mr-3"></i>
                  Home
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <i className="ri-user-settings-line mr-3"></i>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                >
                  <i className="ri-logout-box-line mr-3"></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
