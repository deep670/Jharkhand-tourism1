import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
            Discover
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Incredible Jharkhand
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Your gateway to unforgettable journeys. Plan, explore, and experience the beauty of travel with AI-powered recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Start Your Journey
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Explore Destinations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}