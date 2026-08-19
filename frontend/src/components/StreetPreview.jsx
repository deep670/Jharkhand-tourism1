import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Link } from "react-router-dom";
import { ArrowLeft, Map, Eye, Landmark, Utensils, Users, Search, MapPin, X, ImageIcon, AlertCircle, Clock } from "lucide-react";

// Import Swiper for the image gallery
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import your map image
import JharkhandMap from '../assets/Jharkhand.png';

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Data for Map Hotspots (Popular locations for quick access) ---
const popularLocations = [
  { name: "Ranchi", top: "58%", left: "45%" },
  { name: "Jamshedpur", top: "75%", left: "60%" },
  { name: "Hazaribag", top: "40%", left: "40%" },
  { name: "Deoghar", top: "30%", left: "75%" },
  { name: "Dhanbad", top: "45%", left: "70%" },
  { name: "Netarhat", top: "65%", left: "20%" },
  { name: "Bokaro", top: "50%", left: "60%" },
];

// Predefined data for when API quota is exceeded
const getStaticLocationData = (locationName) => ({
  locationName: locationName,
  verified: true,
  immersivePreview: `Welcome to ${locationName}, a beautiful destination in Jharkhand! As you walk through the streets, you'll experience the rich cultural heritage of this region. The bustling markets are filled with local vendors selling traditional handicrafts, fresh produce, and regional specialties. The air carries the aroma of street food being prepared in small roadside stalls. Children play in the narrow lanes while elderly residents sit under the shade of trees, sharing stories of the past. The architecture reflects a blend of traditional Indian design with colonial influences, creating a unique visual landscape that tells the story of Jharkhand's diverse history.`,
  keyAttractions: [
    { name: "Local Temple", description: "A historic temple that serves as the spiritual center of the community, featuring intricate stone carvings." },
    { name: "Traditional Market", description: "A vibrant marketplace where locals sell handmade crafts, textiles, and fresh agricultural produce." },
    { name: "Heritage Building", description: "A well-preserved colonial-era building that now houses local government offices or cultural centers." }
  ],
  localVibe: `${locationName} embodies the essence of Jharkhand's culture with its warm and welcoming community. The pace of life is relaxed yet purposeful, with most activities centered around family and community gatherings. Traditional festivals are celebrated with great enthusiasm, bringing together people from all walks of life. The local dialect adds charm to everyday conversations, and hospitality towards visitors is a source of pride for the residents.`,
  streetFood: [
    { name: "Litti Chokha", description: "A traditional Jharkhand delicacy made of wheat flour balls stuffed with roasted gram flour and served with mashed vegetables." },
    { name: "Thekua", description: "A sweet snack made from wheat flour, jaggery, and coconut, often prepared during festivals and special occasions." },
    { name: "Handia", description: "A traditional fermented rice drink that's popular among locals, especially during celebrations and gatherings." }
  ]
});

// Predefined image categories with reliable search terms
const getImageCategories = (location) => [
  {
    category: "Street View",
    description: "Main street or market area",
    searchTerms: ["street", "market", "city", location.toLowerCase()],
    fallbackTerms: ["india", "street", "market", "urban"]
  },
  {
    category: "Landmark",
    description: "Famous landmark or monument",
    searchTerms: ["temple", "monument", "architecture", location.toLowerCase()],
    fallbackTerms: ["indian", "temple", "monument", "heritage"]
  },
  {
    category: "Nature",
    description: "Natural beauty or landscape",
    searchTerms: ["nature", "hills", "landscape", location.toLowerCase()],
    fallbackTerms: ["india", "nature", "hills", "forest"]
  },
  {
    category: "Culture",
    description: "Local culture or festival scene",
    searchTerms: ["festival", "culture", "people", location.toLowerCase()],
    fallbackTerms: ["indian", "culture", "festival", "traditional"]
  },
  {
    category: "Food",
    description: "Local cuisine and street food",
    searchTerms: ["food", "cuisine", "street-food", "indian"],
    fallbackTerms: ["indian", "food", "cuisine", "traditional"]
  }
];

// --- Main Component ---
const StreetPreview = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      fetchStreetPreview(selectedLocation);
    }
  }, [selectedLocation]);

  // Debounced search for location suggestions
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2 && !quotaExceeded) {
        fetchLocationSuggestions(searchQuery);
      } else if (quotaExceeded) {
        // Use static suggestions when quota exceeded
        const staticSuggestions = popularLocations
          .filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(loc => ({
            name: loc.name,
            type: "city",
            description: "Popular destination in Jharkhand"
          }));
        setSearchSuggestions(staticSuggestions);
        setShowSuggestions(staticSuggestions.length > 0);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, quotaExceeded]);

  const fetchLocationSuggestions = async (query) => {
    if (!query.trim() || quotaExceeded) return;
    
    setSearchLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a location search assistant for Jharkhand, India. 
        A user has typed: "${query}"
        
        Find and suggest real locations in Jharkhand state that match or are similar to this search query.
        Include cities, towns, villages, tourist spots, landmarks, districts, and other places of interest.
        
        Provide your response as a valid JSON array only. Do not include any text outside of the JSON array.
        The JSON should contain up to 8 location suggestions in this format:
        [
          {
            "name": "Full location name",
            "type": "city|town|village|district|landmark|tourist_spot",
            "description": "Very brief description (max 10 words)"
          }
        ]
        
        Make sure all suggested locations are actually in Jharkhand state, India.
        If no relevant locations are found, return an empty array: []
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const suggestions = JSON.parse(text);
      setSearchSuggestions(Array.isArray(suggestions) ? suggestions : []);
      setShowSuggestions(true);

    } catch (err) {
      console.error("Search API Error:", err);
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setQuotaExceeded(true);
      }
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (locationName) => {
    setSelectedLocation(locationName);
    setSearchQuery(locationName);
    setShowSuggestions(false);
    setImageLoadingStates({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedLocation(searchQuery.trim());
      setShowSuggestions(false);
      setImageLoadingStates({});
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setPreviewData(null);
    setShowSuggestions(false);
    setError("");
    setImageLoadingStates({});
  };

  const fetchStreetPreview = async (locationName) => {
    setLoading(true);
    setError("");
    setPreviewData(null);
    setActiveTab("preview");
    setImageLoadingStates({});

    // If quota exceeded, use static data
    if (quotaExceeded) {
      setTimeout(() => {
        setPreviewData(getStaticLocationData(locationName));
        setLoading(false);
      }, 1000); // Simulate loading time
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a virtual tour guide for Jharkhand, India. A user has selected the location: '${locationName}'.
        
        First, verify if this location actually exists in Jharkhand state, India. If it doesn't exist or is not in Jharkhand, respond with:
        {"error": "Location not found in Jharkhand or does not exist"}
        
        If the location exists in Jharkhand, generate a virtual "Street Preview" for this location.
        Provide your response as a valid JSON object only. Do not include any text outside of the JSON object.
        The JSON object should have the following structure:
        {
          "locationName": "${locationName}",
          "verified": true,
          "immersivePreview": "A vivid, first-person description of walking through a famous street or area in this location. Describe the sights, sounds, smells, and atmosphere to make the user feel like they are there. Make it engaging and immersive (minimum 100 words).",
          "keyAttractions": [
            {"name": "Attraction 1", "description": "A compelling description of a real must-see place in this location."},
            {"name": "Attraction 2", "description": "Another compelling description of a real attraction."},
            {"name": "Attraction 3", "description": "A third real attraction with description."}
          ],
          "localVibe": "Describe the authentic atmosphere and culture of this place. What are the people like? What is the pace of life? Is it modern, traditional, or a mix? Include local customs if relevant (minimum 50 words).",
          "streetFood": [
            {"name": "Food Item 1", "description": "A description of a real local street food or regional specialty and what makes it special."},
            {"name": "Food Item 2", "description": "Another local food item with description."},
            {"name": "Food Item 3", "description": "A third local delicacy with description."}
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const data = JSON.parse(text);
      
      if (data.error) {
        setError(`"${locationName}" was not found in Jharkhand or doesn't exist. Please try searching for another location.`);
      } else {
        setPreviewData(data);
      }

    } catch (err) {
      console.error("API Error:", err);
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setQuotaExceeded(true);
        // Fallback to static data
        setPreviewData(getStaticLocationData(locationName));
      } else {
        setError("Failed to fetch preview. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Multiple image source functions for reliability
  const getUnsplashImage = (terms, index) => {
    const query = terms.join(',');
    return `https://source.unsplash.com/featured/800x400/?${query}&${Date.now()}-${index}`;
  };

  const getPicsumImage = (index) => {
    return `https://picsum.photos/800/400?random=${index}&t=${Date.now()}`;
  };

  const getLoremFlickrImage = (terms, index) => {
    const query = terms.slice(0, 2).join(',');
    return `https://loremflickr.com/800/400/${query}?random=${index}`;
  };

  const getPlaceholderImage = (category, index) => {
    const colors = ['4f46e5', '059669', 'dc2626', 'c2410c', '7c3aed'];
    const color = colors[index % colors.length];
    return `https://via.placeholder.com/800x400/${color}/ffffff?text=${encodeURIComponent(category)}`;
  };

  // Get image with multiple fallback options
  const getImageWithFallbacks = (imageInfo, index) => {
    const { searchTerms, fallbackTerms, category } = imageInfo;
    
    // Try different sources in order
    const sources = [
      () => getUnsplashImage(searchTerms, index),
      () => getUnsplashImage(fallbackTerms, index + 10),
      () => getLoremFlickrImage(searchTerms, index),
      () => getPicsumImage(index + 100),
      () => getPlaceholderImage(category, index)
    ];

    const currentErrorCount = imageLoadingStates[index] || 0;
    
    if (currentErrorCount < sources.length) {
      return sources[currentErrorCount]();
    }
    
    return sources[sources.length - 1](); // Final fallback
  };

  const handleImageError = (index) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: (prev[index] || 0) + 1
    }));
  };

  const handleImageLoad = (index) => {
    console.log(`Image ${index} loaded successfully`);
  };
  
  const renderContent = () => {
    if (!previewData) return null;
    switch (activeTab) {
      case 'preview': 
        return (
          <div className="text-sm leading-relaxed space-y-3">
            <p>{previewData.immersivePreview}</p>
          </div>
        );
      case 'attractions': 
        return (
          <div className="space-y-4">
            {previewData.keyAttractions?.map((item, index) => (
              <div key={index} className="text-sm">
                <h4 className="text-cyan-400 font-semibold mb-1">{item.name}</h4>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        );
      case 'vibe': 
        return (
          <div className="text-sm leading-relaxed space-y-3">
            <p>{previewData.localVibe}</p>
          </div>
        );
      case 'food': 
        return (
          <div className="space-y-4">
            {previewData.streetFood?.map((item, index) => (
              <div key={index} className="text-sm">
                <h4 className="text-orange-400 font-semibold mb-1">{item.name}</h4>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
        <div className="min-h-screen bg-black/20 backdrop-blur-sm p-4 sm:p-8">
          {/* Quota Warning Banner */}
          {quotaExceeded && (
            <div className="mb-4 p-4 bg-amber-900/50 border border-amber-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
              <div className="text-sm">
                <p className="text-amber-300 font-medium">API Quota Exceeded</p>
                <p className="text-amber-200">Using offline data. For full AI features, check your Gemini API billing.</p>
              </div>
              <Clock className="text-amber-400 ml-auto" size={16} />
            </div>
          )}

          <header className="flex justify-between items-center mb-8 mt-[8vh]">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-bold">Jharkhand Street Preview</h1>
              <p className="text-gray-400">Search and explore any location in Jharkhand</p>
            </div>
            <div className="w-40"></div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Search & Interactive Map */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Search className="text-cyan-400" />
                <h2 className="text-2xl font-semibold">Search Locations</h2>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search for any place in Jharkhand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                    className="w-full p-4 pr-24 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || searchLoading}
                      className="p-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      {searchLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Search size={16} />
                      )}
                    </button>
                  </div>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(suggestion.name)}
                        className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-start gap-3"
                      >
                        <MapPin size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{suggestion.name}</div>
                          <div className="text-sm text-gray-400">
                            {suggestion.type} • {suggestion.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Access - Popular Locations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Map size={18} className="text-cyan-400" />
                  Popular Destinations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularLocations.map(loc => (
                    <button
                      key={loc.name}
                      onClick={() => handleLocationSelect(loc.name)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        selectedLocation === loc.name
                          ? 'bg-cyan-600 border-cyan-600 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-white'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Map */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-600">
                <img src={JharkhandMap} alt="Map of Jharkhand" className="w-full h-full object-contain bg-gray-800" />
                {popularLocations.map(loc => (
                  <button
                    key={loc.name}
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 group"
                    style={{ top: loc.top, left: loc.left }}
                    onClick={() => handleLocationSelect(loc.name)}
                    title={loc.name}
                  >
                    <span className={`absolute inset-0 bg-cyan-400 rounded-full transition-all ${
                      selectedLocation === loc.name ? 'ring-4 ring-white scale-125' : 'group-hover:scale-110'
                    }`}></span>
                    <span className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse"></span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Right Side: AI Generated Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              {loading ? (
                <div className="p-6 h-full flex flex-col">
                  <div className="w-3/4 h-8 bg-gray-700/50 rounded-lg mb-6 animate-pulse"></div>
                  <div className="w-full h-48 bg-gray-700/50 rounded-lg mb-6 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="w-full h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="w-1/2 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <Search className="w-16 h-16 text-red-400 mb-4" />
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Location Not Found</h3>
                  <p className="text-gray-300 mb-4 max-w-sm">{error}</p>
                  <button
                    onClick={clearSearch}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Try Another Search
                  </button>
                </div>
              ) : selectedLocation && previewData ? (
                <div className="flex flex-col h-full">
                  <div className="p-6 pb-4">
                    <h3 className="text-3xl font-bold mb-1">{previewData.locationName}</h3>
                    <p className="text-cyan-400 text-sm">Jharkhand, India</p>
                    {quotaExceeded && (
                      <p className="text-amber-400 text-xs mt-1">Using offline preview data</p>
                    )}
                  </div>
                  
                  {/* Image Gallery with Multiple Fallbacks */}
                  <div className="relative">
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      spaceBetween={0}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      className="w-full h-56"
                    >
                      {getImageCategories(selectedLocation).map((imageInfo, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative w-full h-full bg-gray-800">
                            <img 
                              src={getImageWithFallbacks(imageInfo, index)}
                              alt={`${selectedLocation} - ${imageInfo.category}`} 
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(index)}
                              onLoad={() => handleImageLoad(index)}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="text-white">
                                <div className="flex items-center gap-2 mb-2">
                                  <ImageIcon size={18} className="text-cyan-400" />
                                  <span className="text-lg font-bold">{imageInfo.category}</span>
                                </div>
                                <p className="text-sm text-gray-200">{imageInfo.description}</p>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex border-b border-white/20 mb-6 overflow-x-auto">
                      {[
                        { id: 'preview', icon: Eye, label: 'Street View' },
                        { id: 'attractions', icon: Landmark, label: 'Attractions' },
                        { id: 'vibe', icon: Users, label: 'Local Vibe' },
                        { id: 'food', icon: Utensils, label: 'Food' },
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id 
                              ? 'border-b-2 border-cyan-400 text-white' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <tab.icon size={16} /> {tab.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-gray-300 leading-relaxed overflow-y-auto flex-grow max-h-72 pr-2 custom-scrollbar">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <Search className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Discover Jharkhand</h3>
                  <p className="text-gray-400 mb-4 max-w-sm">Search for any location in Jharkhand to begin your virtual exploration</p>
                  <div className="text-sm text-gray-500">
                    Try searching for: cities, towns, tourist spots, landmarks, or districts
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Styles - Moved outside component to avoid JSX warning */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(34, 211, 238, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 211, 238, 0.7);
          }
          
          /* Enhanced Swiper Styling */
          .swiper-button-next,
          .swiper-button-prev {
            color: rgba(34, 211, 238, 0.9) !important;
            background: rgba(0, 0, 0, 0.7) !important;
            backdrop-filter: blur(10px);
            border-radius: 50% !important;
            width: 44px !important;
            height: 44px !important;
            margin-top: -22px !important;
            transition: all 0.3s ease !important;
          }
          
          .swiper-button-next:hover,
          .swiper-button-prev:hover {
            background: rgba(0, 0, 0, 0.8) !important;
            transform: scale(1.1) !important;
          }
          
          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 18px !important;
            font-weight: bold !important;
          }
          
          .swiper-pagination {
            bottom: 15px !important;
          }
          
          .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.4) !important;
            opacity: 1 !important;
            width: 12px !important;
            height: 12px !important;
            margin: 0 6px !important;
            transition: all 0.3s ease !important;
          }
          
          .swiper-pagination-bullet-active {
            background: rgba(34, 211, 238, 1) !important;
            transform: scale(1.2) !important;
          }

          /* Image Loading States */
          img[src*="placeholder"] {
            filter: blur(2px);
            opacity: 0.7;
          }
          
          /* Better mobile responsiveness */
          @media (max-width: 768px) {
            .swiper-button-next,
            .swiper-button-prev {
              width: 36px !important;
              height: 36px !important;
              margin-top: -18px !important;
            }
            
            .swiper-button-next:after,
            .swiper-button-prev:after {
              font-size: 14px !important;
            }
          }
        `
      }} />
    </>
  );
};

export default StreetPreview;