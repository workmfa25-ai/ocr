import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { LogOut } from "lucide-react";

const Navbar = ({ showLogout = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    navigate("/upload");
  };

  const isOCRResultsPage = location.pathname === "/results";

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-transparent">
      {/* Left Side - Logo + Back Button */}
      <div className="flex items-center space-x-4">
        {isOCRResultsPage && (
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
          >
            ← Back
          </button>
        )}
        <Logo type="wesee" size="large" />
      </div>

      {/* Center Title */}
      <div className="flex-1 flex justify-center px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent text-center">
          Optical Character Recognition
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex-shrink-0 flex items-center space-x-4">
        {showLogout && (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
        <Logo type="navy" size="large" />
      </div>
    </nav>
  );
};

export default Navbar;
