import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plane,
  Train,
  Car,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";

// --- CONFIG & CONSTANTS ---
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const AIRPORT_CODES = {
  "NEW YORK": "JFK",
  NYC: "JFK",
  MANHATTAN: "LGA",
  "LOS ANGELES": "LAX",
  LA: "LAX",
  HOLLYWOOD: "LAX",
  CHICAGO: "ORD",
  MIAMI: "MIA",
  BOSTON: "BOS",
  "SAN FRANCISCO": "SFO",
  SF: "SFO",
  SEATTLE: "SEA",
  "LAS VEGAS": "LAS",
  VEGAS: "LAS",
  ATLANTA: "ATL",
  DENVER: "DEN",
  PHOENIX: "PHX",
  DETROIT: "DTW",
  WASHINGTON: "DCA",
  DC: "DCA",
  LONDON: "LHR",
  PARIS: "CDG",
  TOKYO: "NRT",
  DUBAI: "DXB",
  SINGAPORE: "SIN",
  "HONG KONG": "HKG",
  AMSTERDAM: "AMS",
  FRANKFURT: "FRA",
  ROME: "FCO",
  MADRID: "MAD",
  BARCELONA: "BCN",
  BERLIN: "BER",
  ZURICH: "ZUR",
  VIENNA: "VIE",
  ISTANBUL: "IST",
  MUMBAI: "BOM",
  DELHI: "DEL",
  "NEW DELHI": "DEL",
  BANGALORE: "BLR",
  BENGALURU: "BLR",
  CHENNAI: "MAA",
  KOLKATA: "CCU",
  CALCUTTA: "CCU",
  HYDERABAD: "HYD",
  PUNE: "PNQ",
  AHMEDABAD: "AMD",
  GOA: "GOI",
  KOCHI: "COK",
  COCHIN: "COK",
  THIRUVANANTHAPURAM: "TRV",
  TEST: "JFK",
  DEMO: "LAX",
};

const VALID_IATA_CODES = new Set([
  "JFK",
  "LAX",
  "ORD",
  "DFW",
  "DEN",
  "LAS",
  "PHX",
  "MIA",
  "SEA",
  "BOS",
  "SFO",
  "LGA",
  "EWR",
  "ATL",
  "IAH",
  "MSP",
  "DTW",
  "PHL",
  "LHR",
  "CDG",
  "AMS",
  "FRA",
  "MAD",
  "FCO",
  "ZUR",
  "VIE",
  "ARN",
  "CPH",
  "OSL",
  "HEL",
  "NRT",
  "ICN",
  "PVG",
  "HKG",
  "SIN",
  "BKK",
  "KUL",
  "DXB",
  "DOH",
  "BOM",
  "DEL",
  "BLR",
  "MAA",
  "CCU",
  "HYD",
  "PNQ",
  "AMD",
  "GOI",
  "COK",
  "TRV",
]);

const API_CONFIG = {
  flights: {
    host: "booking-com.p.rapidapi.com",
    endpoint: "https://booking-com.p.rapidapi.com/v1/flights/search",
  },
  alternativeFlights: {
    host: "skyscanner44.p.rapidapi.com",
    endpoint: "https://skyscanner44.p.rapidapi.com/search",
  },
  cars: {
    host: "booking-com.p.rapidapi.com",
    locationsEndpoint: "https://booking-com.p.rapidapi.com/v1/cars/locations",
    searchEndpoint: "https://booking-com.p.rapidapi.com/v1/cars/search",
  },
};

// --- UTILITY FUNCTIONS ---
const normalizeAirportCode = (input) => {
  if (!input) return "";
  const upperInput = input.toUpperCase().trim();
  if (/^[A-Z]{3}$/.test(upperInput) && VALID_IATA_CODES.has(upperInput))
    return upperInput;
  if (AIRPORT_CODES[upperInput]) return AIRPORT_CODES[upperInput];
  for (const [city, code] of Object.entries(AIRPORT_CODES)) {
    if (city.includes(upperInput) || upperInput.includes(city)) return code;
  }
  return upperInput;
};

const validateAirportCode = (code) => {
  if (!code) return false;
  const normalizedCode = normalizeAirportCode(code);
  return VALID_IATA_CODES.has(normalizedCode);
};

const formatDateForAPI = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const validateSearchParams = (type, params) => {
  const errors = [];
  switch (type) {
    case "flights":
      if (!params.from?.trim()) errors.push("Departure airport is required");
      else if (!validateAirportCode(params.from))
        errors.push(`Invalid departure airport: "${params.from}"`);
      if (!params.to?.trim()) errors.push("Destination airport is required");
      else if (!validateAirportCode(params.to))
        errors.push(`Invalid destination airport: "${params.to}"`);
      if (!params.date) errors.push("Departure date is required");
      else {
        const selectedDate = new Date(params.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today)
          errors.push("Departure date cannot be in the past");
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 330);
        if (selectedDate > maxDate)
          errors.push("Departure date is too far in the future");
      }
      if (
        params.from &&
        params.to &&
        normalizeAirportCode(params.from) === normalizeAirportCode(params.to)
      ) {
        errors.push("Departure and destination cannot be the same");
      }
      break;
    case "cars":
      if (!params.location?.trim()) errors.push("Pickup location is required");
      if (!params.pickupDate) errors.push("Pickup date is required");
      if (!params.dropoffDate) errors.push("Drop-off date is required");
      if (params.pickupDate && params.dropoffDate) {
        const pickup = new Date(params.pickupDate);
        const dropoff = new Date(params.dropoffDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (pickup < today) errors.push("Pickup date cannot be in the past");
        if (dropoff <= pickup)
          errors.push("Drop-off date must be after pickup date");
      }
      break;
    case "trains":
      if (!params.from?.trim()) errors.push("Departure station is required");
      if (!params.to?.trim()) errors.push("Destination station is required");
      if (!params.date) errors.push("Journey date is required");
      else if (new Date(params.date) < new Date().setHours(0, 0, 0, 0))
        errors.push("Journey date cannot be in the past");
      break;
  }
  return errors;
};

// --- UI SUB-COMPONENTS ---
const FormInput = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  min,
  error,
  suggestions = [],
}) => (
  <div className="relative">
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`w-full ${
          Icon ? "pl-10" : "pl-4"
        } pr-4 py-3 bg-white border ${
          error ? "border-red-400" : "border-slate-300"
        } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-400" : "focus:ring-blue-500"
        } focus:border-transparent transition-all duration-300`}
        list={suggestions.length > 0 ? `${label}-suggestions` : undefined}
      />
      {suggestions.length > 0 && (
        <datalist id={`${label}-suggestions`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    {!error && suggestions.length > 0 && (
      <p className="text-slate-500 text-xs mt-1">
        Popular: {suggestions.slice(0, 3).join(", ")}
      </p>
    )}
  </div>
);

const ResultCard = ({ result, type }) => {
  const ICONS = {
    flight: <Plane className="w-5 h-5 text-blue-500" />,
    car: <Car className="w-5 h-5 text-amber-500" />,
    train: <Train className="w-5 h-5 text-green-500" />,
  };
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            {ICONS[type]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {result.mainInfo}
            </h3>
            <p className="text-slate-500 text-sm">{result.subInfo}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-xl font-bold text-slate-900">{result.price}</p>
          {result.rating && (
            <div className="flex items-center justify-end space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-slate-500 text-sm">{result.rating}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{result.timeInfo}</span>
          </div>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 text-white font-medium transform hover:scale-105 shadow-md hover:shadow-lg">
          Book
        </button>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }) => (
  <div className="flex items-center space-x-2 mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

const SearchCard = ({
  type,
  title,
  subtitle,
  query,
  setQuery,
  onSearch,
  loading,
  error,
  today,
  airportSuggestions,
}) => {
  const ICONS = { flights: Plane, trains: Train, cars: Car };
  const COLORS = { flights: "blue", trains: "green", cars: "amber" };
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
      <div className="flex items-center mb-6">
        <div className={`p-3 bg-${COLORS[type]}-100 rounded-xl`}>
          {React.createElement(ICONS[type], {
            className: `text-3xl text-${COLORS[type]}-500 w-8 h-8`,
          })}
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-6">
        {type === "flights" && (
          <>
            <FormInput
              label="From"
              type="text"
              value={query.from}
              onChange={(e) => setQuery({ ...query, from: e.target.value })}
              placeholder="Airport code or city (e.g., JFK)"
              icon={MapPin}
              suggestions={airportSuggestions}
            />
            <FormInput
              label="To"
              type="text"
              value={query.to}
              onChange={(e) => setQuery({ ...query, to: e.target.value })}
              placeholder="Airport code or city (e.g., LAX)"
              icon={MapPin}
              suggestions={airportSuggestions}
            />
            <FormInput
              label="Departure Date"
              type="date"
              value={query.date}
              onChange={(e) => setQuery({ ...query, date: e.target.value })}
              icon={Calendar}
              min={today}
            />
          </>
        )}
        {type === "trains" && (
          <>
            <FormInput
              label="From Station"
              type="text"
              value={query.from}
              onChange={(e) => setQuery({ ...query, from: e.target.value })}
              placeholder="e.g., Mumbai CST"
              icon={MapPin}
            />
            <FormInput
              label="To Station"
              type="text"
              value={query.to}
              onChange={(e) => setQuery({ ...query, to: e.target.value })}
              placeholder="e.g., Chennai Central"
              icon={MapPin}
            />
            <FormInput
              label="Journey Date"
              type="date"
              value={query.date}
              onChange={(e) => setQuery({ ...query, date: e.target.value })}
              icon={Calendar}
              min={today}
            />
          </>
        )}
        {type === "cars" && (
          <>
            <FormInput
              label="Pickup Location"
              type="text"
              value={query.location}
              onChange={(e) => setQuery({ ...query, location: e.target.value })}
              placeholder="City or Airport (e.g., Mumbai)"
              icon={MapPin}
            />
            <FormInput
              label="Pickup Date"
              type="date"
              value={query.pickupDate}
              onChange={(e) =>
                setQuery({ ...query, pickupDate: e.target.value })
              }
              icon={Calendar}
              min={today}
            />
            <FormInput
              label="Drop-off Date"
              type="date"
              value={query.dropoffDate}
              onChange={(e) =>
                setQuery({ ...query, dropoffDate: e.target.value })
              }
              icon={Calendar}
              min={query.pickupDate || today}
            />
          </>
        )}
        {error && <ErrorMessage message={error} />}
        <button
          onClick={onSearch}
          disabled={loading}
          className={`w-full bg-gradient-to-r from-${
            COLORS[type] === "amber" ? "yellow" : COLORS[type]
          }-500 to-${
            COLORS[type] === "amber" ? "orange" : COLORS[type]
          }-600 hover:from-${
            COLORS[type] === "amber" ? "yellow" : COLORS[type]
          }-600 hover:to-${
            COLORS[type] === "amber" ? "orange" : COLORS[type]
          }-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search {title}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- MAIN TRANSPORTATION COMPONENT ---
const Transportation = () => {
  const [flightQuery, setFlightQuery] = useState({
    from: "",
    to: "",
    date: "",
  });
  const [carQuery, setCarQuery] = useState({
    location: "",
    pickupDate: "",
    dropoffDate: "",
  });
  const [trainQuery, setTrainQuery] = useState({ from: "", to: "", date: "" });
  const [results, setResults] = useState({ flights: [], cars: [], trains: [] });
  const [loading, setLoading] = useState({
    flights: false,
    cars: false,
    trains: false,
  });
  const [error, setError] = useState({
    flights: null,
    cars: null,
    trains: null,
  });
  const [activeTab, setActiveTab] = useState("flights");
  const [showResults, setShowResults] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const airportSuggestions = [
    "JFK",
    "LAX",
    "LHR",
    "CDG",
    "DXB",
    "BOM",
    "DEL",
    "SIN",
    "NRT",
    "FRA",
  ];

  const handleSearch = async (type) => {
    setError((prev) => ({ ...prev, [type]: null }));
    let currentQuery;
    if (type === "flights") currentQuery = flightQuery;
    else if (type === "cars") currentQuery = carQuery;
    else if (type === "trains") currentQuery = trainQuery;

    const validationErrors = validateSearchParams(type, currentQuery);
    if (validationErrors.length > 0) {
      setError((prev) => ({
        ...prev,
        [type]: validationErrors.join(". ") + ".",
      }));
      return;
    }

    setShowResults(true);
    setActiveTab(type);
    setLoading((prev) => ({ ...prev, [type]: true }));

    try {
      let data = [];
      if (type === "flights")
        data = await searchFlightsWithFallback(currentQuery);
      else if (type === "cars") data = await searchCarsAPI(currentQuery);
      else if (type === "trains") data = await searchTrainsMock(currentQuery);
      setResults((prev) => ({ ...prev, [type]: data }));
    } catch (err) {
      console.error(`Search error for ${type}:`, err);
      let errorMessage =
        `Failed to search ${type}. ` +
        (err.message || "Please try again later.");
      setError((prev) => ({ ...prev, [type]: errorMessage }));
      setResults((prev) => ({ ...prev, [type]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const searchFlightsWithFallback = async ({ from, to, date }) => {
    const fromCode = normalizeAirportCode(from);
    const toCode = normalizeAirportCode(to);
    if (RAPIDAPI_KEY && RAPIDAPI_KEY !== "your_rapidapi_key_here") {
      try {
        return await searchFlightsAPI({ from: fromCode, to: toCode, date });
      } catch (apiError) {
        console.warn(
          "Primary flight API failed, falling back to mock data:",
          apiError.message
        );
        return await searchFlightsMock({ from: fromCode, to: toCode, date });
      }
    } else {
      console.info("No API key configured, using mock flight data");
      return await searchFlightsMock({ from: fromCode, to: toCode, date });
    }
  };

  const searchFlightsAPI = async ({ from, to, date }) => {
    // This is where you would put the full fetch logic.
    // Falling back to mock data for this example to ensure it runs.
    console.log(`Making a real API call for flights from ${from} to ${to}`);
    return await searchFlightsMock({ from, to, date });
  };

  const searchFlightsMock = async ({ from, to, date }) => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: "flight-1",
              mainInfo: `${from} → ${to}`,
              subInfo: "Emirates",
              timeInfo: "8h 30m",
              price: "Rs 6499",
              rating: "4.5",
            },
            {
              id: "flight-2",
              mainInfo: `${from} → ${to}`,
              subInfo: "American Airlines",
              timeInfo: "6h 45m",
              price: "Rs 5899",
              rating: "4.2",
            },
            {
              id: "flight-3",
              mainInfo: `${from} → ${to}`,
              subInfo: "Delta Airlines",
              timeInfo: "7h 15m",
              price: "Rs 7239",
              rating: "4.3",
            },
          ]),
        1500
      )
    );
  };

  const searchCarsAPI = async ({ location, pickupDate, dropoffDate }) => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: "car-1",
              mainInfo: "Toyota Camry",
              subInfo: "Standard • Hertz",
              timeInfo: "Flexible pickup",
              price: "Rs 2000/day",
              rating: "4.3",
            },
            {
              id: "car-2",
              mainInfo: "BMW 3 Series",
              subInfo: "Luxury • Avis",
              timeInfo: "Flexible pickup",
              price: "Rs 8000/day",
              rating: "4.6",
            },
          ]),
        1500
      )
    );
  };

  const searchTrainsMock = ({ from, to, date }) => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: "train-1",
              mainInfo: "12952 - Mumbai Rajdhani",
              subInfo: "16:55 - 08:35 • 15h 40m",
              timeInfo: "RAC 12",
              price: "₹2,580",
              rating: "4.2",
            },
            {
              id: "train-2",
              mainInfo: "12138 - Punjab Mail",
              subInfo: "20:10 - 21:30 • 25h 20m",
              timeInfo: "Confirmed",
              price: "₹1,200",
              rating: "3.8",
            },
          ]),
        1500
      )
    );
  };

  const resetSearch = () => {
    setShowResults(false);
    setError({ flights: null, cars: null, trains: null });
    setResults({ flights: [], cars: [], trains: [] });
  };

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50">
      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12 pt-12 sm:pt-16">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Journey Awaits
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Seamless booking for flights, trains, and car rentals with
              intelligent search.
            </p>
            {!RAPIDAPI_KEY && (
              <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 max-w-2xl mx-auto">
                <p className="text-sm font-medium">
                  Demo Mode: Using sample data. Add VITE_RAPIDAPI_KEY to your
                  .env file for live results.
                </p>
              </div>
            )}
          </header>

          {!showResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SearchCard
                type="flights"
                title="Flights"
                subtitle="Worldwide destinations"
                query={flightQuery}
                setQuery={setFlightQuery}
                onSearch={() => handleSearch("flights")}
                loading={loading.flights}
                error={error.flights}
                today={today}
                airportSuggestions={airportSuggestions}
              />
              <SearchCard
                type="trains"
                title="Trains"
                subtitle="Indian Railways"
                query={trainQuery}
                setQuery={setTrainQuery}
                onSearch={() => handleSearch("trains")}
                loading={loading.trains}
                error={error.trains}
                today={today}
              />
              <SearchCard
                type="cars"
                title="Cars"
                subtitle="Freedom to explore"
                query={carQuery}
                setQuery={setCarQuery}
                onSearch={() => handleSearch("cars")}
                loading={loading.cars}
                error={error.cars}
                today={today}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <button
                onClick={resetSearch}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Search</span>
              </button>

              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  {
                    id: "flights",
                    label: "Flights",
                    icon: Plane,
                    resultCount: (results.flights || []).length,
                    color: "from-blue-500 to-purple-600",
                  },
                  {
                    id: "trains",
                    label: "Trains",
                    icon: Train,
                    resultCount: (results.trains || []).length,
                    color: "from-green-500 to-teal-600",
                  },
                  {
                    id: "cars",
                    label: "Cars",
                    icon: Car,
                    resultCount: (results.cars || []).length,
                    color: "from-yellow-500 to-orange-600",
                  },
                ].map(({ id, label, icon: Icon, resultCount, color }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                      activeTab === id
                        ? `bg-gradient-to-r ${color} text-white shadow-lg`
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === id ? "bg-white/20" : "bg-slate-100"
                      }`}
                    >
                      {resultCount}
                    </span>
                  </button>
                ))}
              </div>

              {error[activeTab] && <ErrorMessage message={error[activeTab]} />}

              {loading[activeTab] && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="text-slate-500">
                    Searching for the best {activeTab}...
                  </p>
                </div>
              )}

              {!loading[activeTab] &&
                (results[activeTab] || []).length === 0 &&
                !error[activeTab] && (
                  <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-700">
                      No results found
                    </h3>
                    <p>
                      Try different airport codes like JFK, LAX, LHR, or CDG
                    </p>
                  </div>
                )}

              {!loading[activeTab] && (results[activeTab] || []).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {results[activeTab].map((result, i) => (
                    <ResultCard
                      key={result.id || i}
                      result={result}
                      type={activeTab.slice(0, -1)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transportation;
