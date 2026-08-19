import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Sparkles,
  Plane,
  CircleHelp,
  Hourglass,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Heart,
  ArrowLeft,
  Send,
  FileDown,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ItineraryPlanner = () => {
  // State for form inputs
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [members, setMembers] = useState("");
  const [interests, setInterests] = useState([]);

  // State for API response and loading status
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  // State for copy button feedback
  const [copySuccess, setCopySuccess] = useState("");

  // Ref to target the content for PDF export and copy
  const itineraryRef = useRef(null);

  const interestOptions = [
    {
      name: "History & Culture",
      // icon: "🏛️",
      color: "from-amber-400 to-orange-500",
    },
    { name: "Geo-Tourism",
      //  icon: "🗻", 
       color: "from-green-400 to-emerald-500" },
    {
      name: "Wildlife & Parks",
      // icon: "🦁",
      color: "from-green-500 to-teal-500",
    },
    {
      name: "Adventure & Outdoors",
      // icon: "🏔️",
      color: "from-blue-400 to-cyan-500",
    },
    { name: "Relaxation", 
      // icon: "🧘", 
      color: "from-purple-400 to-pink-500" },
  ];

  const handleInterestChange = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const generateItinerary = async (e) => {
    e.preventDefault();
    if (!destination || !days || !budget || !members) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    setItinerary("");

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are an expert travel planner. Create a detailed and engaging travel itinerary based on the following user preferences.
        The output must be in well-structured Markdown format.

        **Travel Details:**
        - **Destination:** ${destination}
        - **Duration:** ${days} days
        - **Budget (per person, excluding flights):** Approximately ${budget} Rs.
        - **Number of Travelers:** ${members}
        - **Primary Interests:** ${interests.join(", ")}

        **Instructions for Your Response:**
        1.  **Overview:** Start with a brief, exciting summary of the trip.
        2.  **Day-by-Day Plan:** For each day, provide a clear heading (e.g., "Day 1: Arrival and Exploration").
        3.  **Activities:** Suggest 2-3 specific activities or sights for each day.
        4.  **Food Recommendations:** Suggest local cuisine or a restaurant for each day.
        5.  **Budget Tips:** Weave in practical budget-friendly tips.
        6.  **Formatting:** Use Markdown extensively (bolding, bullet points, etc.).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setItinerary(text);
    } catch (err) {
      console.error("API Error:", err);
      setError(
        "Failed to generate itinerary. Please check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced PDF export function that handles multiple pages
  const handleExportPDF = async () => {
    const input = itineraryRef.current;
    if (!input) return;

    setExportLoading(true);

    try {
      // Create a temporary container with proper styling for PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333333';
      
      // Clone the content
      tempDiv.innerHTML = input.innerHTML;
      
      // Apply specific styles for PDF
      const elements = tempDiv.querySelectorAll('*');
      elements.forEach(el => {
        // Remove scrollbar styles
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
        
        // Ensure text is dark for PDF
        if (el.style.color === 'rgb(148, 163, 184)' || el.classList.contains('text-slate-400')) {
          el.style.color = '#666666';
        }
        if (el.style.color === 'rgb(100, 116, 139)' || el.classList.contains('text-slate-500')) {
          el.style.color = '#555555';
        }
        if (el.style.color === 'rgb(71, 85, 105)' || el.classList.contains('text-slate-600')) {
          el.style.color = '#444444';
        }
      });

      document.body.appendChild(tempDiv);

      // Generate canvas with better quality settings
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      
      // Calculate image dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / (pdfHeight - margin * 2));
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yOffset = -(page * (pdfHeight - margin * 2));
        
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + yOffset,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      // Save the PDF
      pdf.save(`itinerary-${destination.replace(/\s+/g, '-').toLowerCase() || 'your-trip'}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Function to handle copying text to clipboard
  const handleCopyText = () => {
    if (!itinerary) return;
    navigator.clipboard
      .writeText(itinerary)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setCopySuccess("Failed!");
        setTimeout(() => setCopySuccess(""), 2000);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="relative z-30 min-h-screen">
        <div className="absolute left-8 top-[10vh] z-50">
          <Link
            to="/dashboard"
            className="group inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full font-medium transition-all duration-300 border border-slate-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Link>
        </div>

        <div className="p-8 pt-28 md:pt-20 min-h-screen">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-900 via-slate-700 to-blue-500 bg-clip-text text-transparent mb-4">
  AI Itinerary Planner
</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transform your travel dreams into perfectly crafted itineraries
              with the power of AI
            </p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Section */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-all duration-500">
                <form onSubmit={generateItinerary} className="space-y-8">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      Where to?
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ranchi, Jamshedpur, Bokaro ..."
                      required
                      className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        placeholder="7"
                        required
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                        Budget (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="50000"
                        required
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        Travelers
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={members}
                        onChange={(e) => setMembers(e.target.value)}
                        placeholder="2"
                        required
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-4">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      What interests you?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {interestOptions.map((interest) => (
                        <button
                          type="button"
                          key={interest.name}
                          onClick={() => handleInterestChange(interest.name)}
                          className={`group p-4 rounded-xl transition-all duration-300 border transform hover:scale-105 ${
                            interests.includes(interest.name)
                              ? `bg-gradient-to-r ${interest.color} border-transparent text-white shadow-lg`
                              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                              {interest.icon}
                            </span>
                            <span className="font-medium text-sm">
                              {interest.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {loading ? (
                        <Hourglass className="animate-spin w-5 h-5" />
                      ) : (
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      )}
                      <span className="text-lg">
                        {loading
                          ? "Crafting your journey..."
                          : "Generate Itinerary"}
                      </span>
                    </div>
                  </button>

                  {error && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-center font-medium">
                        {error}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  Your Journey Awaits
                </h2>
                {itinerary && !loading && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyText}
                      disabled={copySuccess === "Copied!"}
                      className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-75"
                      title="Copy as text"
                    >
                      <Copy className="w-4 h-4 mr-1.5" />
                      {copySuccess ? copySuccess : "Copy"}
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exportLoading}
                      className="flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                      title="Export as PDF"
                    >
                      {exportLoading ? (
                        <Hourglass className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <FileDown className="w-4 h-4 mr-1.5" />
                      )}
                      {exportLoading ? "Exporting..." : "Export"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto" style={{ height: '570px' }}>
                {loading && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
                    <Plane className="w-16 h-16 text-blue-500 animate-bounce" />
                    <div className="text-center space-y-2">
                      <p className="text-xl font-semibold text-slate-700">
                        Planning your adventure
                      </p>
                      <p className="text-slate-500">
                        This might take a moment...
                      </p>
                    </div>
                  </div>
                )}
                
                {!loading && !itinerary && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-6">
                    <CircleHelp className="w-16 h-16 text-slate-400" />
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-slate-700">
                        Ready to explore?
                      </p>
                      <p className="text-slate-500 max-w-md">
                        Fill in your travel details and let AI create the
                        perfect itinerary for you.
                      </p>
                    </div>
                  </div>
                )}
                
                {itinerary && (
                  <div className="p-6">
                    <div 
                      ref={itineraryRef} 
                      className="prose-container bg-white"
                      style={{
                        maxWidth: 'none',
                        width: '100%'
                      }}
                    >
                      <style jsx>{`
                        .prose-container h1 {
                          font-size: 1.5rem;
                          font-weight: bold;
                          color: #1e293b;
                          margin-bottom: 1rem;
                          border-bottom: 2px solid #e2e8f0;
                          padding-bottom: 0.5rem;
                        }
                        .prose-container h2 {
                          font-size: 1.25rem;
                          font-weight: 600;
                          color: #334155;
                          margin-bottom: 0.75rem;
                          margin-top: 1.5rem;
                          border-left: 4px solid #3b82f6;
                          padding-left: 1rem;
                        }
                        .prose-container h3 {
                          font-size: 1.125rem;
                          font-weight: 500;
                          color: #475569;
                          margin-bottom: 0.5rem;
                          margin-top: 1rem;
                        }
                        .prose-container p {
                          color: #475569;
                          margin-bottom: 1rem;
                          line-height: 1.75;
                        }
                        .prose-container ul {
                          margin-bottom: 1rem;
                          margin-left: 1rem;
                        }
                        .prose-container li {
                          color: #475569;
                          margin-bottom: 0.5rem;
                          list-style-type: disc;
                        }
                        .prose-container strong {
                          font-weight: 600;
                          color: #2563eb;
                        }
                        .prose-container blockquote {
                          border-left: 4px solid #cbd5e1;
                          padding-left: 1rem;
                          font-style: italic;
                          color: #64748b;
                          background-color: #f8fafc;
                          border-radius: 0 0.5rem 0.5rem 0;
                          padding: 0.75rem 1rem;
                          margin: 1rem 0;
                        }
                        .prose-container code {
                          background-color: #f1f5f9;
                          color: #1e40af;
                          padding: 0.25rem 0.5rem;
                          border-radius: 0.25rem;
                          font-size: 0.875rem;
                          font-family: monospace;
                        }
                      `}</style>
                      
                      <div className="prose max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold text-slate-700 mb-3 mt-6 border-l-4 border-blue-500 pl-4">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-medium text-slate-600 mb-2 mt-4">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-slate-600 mb-4 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-2 mb-4 ml-4 list-disc marker:text-blue-500">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="text-slate-600">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-blue-600">
                                {children}
                              </strong>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500 bg-slate-100 rounded-r-lg p-3 my-4">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {itinerary}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;
