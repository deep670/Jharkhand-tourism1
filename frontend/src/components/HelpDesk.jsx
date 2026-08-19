import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  Heart,
  Navigation,
  Globe,
  User,
  Send,
  Bot,
  Loader2,
  CheckCircle,
  Menu,
  X,
  Home,
  FileText,
  HelpCircle,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI Service (Updated with Official SDK)
// Gemini AI Service (Updated to control output formatting)
class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
    }
    const genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
  }

  async generateResponse(prompt, context = "") {
    try {
      // New instruction added here to prevent markdown formatting
      const fullPrompt = `Context: You are an emergency assistant for Jharkhand state, India. ${context}\n\nUser query: ${prompt}\n\nProvide helpful, accurate emergency assistance specific to Jharkhand. 
      IMPORTANT INSTRUCTION: Do not use any markdown formatting. This means no asterisks for bolding, no bullet points, and no numbered lists. The entire response must be plain text.`;
      
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      return text || "Sorry, I could not process your request.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I apologize, but I am temporarily unable to assist you. Please contact emergency services directly if this is urgent.";
    }
  }

  async analyzeEmergency(description, location) {
    // Updated context to request a specific plain-text structure
    const context = `Analyze this emergency in Jharkhand. Structure your response under the following plain text headings, without using any markdown formatting (like asterisks or lists):
    - Severity Level:
    - Immediate Actions:
    - Emergency Service to Contact:
    - Safety Precautions:`;

    return await this.generateResponse(
      `Emergency: ${description}. Location: ${location}`,
      context
    );
  }
}

const JharkhandEmergencyHelpdesk = () => {
  // State management
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Namaste! I'm your Jharkhand emergency assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const geminiService = useRef(new GeminiService());
  const chatEndRef = useRef(null);

  // Jharkhand-specific emergency contacts
  const jharkhandEmergencyContacts = [
    {
      id: "1",
      name: "Jharkhand Police",
      number: "100",
      description: "State police emergency services",
      icon: Shield,
      color: "bg-blue-500",
      available24x7: true,
    },
    {
      id: "2",
      name: "Medical Emergency",
      number: "102",
      description: "Ambulance and medical services",
      icon: Heart,
      color: "bg-red-500",
      available24x7: true,
    },
    {
      id: "3",
      name: "Fire Emergency",
      number: "101",
      description: "Fire department services",
      icon: AlertTriangle,
      color: "bg-orange-500",
      available24x7: true,
    },
    {
      id: "4",
      name: "Jharkhand Helpline",
      number: "181",
      description: "Women helpline and general assistance",
      icon: User,
      color: "bg-purple-500",
      available24x7: true,
    },
    {
      id: "5",
      name: "Tourist Helpline",
      number: "1363",
      description: "Tourism department assistance",
      icon: Globe,
      color: "bg-green-500",
      available24x7: false,
    },
    {
      id: "6",
      name: "Disaster Management",
      number: "1070",
      description: "Natural disaster and emergency response",
      icon: Navigation,
      color: "bg-yellow-500",
      available24x7: true,
    },
  ];

  const languages = ["English", "Hindi", "Bengali"];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location access denied")
      );
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Functions
  const makeEmergencyCall = (number) => {
    window.open(`tel:${number}`, "_self");
  };

  const shareLocation = () => {
    if (userLocation) {
      // Corrected Google Maps URL
      const locationUrl = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
      if (navigator.share) {
        navigator
          .share({
            title: "My Location in Jharkhand",
            text: "Sharing my current location for emergency assistance",
            url: locationUrl,
          })
          .catch(() => {
            navigator.clipboard.writeText(locationUrl);
            alert("Location link copied to clipboard!");
          });
      } else {
        navigator.clipboard.writeText(locationUrl);
        alert("Location link copied to clipboard!");
      }
    } else {
        alert("Could not get your location. Please enable location services.");
    }
  };

  const sendSOS = async () => {
    if (!description) {
      alert("Please describe your emergency");
      return;
    }

    setIsLoading(true);

    try {
      const analysis = await geminiService.current.analyzeEmergency(
        description,
        userLocation
          ? `${userLocation.lat}, ${userLocation.lng}`
          : "Jharkhand, India"
      );

      const newReport = {
        id: Date.now().toString(),
        type: emergencyType || "General Emergency",
        status: "pending",
        timestamp: new Date().toISOString(),
        location: userLocation
          ? `${userLocation.lat}, ${userLocation.lng}`
          : "Jharkhand",
        description: description,
        analysis: analysis,
      };

      setReports((prev) => [newReport, ...prev]);
      setDescription("");
      setEmergencyType("");

      alert("SOS sent successfully! AI analysis has been added to your report.");
    } catch (error) {
      console.error("SOS Error:", error);
      alert("Failed to send SOS. Please call emergency services directly.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      message: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const context = `You are helping someone in Jharkhand state. Provide location-specific advice for cities like Ranchi, Jamshedpur, Dhanbad, Bokaro, etc.`;
      const response = await geminiService.current.generateResponse(
        currentMessage,
        context
      );

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          message: response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          message:
            "Sorry, I'm having trouble responding. For emergencies, please call 100.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation
  const NavButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
        activeTab === id
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-[8vh]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
             <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Jharkhand Emergency
              </h1>
              <p className="text-sm text-gray-600">राज्य आपातकालीन सहायता</p>
            </div>
             <div className="lg:hidden w-8"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              isMobileMenuOpen ? "block" : "hidden"
            } lg:block w-full lg:w-64 bg-white rounded-lg shadow-sm p-4 h-fit lg:sticky lg:top-24`}
          >
            <nav className="space-y-2">
              <NavButton id="home" label="Home" icon={Home} />
              <NavButton
                id="contacts"
                label="Emergency Contacts"
                icon={Phone}
              />
              <NavButton id="report" label="Report Emergency" icon={FileText} />
              <NavButton id="chat" label="AI Assistant" icon={Bot} />
              <NavButton id="help" label="Get Help" icon={HelpCircle} />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Quick Emergency Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Quick Emergency Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => makeEmergencyCall("100")}
                      className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-lg flex flex-col items-center gap-2 transition-colors"
                    >
                      <Phone className="w-8 h-8" />
                      <span className="font-semibold">Emergency Call</span>
                      <span className="text-sm opacity-90">Dial 100</span>
                    </button>

                    <button
                      onClick={shareLocation}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg flex flex-col items-center gap-2 transition-colors"
                    >
                      <Navigation className="w-8 h-8" />
                      <span className="font-semibold">Share Location</span>
                      <span className="text-sm opacity-90">
                        GPS Coordinates
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("chat")}
                      className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg flex flex-col items-center gap-2 transition-colors"
                    >
                      <Bot className="w-8 h-8" />
                      <span className="font-semibold">AI Assistant</span>
                      <span className="text-sm opacity-90">Get Help</span>
                    </button>
                  </div>
                </div>

                {/* Location Display */}
                {userLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Your Approximate Location</span>
                    </div>
                    <p className="text-blue-600 mt-1">
                      {userLocation.lat.toFixed(4)},{" "}
                      {userLocation.lng.toFixed(4)}
                    </p>
                    <p className="text-blue-500 text-sm">
                      For accurate reporting, please describe your location clearly.
                    </p>
                  </div>
                )}

                {/* Recent Reports */}
                {reports.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Emergency Reports
                    </h3>
                    <div className="space-y-3">
                      {reports.slice(0, 3).map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(report.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm capitalize">
                            {report.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Jharkhand Emergency Contacts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jharkhandEmergencyContacts.map((contact) => {
                    const IconComponent = contact.icon;
                    return (
                      <div
                        key={contact.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`${contact.color} p-3 rounded-lg text-white`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {contact.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {contact.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600">
                                {contact.number}
                              </span>
                              {contact.available24x7 ? (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                  24/7
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  Timed
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => makeEmergencyCall(contact.number)}
                              className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                            >
                              Call Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "report" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Report Emergency
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Type
                    </label>
                    <select
                      id="emergencyType"
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select emergency type</option>
                      <option value="Medical Emergency">
                        Medical Emergency
                      </option>
                      <option value="Accident">Accident</option>
                      <option value="Crime/Theft">Crime/Theft</option>
                      <option value="Fire">Fire</option>
                      <option value="Natural Disaster">Natural Disaster</option>
                      <option value="Missing Person">Missing Person</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the Emergency
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide details about the emergency situation..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={sendSOS}
                    disabled={isLoading || !description}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending SOS...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        Send SOS Alert
                      </>
                    )}
                  </button>
                </div>

                {/* Display reports */}
                {reports.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Your Reports
                    </h3>
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {report.type}
                            </h4>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm capitalize">
                              {report.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {report.description}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                          {report.analysis && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h5 className="font-medium text-blue-800 text-sm mb-1">
                                AI Analysis:
                              </h5>
                              <p className="text-blue-700 text-sm whitespace-pre-wrap">
                                {report.analysis}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900">
                        AI Emergency Assistant
                    </h2>
                    <div className="ml-auto flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">Online</span>
                    </div>
                    </div>
                </div>

                <div className="bg-gray-50 h-96 overflow-y-auto p-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                          msg.type === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-white border text-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            msg.type === "user"
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white border text-gray-800 px-4 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Ask about emergency services in Jharkhand..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Emergency Guidelines for Jharkhand
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-500 pl-4">
                        <h3 className="font-semibold text-red-700">
                          Medical Emergency
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Call 102 immediately. Major hospitals: RIMS Ranchi,
                          Tata Main Hospital Jamshedpur.
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-blue-700">
                          Police Emergency
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Dial 100 for police help. Available in all major towns and highways.
                        </p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h3 className="font-semibold text-orange-700">
                          Natural Disasters
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Jharkhand can face issues like lightning strikes and heatwaves. Call 1070 for disaster management.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-semibold text-green-700">
                          Tourist Help
                        </h3>
                        <p className="text-gray-600 text-sm">
                          For any travel-related emergencies or assistance, dial the Tourist Helpline 1363.
                        </p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="font-semibold text-purple-700">
                          Women Safety
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Dial 181 for the dedicated women's helpline services across Jharkhand.
                        </p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h3 className="font-semibold text-yellow-700">
                          Important Cities
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Emergency services are strongest in Ranchi (Capital), Jamshedpur, Dhanbad, and Bokaro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Quick Safety Tips for Jharkhand
                  </h3>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>Always carry a valid ID and emergency contact numbers.</li>
                    <li>Be cautious during the monsoon season (June-September) due to heavy rains.</li>
                    <li>Keep your phone charged and carry a power bank.</li>
                    <li>Knowing basic Hindi phrases can be helpful for communication.</li>
                    <li>Stay updated with local news and weather alerts during your travel.</li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Emergency Button */}
      <button
        onClick={() => makeEmergencyCall("100")}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
        title="Emergency Call"
      >
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
};

export default JharkhandEmergencyHelpdesk;