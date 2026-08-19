const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Load API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

// Access your API key
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(cors());
app.use(express.json());

// Enhanced in-memory cache with better structure
const cache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_SIZE_LIMIT = 1000; // Prevent memory issues

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Increased limit

// Pre-populated database of Jharkhand places for instant suggestions
const jharkhandPlaces = [
  // Major cities
  'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar',
  'Hazaribagh', 'Giridih', 'Chaibasa', 'Dumka', 'Simdega',
  'Palamu', 'Chatra', 'Garhwa', 'Godda', 'Pakur',
  'Sahebganj', 'Seraikela', 'Kharsawan', 'Koderma', 'Jamtara',
  'Latehar', 'Lohardaga', 'Ramgarh', 'East Singhbhum', 'West Singhbhum',
  
  // Tourist destinations
  'Netarhat', 'Betla National Park', 'Hundru Falls', 'Dassam Falls',
  'Jonha Falls', 'Rajrappa Temple', 'Baidyanath Temple', 'Parasnath Hills',
  'Jagannath Temple Ranchi', 'Birsa Zoological Park', 'Rock Garden Ranchi',
  'Tagore Hill', 'Sun Temple Ranchi', 'Kanke Dam', 'Getalsud Dam',
  
  // Industrial areas
  'Steel Authority of India Limited Bokaro', 'Tata Steel Jamshedpur',
  'Indian School of Mines Dhanbad', 'Birla Institute of Technology Mesra',
  'Central Coalfields Limited Ranchi', 'Heavy Engineering Corporation Ranchi',
  
  // Historical places
  'Rajmahal', 'Maluti Temples', 'Itkhori', 'Massanjore Dam',
  'Chandil Dam', 'Maithon Dam', 'Panchet Dam', 'Tenughat Dam',
  
  // Natural attractions
  'Dalma Wildlife Sanctuary', 'Palamau Tiger Reserve', 'Hazaribagh National Park',
  'Topchanchi Lake', 'Dimna Lake', 'Jubilee Lake', 'Patratu Valley',
  'McCluskieganj', 'Jhalda', 'Purulia Hills'
];

// Create indexed search structure for faster lookups
const createSearchIndex = () => {
  const index = new Map();
  jharkhandPlaces.forEach(place => {
    const lowerPlace = place.toLowerCase();
    for (let i = 1; i <= lowerPlace.length; i++) {
      const prefix = lowerPlace.substring(0, i);
      if (!index.has(prefix)) {
        index.set(prefix, []);
      }
      if (!index.get(prefix).includes(place)) {
        index.get(prefix).push(place);
      }
    }
    
    // Also index individual words
    const words = lowerPlace.split(' ');
    words.forEach(word => {
      for (let i = 1; i <= word.length; i++) {
        const wordPrefix = word.substring(0, i);
        if (!index.has(wordPrefix)) {
          index.set(wordPrefix, []);
        }
        if (!index.get(wordPrefix).includes(place)) {
          index.get(wordPrefix).push(place);
        }
      }
    });
  });
  return index;
};

const searchIndex = createSearchIndex();

// Fast local search function
const getLocalSuggestions = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const suggestions = searchIndex.get(normalizedQuery) || [];
  
  // Sort by relevance (exact matches first, then by length)
  return suggestions
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Exact start matches get priority
      const aStartsWithQuery = aLower.startsWith(normalizedQuery);
      const bStartsWithQuery = bLower.startsWith(normalizedQuery);
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      
      // Then sort by length (shorter names are often more common)
      return a.length - b.length;
    })
    .slice(0, 8); // Return more suggestions for better UX
};

// Optimized model configuration for faster responses
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.1, // Very low for consistent, fast results
    maxOutputTokens: 50, // Reduced for faster response
    topK: 1, // Reduced for faster processing
    topP: 0.8,
  }
});

// Cache management
const manageCacheSize = () => {
  if (cache.size > CACHE_SIZE_LIMIT) {
    // Remove oldest entries
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(CACHE_SIZE_LIMIT * 0.3));
    toRemove.forEach(([key]) => cache.delete(key));
  }
};

// Middleware for rate limiting
const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
};

app.post('/api/suggest-places', rateLimit, async (req, res) => {
  const startTime = Date.now();
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Valid query string is required.' });
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 1) {
    return res.status(400).json({ error: 'Query must be at least 1 character long.' });
  }

  // FAST TRACK: Try local suggestions first (instant response)
  const localSuggestions = getLocalSuggestions(normalizedQuery);
  
  // If we have good local matches, return them immediately for better UX
  if (localSuggestions.length >= 3) {
    console.log(`Local suggestions for "${query}" - ${Date.now() - startTime}ms`);
    return res.json({ 
      suggestions: localSuggestions.slice(0, 5),
      source: 'local',
      responseTime: Date.now() - startTime
    });
  }

  // Check cache
  const cacheKey = `jharkhand_places_${normalizedQuery}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult && Date.now() < cachedResult.expiry) {
    console.log(`Cache hit for "${query}" - ${Date.now() - startTime}ms`);
    return res.json({ 
      suggestions: cachedResult.data, 
      source: 'cache',
      responseTime: Date.now() - startTime
    });
  }

  // Optimized prompt for faster AI response
  const prompt = `List 5 places in Jharkhand starting with "${query}": `;

  try {
    console.log(`API call for query: "${query}"`);
    
    // Set a timeout for the API call
    const apiCallPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 3000) // 3 second timeout
    );
    
    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const responseText = await result.response.text();
    
    // Enhanced parsing with fallback
    let suggestions = responseText
      .split(/[,\n]/)
      .map(s => s.trim().replace(/^\d+\.\s*/, '')) // Remove numbering
      .filter(s => s && s.length > 0)
      .slice(0, 5);

    // Validate results and merge with local suggestions if needed
    if (suggestions.length === 0) {
      suggestions = localSuggestions.slice(0, 5);
    } else if (suggestions.length < 3 && localSuggestions.length > 0) {
      // Merge AI and local suggestions
      const combined = [...suggestions, ...localSuggestions];
      suggestions = [...new Set(combined)].slice(0, 5); // Remove duplicates
    }

    // Store in cache with timestamp
    cache.set(cacheKey, {
      data: suggestions,
      expiry: Date.now() + CACHE_EXPIRY,
      timestamp: Date.now()
    });

    manageCacheSize();

    console.log(`AI response for "${query}" - ${Date.now() - startTime}ms`);
    res.json({ 
      suggestions, 
      source: 'ai',
      responseTime: Date.now() - startTime
    });
    
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    
    // Always fall back to local suggestions on error
    const fallbackSuggestions = localSuggestions.length > 0 
      ? localSuggestions.slice(0, 5)
      : getFallbackSuggestions(normalizedQuery);
    
    // Cache fallback results
    if (fallbackSuggestions.length > 0) {
      cache.set(cacheKey, {
        data: fallbackSuggestions,
        expiry: Date.now() + (CACHE_EXPIRY / 4),
        timestamp: Date.now()
      });
    }
    
    console.log(`Fallback for "${query}" - ${Date.now() - startTime}ms`);
    res.json({ 
      suggestions: fallbackSuggestions,
      source: 'fallback',
      responseTime: Date.now() - startTime,
      message: error.message.includes('timeout') ? 'Fast local results' : 'Using local suggestions'
    });
  }
});

// Enhanced fallback function
function getFallbackSuggestions(query) {
  const fallbackData = {
    'r': ['Ranchi', 'Ramgarh', 'Rajmahal', 'Rock Garden Ranchi', 'Rajrappa Temple'],
    'j': ['Jamshedpur', 'Jonha Falls', 'Jagannath Temple Ranchi', 'Jamtara', 'Jubilee Lake'],
    'b': ['Bokaro Steel City', 'Betla National Park', 'Birsa Zoological Park', 'Baidyanath Temple', 'Birla Institute of Technology'],
    'd': ['Dhanbad', 'Deoghar', 'Dumka', 'Dassam Falls', 'Dalma Wildlife Sanctuary'],
    'h': ['Hazaribagh', 'Hundru Falls', 'Hazaribagh National Park', 'Heavy Engineering Corporation', 'Hatia'],
    'g': ['Giridih', 'Godda', 'Gumla', 'Garhwa', 'Getalsud Dam'],
    'c': ['Chaibasa', 'Chatra', 'Chandil', 'Chakradharpur', 'Central Coalfields Limited'],
    'p': ['Pakur', 'Palamu', 'Patratu Valley', 'Parasnath Hills', 'Palamau Tiger Reserve'],
    'n': ['Netarhat', 'Nirsa', 'Noamundi', 'Nala', 'Nawadih'],
    's': ['Simdega', 'Seraikela', 'Sahebganj', 'Sun Temple Ranchi', 'Steel Authority of India'],
    't': ['Tagore Hill', 'Tata Steel Jamshedpur', 'Topchanchi Lake', 'Tenughat Dam', 'The Indian School of Mines'],
    'm': ['Maluti Temples', 'Maithon Dam', 'Massanjore Dam', 'McCluskieganj', 'Mesra']
  };
  
  return fallbackData[query] || [];
}

// Cleanup intervals
setInterval(() => {
  const now = Date.now();
  
  // Clean rate limits
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
  
  // Clean cache
  for (const [key, data] of cache.entries()) {
    if (now > data.expiry) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cacheSize: cache.size,
    rateLimitEntries: rateLimitMap.size,
    localPlacesCount: jharkhandPlaces.length,
    indexSize: searchIndex.size
  });
});

// Clear cache endpoint
app.post('/api/clear-cache', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully.' });
});

// Get local places endpoint for testing
app.get('/api/local-places/:query', (req, res) => {
  const { query } = req.params;
  const suggestions = getLocalSuggestions(query);
  res.json({ suggestions, source: 'local' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Loaded ${jharkhandPlaces.length} places in search index`);
  console.log('API endpoints:');
  console.log('- POST /api/suggest-places');
  console.log('- GET /api/health');
  console.log('- POST /api/clear-cache');
  console.log('- GET /api/local-places/:query');
});
