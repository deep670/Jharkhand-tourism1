import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Send, User, MapPin, Clock, Quote, MessageSquare, LogIn, Tag, X, Loader, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function Feedback() {
  const [user] = useAuthState(auth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [place, setPlace] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Enhanced state for the mention functionality
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const mentionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  // Client-side cache for suggestions
  const cacheRef = useRef(new Map());
  const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const feedbackRef = ref(db, 'feedbacks');
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const feedbackList = [];
      snapshot.forEach((childSnapshot) => {
        feedbackList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      feedbackList.sort((a, b) => b.timestamp - a.timestamp);
      setFeedbacks(feedbackList);
    });

    const handleClickOutside = (event) => {
      if (mentionRef.current && !mentionRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced API call function
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setFilteredPlaces([]);
      setShowSuggestions(false);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      setFilteredPlaces(cached.data);
      setShowSuggestions(cached.data.length > 0);
      setSearchLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setSearchLoading(true);
      setSearchError('');

      const response = await fetch('http://localhost:3001/api/suggest-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(`Too many requests. Please wait ${errorData.retryAfter} seconds.`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];

      // Cache the results
      cacheRef.current.set(cacheKey, {
        data: suggestions,
        expiry: Date.now() + CACHE_EXPIRY
      });

      setFilteredPlaces(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setSearchError('');

    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      console.error('Failed to fetch suggestions:', error);
      setSearchError(error.message);
      setFilteredPlaces([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleMentionChange = (e) => {
    const value = e.target.value;
    setPlace(value);
    setSelectedIndex(-1);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Check if '@' is present and get the query
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const query = value.substring(atIndex + 1);
      
      if (query.length > 0) {
        // Set loading immediately for better UX
        setSearchLoading(true);
        
        // Debounce the API call
        debounceTimerRef.current = setTimeout(() => {
          fetchSuggestions(query);
        }, 100); // 300ms debounce
      } else {
        setFilteredPlaces([]);
        setShowSuggestions(false);
        setSearchLoading(false);
      }
    } else {
      setFilteredPlaces([]);
      setShowSuggestions(false);
      setSearchLoading(false);
    }
  };

  const handleSelectPlace = (selectedPlace) => {
    const atIndex = place.lastIndexOf('@');
    const beforeAt = place.substring(0, atIndex);
    setPlace(`${beforeAt}${selectedPlace} `);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredPlaces.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredPlaces.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPlaces.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredPlaces.length) {
          e.preventDefault();
          handleSelectPlace(filteredPlaces[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedTag = tagInput.trim().replace(/^#/, ''); // Remove # if present
      if (trimmedTag && !tags.includes(trimmedTag) && trimmedTag.length <= 20) {
        setTags([...tags, trimmedTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !place.trim() || !user) return;

    setLoading(true);
    try {
      const feedbackRef = ref(db, 'feedbacks');
      const newFeedbackRef = push(feedbackRef);
      await set(newFeedbackRef, {
        name: user.displayName || 'Anonymous',
        place: place.trim(),
        message: newFeedback.trim(),
        timestamp: Date.now(),
        photoURL: user.photoURL || null,
        tags: tags,
      });
      
      // Reset form
      setNewFeedback('');
      setPlace('');
      setTags([]);
      setTagInput('');
      
      // Clear cache to show fresh results
      cacheRef.current.clear();
      
    } catch (error) {
      console.error('Error adding feedback: ', error);
      alert('Failed to submit feedback. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8 mt-[9vh]">

       <div className="absolute left-8 top-[10vh] z-0">
          <Link
            to="/dashboard"
            className="group inline-flex items-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-full font-medium transition-all duration-300 border border-slate-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Link>
        </div>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Community Feedback
          </h1>
          <p className="text-slate-500 mt-2">Share your experiences and help us improve.</p>
        </header>

        {/* Submit Feedback Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/50 mb-12">
          <h2 className="text-2xl font-bold text-teal-600 mb-6">Share Your Experience</h2>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative" ref={mentionRef}>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={place}
                  onChange={handleMentionChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Which place did you visit? (Type @ to see suggestions)"
                  className="w-full p-4 pl-10 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  required
                />
                {searchLoading && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                )}
                
                {/* Suggestions dropdown */}
                {showSuggestions && (filteredPlaces.length > 0 || searchError) && (
                  <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {searchError ? (
                      <div className="p-3 text-red-600 text-sm">
                        Error: {searchError}
                      </div>
                    ) : (
                      filteredPlaces.map((place, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectPlace(place)}
                          className={`p-3 cursor-pointer transition-colors duration-150 ${
                            index === selectedIndex 
                              ? 'bg-teal-100 text-teal-900' 
                              : 'hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal-500" />
                            {place}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Tagging Section */}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (e.g., clean, service, price) and press Enter or comma"
                  className="w-full p-4 pl-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  maxLength={20}
                />
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {tags.length >= 5 && (
                  <p className="text-xs text-amber-600 mt-1">Maximum 5 tags allowed</p>
                )}
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 text-slate-400 w-5 h-5" />
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Tell us about your experience, what you liked, or what could be better..."
                  className="w-full p-4 pl-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-shadow"
                  rows="5"
                  required
                  maxLength={500}
                />
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {newFeedback.length}/500 characters
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !newFeedback.trim() || !place.trim()}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-300"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center bg-slate-100 p-6 rounded-xl border border-slate-200">
              <LogIn className="mx-auto w-10 h-10 text-teal-500 mb-3" />
              <p className="text-slate-700 font-medium">Please log in to share your valuable feedback.</p>
            </div>
          )}
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">What Others Are Saying</h2>
          {feedbacks.length === 0 && !loading ? (
            <div className="text-center bg-white p-8 rounded-xl border border-slate-200">
              <MessageSquare className="mx-auto w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">No feedback has been shared yet. Be the first!</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-200 flex items-center justify-center flex-shrink-0">
                      {feedback.photoURL ? (
                        <img src={feedback.photoURL} alt={feedback.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{feedback.name}</p>
                      <p className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{feedback.place}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(feedback.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {feedback.tags && feedback.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feedback.tags.map((tag, index) => (
                      <span key={index} className="bg-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="relative pl-8">
                  <Quote className="absolute left-0 top-0 w-6 h-6 text-slate-200 transform -translate-x-2 flex-shrink-0" />
                  <p className="text-slate-700 leading-relaxed">{feedback.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;