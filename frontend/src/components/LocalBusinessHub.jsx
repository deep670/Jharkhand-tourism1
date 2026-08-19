import React, { useState, useEffect, useRef } from "react";
import {
  Store,
  MapPin,
  Phone,
  Star,
  Users,
  ShoppingBag,
  Car,
  Utensils,
  Coffee,
  Gift,
  Shield,
  TrendingUp,
  DollarSign,
  Heart,
  Bot,
  User,
  Send,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Gemini AI Setup ---
// Load the API key securely from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI, model;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
}
// -----------------------

const JharkhandBusinessHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const aiChatEndRef = useRef(null);

  const localBusinesses = [
    {
      id: "1",
      name: "Jharkhand Tribal Arts",
      category: "handicraft",
      description:
        "Authentic tribal crafts. Famous for Dhokra metalwork, Sohrai paintings, and bamboo products.",
      rating: 4.8,
      reviewCount: 189,
      distance: 0.4,
      isVerified: true,
      isGovernmentRegistered: true,
      priceRange: "$$",
      openingHours: "10:00 AM - 8:30 PM",
      contactNumber: "+91 91234 56780",
      specialOffers: ["Tribal Art Workshop", "Free Sohrai Painting Demo"],
      sustainabilityScore: 93,
      localImpactScore: 91,
      imageUrl: "../src/assets/Jharkhand.png",
      languages: ["English", "Hindi", "Santhali"],
      touristFriendly: true,
    },
    {
      id: "2",
      name: "Jharkhandi Zaika",
      category: "restaurant",
      description:
        "Family-run restaurant serving authentic Jharkhandi cuisine. Specializing in Dhuska, Rugra, and Litti Chokha.",
      rating: 4.7,
      reviewCount: 452,
      distance: 0.6,
      isVerified: true,
      isGovernmentRegistered: true,
      priceRange: "$$",
      openingHours: "11:30 AM - 10:30 PM",
      contactNumber: "+91 91234 56781",
      specialOffers: ["Jharkhandi Thali Special", "Dhuska Tasting Platter"],
      sustainabilityScore: 86,
      localImpactScore: 95,
      imageUrl: "/business/restaurant.jpg",
      languages: ["English", "Hindi"],
      touristFriendly: true,
    },
    {
      id: "3",
      name: "Chotanagpur Nature Tours",
      category: "guide",
      description:
        "Licensed guide with expertise in Jharkhand's waterfalls, forests, and tribal heritage.",
      rating: 4.9,
      reviewCount: 298,
      distance: 0.2,
      isVerified: true,
      isGovernmentRegistered: true,
      priceRange: "$$$",
      openingHours: "7:00 AM - 7:00 PM",
      contactNumber: "+91 91234 56782",
      specialOffers: [
        "Waterfall Trekking Packages",
        "Tribal Village Tours",
        "Photography Trips",
      ],
      sustainabilityScore: 82,
      localImpactScore: 97,
      imageUrl: "/business/guide.jpg",
      languages: ["English", "Hindi", "French"],
      touristFriendly: true,
    },
    {
      id: "4",
      name: "Ranchi City Auto",
      category: "transport",
      description:
        "Reliable auto-rickshaw service for exploring Ranchi and its surroundings. Tourist-friendly rates.",
      rating: 4.5,
      reviewCount: 155,
      distance: 0.1,
      isVerified: true,
      isGovernmentRegistered: false,
      priceRange: "$",
      openingHours: "24/7 Available",
      contactNumber: "+91 91234 56783",
      specialOffers: ["Full-Day Ranchi Tour", "Airport Pickup/Drop"],
      sustainabilityScore: 75,
      localImpactScore: 85,
      imageUrl: "/business/transport.jpg",
      languages: ["Hindi"],
      touristFriendly: true,
    },
  ];

  const categories = [
    { id: "all", label: "All Categories", icon: Store },
    { id: "restaurant", label: "Restaurants", icon: Utensils },
    { id: "handicraft", label: "Handicrafts", icon: Gift },
    { id: "guide", label: "Tour Guides", icon: Users },
    { id: "transport", label: "Transport", icon: Car },
    { id: "accommodation", label: "Stay", icon: Coffee },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
  ];

  useEffect(() => {
    if (aiMessages.length === 0) {
      const welcomeMessage = apiKey
        ? "Johar! I can help you discover local businesses, provide recommendations, and share insights about tourism in Jharkhand."
        : "Welcome! To use the AI assistant, please add your Gemini API key to your .env.local file as VITE_GEMINI_API_KEY and restart the server.";

      setAiMessages([{ type: "ai", content: welcomeMessage }]);
    }
  }, []);

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "restaurant":
        return Utensils;
      case "handicraft":
        return Gift;
      case "guide":
        return Users;
      case "transport":
        return Car;
      case "accommodation":
        return Coffee;
      case "shopping":
        return ShoppingBag;
      default:
        return Store;
    }
  };

  const getPriceRangeLabel = (range) => {
    switch (range) {
      case "$":
        return "Budget-friendly";
      case "$$":
        return "Moderate";
      case "$$$":
        return "Premium";
      default:
        return "Unknown";
    }
  };

  const filteredBusinesses = localBusinesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || business.category === selectedCategory;
    const matchesVerified = !showOnlyVerified || business.isVerified;

    return matchesSearch && matchesCategory && matchesVerified;
  });

  const handleAiQuery = async (query) => {
    if (!apiKey || !model) {
      setAiMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "The Gemini API key is missing. Please add it to your .env.local file to use the AI assistant.",
        },
      ]);
      return;
    }

    setIsAiLoading(true);
    setAiMessages((prev) => [...prev, { type: "user", content: query }]);

    try {
      // The updated prompt with the instruction to remove markdown is below
      const prompt = `You are an AI assistant for a local business hub focused on tourism in Jharkhand, India. The hub features businesses like restaurants, handicraft shops, tour guides, and transport services in cities like Ranchi, Jamshedpur, etc.

      User query: "${query}"
      
      Provide helpful recommendations, insights, or information about local businesses in Jharkhand. Focus on promoting the local economy, sustainability, and authentic tribal and cultural experiences. Keep responses conversational and helpful. Do not refer to a specific list of businesses, but answer based on general knowledge of Jharkhand tourism.
      
      IMPORTANT INSTRUCTION: Do not use any markdown formatting. This means no asterisks for bolding, no bullet points, and no numbered lists. The entire response must be plain text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setAiMessages((prev) => [...prev, { type: "ai", content: text }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "Sorry, there was an error processing your request. Please check your API key and try again.",
        },
      ]);
    }

    setIsAiLoading(false);
  };
  const sendAiMessage = () => {
    if (aiInput.trim()) {
      handleAiQuery(aiInput);
      setAiInput("");
    }
  };

  const sendPredefinedQuery = (query) => {
    setAiInput(query);
    handleAiQuery(query);
    setAiInput("");
  };

  const BusinessCard = ({ business }) => {
    const CategoryIcon = getCategoryIcon(business.category);

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {business.name}
                </h3>
                {business.isVerified && (
                  <Shield className="w-4 h-4 text-green-500" title="Verified" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {business.rating} ({business.reviewCount})
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {business.distance} km
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {getPriceRangeLabel(business.priceRange)}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">
              {business.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {business.specialOffers.slice(0, 2).map((offer, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {offer}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs">
                <div
                  className="flex items-center gap-1"
                  title="Local Impact Score"
                >
                  <Heart className="w-3 h-3 text-green-500" />
                  <span>Impact: {business.localImpactScore}%</span>
                </div>
                <div
                  className="flex items-center gap-1"
                  title="Sustainability Score"
                >
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span>Sustainability: {business.sustainabilityScore}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${business.contactNumber}`}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Contact
                </a>
                <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs hover:shadow-md">
                  Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 pt-[10vh]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Jharkhand Local Business Hub
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Supporting Jharkhand's economy through verified tourism
                partnerships
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Government Verified
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for Dhokra art, local food, or tour guides..."
            className="w-full px-6 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
          />

          <div className="flex flex-wrap gap-3 mb-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowOnlyVerified(!showOnlyVerified)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                showOnlyVerified
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Shield className="w-4 h-4" />
              Verified Only
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
          <div className="flex bg-gray-50 p-2 gap-2">
            {[
              { id: "browse", label: "Browse Businesses", icon: Store },
              { id: "impact", label: "Local Impact", icon: TrendingUp },
              { id: "sustainability", label: "Sustainability", icon: Heart },
              { id: "ai-insights", label: "AI Insights", icon: Bot },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "browse" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
                {filteredBusinesses.length === 0 && (
                  <div className="col-span-1 lg:col-span-2 text-center py-12 text-gray-500">
                    <p>No businesses match your criteria.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "impact" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                    <DollarSign className="w-8 h-8 mb-4" />
                    <div className="text-3xl font-bold">₹1.8M</div>
                    <div className="text-blue-100">
                      Monthly revenue to local artisans
                    </div>
                    <div className="text-xl font-semibold mt-2">650+</div>
                    <div className="text-blue-100">Local jobs supported</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500 to-sky-600 text-white p-6 rounded-xl">
                    <Users className="w-8 h-8 mb-4" />
                    <div className="text-3xl font-bold">120</div>
                    <div className="text-cyan-100">
                      Verified local businesses
                    </div>
                    <div className="text-xl font-semibold mt-2">96%</div>
                    <div className="text-cyan-100">
                      Tourist satisfaction rate
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 rounded-xl">
                    <Gift className="w-8 h-8 mb-4" />
                    <div className="text-3xl font-bold">30+</div>
                    <div className="text-violet-100">Tribal craft families</div>
                    <div className="text-xl font-semibold mt-2">15</div>
                    <div className="text-violet-100">
                      Heritage skills preserved
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Business Growth Metrics in Jharkhand
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600">
                        +18%
                      </div>
                      <div className="text-green-700 mt-1">
                        Average revenue increase
                      </div>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">
                        +55%
                      </div>
                      <div className="text-blue-700 mt-1">Tourist footfall</div>
                    </div>
                    <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="text-3xl font-bold text-yellow-600">
                        92%
                      </div>
                      <div className="text-yellow-700 mt-1">
                        Business retention rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sustainability" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-500" />
                    Sustainability Initiatives in Jharkhand
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">
                        Eco-Tourism Development
                      </h4>
                      <p className="text-green-600 text-sm">
                        Promoting tourism around national parks and waterfalls
                        with minimal environmental impact.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">
                        Dhokra & Sohrai Art Preservation
                      </h4>
                      <p className="text-blue-600 text-sm">
                        Supporting tribal artisans to maintain and promote
                        ancient crafting techniques.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-700 mb-2">
                        Use of Natural Materials
                      </h4>
                      <p className="text-yellow-600 text-sm">
                        Encouraging handicrafts made from sustainable local
                        materials like bamboo and clay.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Top Sustainable Businesses
                  </h3>
                  <div className="space-y-4">
                    {localBusinesses
                      .sort(
                        (a, b) => b.sustainabilityScore - a.sustainabilityScore
                      )
                      .slice(0, 3)
                      .map((business, index) => (
                        <div
                          key={business.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : "bg-amber-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {business.name}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {business.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {business.sustainabilityScore}%
                            </p>
                            <p className="text-xs text-gray-500">
                              Sustainability Score
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai-insights" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-500" />
                    AI Jharkhand Insights
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-3">
                    {aiMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-4xl ${
                            message.type === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === "user"
                                ? "bg-blue-500"
                                : "bg-gray-600"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div
                            className={`px-4 py-3 rounded-xl ${
                              message.type === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-white border border-gray-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={aiChatEndRef} />
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendAiMessage()}
                      placeholder="Ask about local food, waterfalls, or crafts..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      disabled={!apiKey}
                    />
                    <button
                      onClick={sendAiMessage}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      disabled={!apiKey || isAiLoading}
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      "Best places for Jharkhandi food",
                      "Where to buy Dhokra art",
                      "Famous waterfalls near Ranchi",
                      "Tribal cultural experiences",
                    ].map((query) => (
                      <button
                        key={query}
                        onClick={() => sendPredefinedQuery(query)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                        disabled={!apiKey}
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JharkhandBusinessHub;
