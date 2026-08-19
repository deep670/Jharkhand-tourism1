import React, { useState, useRef, useEffect } from 'react';

// Groq API configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I’m your eco-friendly assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful eco-friendly assistant. Keep responses very brief and concise. Provide only 3-5 key points maximum. No markdown formatting (no **, *, #). Use short numbered lists. Be direct and to the point.'
            },
            {
              role: 'user',
              content: userMessage.text
            }
          ],
          model: 'llama-3.1-8b-instant',
          max_tokens: 300,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content;
      
      // Remove markdown formatting and add line gaps between points
      responseText = responseText
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
        .replace(/\*(.*?)\*/g, '$1')     // Remove * italic formatting
        .replace(/#{1,6}\s/g, '')        // Remove # headers
        .replace(/(\d+\.)\s/g, '\n$1 ')  // Add line break before numbered points
        .replace(/^\n/, '')              // Remove leading line break
        .trim();
      
      const botMessage = {
        sender: 'bot',
        text: responseText
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage = {
        sender: 'bot',
        text: 'Oops! Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Open Chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div ref={chatbotRef} className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-green-100">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
            <h3 className="text-lg font-semibold">Eco Assistant</h3>
            <button
              onClick={toggleChat}
              className="p-1 rounded-full hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Close Chatbot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-green-100 text-green-900 rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-green-200 text-green-800 rounded-2xl px-4 py-2 animate-pulse">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-green-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              />
              <button
                type="submit"
                disabled={isLoading || input.trim() === ''}
                className="p-3 bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-xl hover:from-green-700 hover:to-teal-600 disabled:opacity-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
