import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { ArrowRightOnRectangleIcon, UserCircleIcon, HomeIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

// A reusable component for menu items
const DropdownItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default function Navbar() {
  const [user, loading] = useAuthState(auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate("/"); // Redirect to welcome page after logout
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    // You can create a profile page later
    alert('Profile page coming soon!');
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    // You can create a settings page later
    alert('Settings page coming soon!');
  };

  // Show loading state
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[10vh] bg-white shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="h-6 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 
      flex items-center justify-between h-[8vh] transition-all duration-500 ease-in-out
      ${isScrolled 
        ? 'bg-white shadow-xl border-b border-slate-200' 
        : 'bg-white shadow-lg'
      }
    `}>
      {/* Logo / Title */}
      <button 
        onClick={handleLogoClick}
        className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-700  to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
      >
         NavMate
      </button>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${
            location.pathname === '/dashboard'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          Home
        </button>
        
        {/* {user && (
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${
              location.pathname === '/dashboard'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Dashboard
          </button>
        )} */}
        
        <button
          onClick={() => navigate("/services")}
          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${
            location.pathname === '/services'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          services
        </button>

        <button
          onClick={() => navigate("/infinite")}
          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${
            location.pathname === '/infinite'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          Explore
        </button>
        
        <button
          onClick={() => navigate("/JharkhandInfo")}
          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-300 ${
            location.pathname === '/JharkhandInfo'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          Overviews
        </button>
      </div>

      {/* Right side (Auth buttons) */}
      <div className="flex items-center">
        {!user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Login Button (less emphasis) */}
            <button
              onClick={handleLogin}
              className="px-4 py-2.5 font-medium text-slate-700 hover:text-blue-600 transition-colors duration-300"
            >
              Login
            </button>
            
            {/* Sign Up Button (more emphasis, uses gradient style) */}
            <button
              onClick={handleSignUp}
              className="group relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 overflow-hidden rounded-lg bg-gradient-to-tr from-blue-500 to-blue-500 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <span className="font-medium text-sm sm:text-base">Sign Up</span>
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar Trigger */}
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none group"
            >
              {/* <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 shadow-md"
              /> */}
              <span className="hidden md:block text-slate-800 font-medium text-sm">
                {user.displayName || user.email?.split('@')[0] || "User"}
              </span>
              {/* Dropdown Arrow */}
              <svg 
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className={`
              absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none
              transition-all duration-300 ease-in-out
              ${isDropdownOpen 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95 pointer-events-none'
              }
            `}>
              <div className="py-2">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm text-slate-500">Signed in as</p>
                  <p className="font-semibold text-slate-800 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 truncate">{user.displayName}</p>
                </div>
                {/* <div className="py-1"> */}
                 
                  <div className="border-t border-slate-200">
                    <DropdownItem 
                      icon={<ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />}
                      text="Logout"
                      onClick={handleLogout} 
                    />
                  </div>
                {/* </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}