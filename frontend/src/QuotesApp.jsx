import React, { useState, useEffect } from 'react';
import { Heart, BookmarkPlus, Share, ArrowLeft, ArrowRight, Moon, Sun, Plus, X } from 'lucide-react';

const QuotesApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', category: '' });
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quotes from backend on component mount
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quotes');
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const data = await response.json();
      setQuotes(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      // Fallback to sample quotes if API fails
      setQuotes([
        {
          id: 1,
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          category: "Motivation",
          color: "from-purple-500 to-pink-500"
        },
        {
          id: 2,
          text: "Innovation distinguishes between a leader and a follower.",
          author: "Steve Jobs",
          category: "Leadership",
          color: "from-blue-500 to-cyan-400"
        },
        {
          id: 3,
          text: "Design is not just what it looks like and feels like. Design is how it works.",
          author: "Steve Jobs",
          category: "Design",
          color: "from-green-400 to-teal-500"
        },
        {
          id: 4,
          text: "Your time is limited, so don't waste it living someone else's life.",
          author: "Steve Jobs",
          category: "Life",
          color: "from-yellow-400 to-orange-500"
        },
        {
          id: 5,
          text: "Think different.",
          author: "Apple Inc.",
          category: "Innovation",
          color: "from-red-500 to-pink-500"
        }
      ]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const nextQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }
  };

  const prevQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuoteIndex((prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length);
    }
  };

  const saveQuote = (quote) => {
    if (!savedQuotes.some(q => q.id === quote.id)) {
      setSavedQuotes([...savedQuotes, quote]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuote(prev => ({ ...prev, [name]: value }));
  };

  const getRandomColor = () => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-400",
      "from-green-400 to-teal-500",
      "from-yellow-400 to-orange-500",
      "from-red-500 to-pink-500",
      "from-indigo-500 to-purple-500"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuote.text || !newQuote.author || !newQuote.category) {
      return;
    }

    const quoteWithColor = {
      ...newQuote,
      color: getRandomColor()
    };

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteWithColor),
      });

      if (!response.ok) {
        throw new Error('Failed to add quote');
      }

      const newQuoteFromServer = await response.json();
      setQuotes(prev => [...prev, newQuoteFromServer]);
      setNewQuote({ text: '', author: '', category: '' });
      setShowAddDialog(false);
    } catch (err) {
      console.error(err);
      // Fall back to client-side addition if server fails
      const newQuoteWithId = {
        ...quoteWithColor,
        id: quotes.length + 1
      };
      setQuotes(prev => [...prev, newQuoteWithId]);
      setNewQuote({ text: '', author: '', category: '' });
      setShowAddDialog(false);
    }
  };

  const currentQuote = quotes[currentQuoteIndex] || { 
    id: 0, 
    text: "Loading quotes...", 
    author: "", 
    category: "", 
    color: "from-gray-400 to-gray-500" 
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} backdrop-blur-lg bg-opacity-80 shadow-sm`}>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quotes</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddDialog(true)} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <Plus size={20} className={darkMode ? 'text-white' : 'text-gray-800'} />
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-all">
            {darkMode ? 
              <Sun className="text-white" size={20} /> : 
              <Moon className="text-gray-800" size={20} />
            }
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading quotes...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : quotes.length === 0 ? (
          <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>No quotes available. Add one!</div>
        ) : (
          /* Quote Card */
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 transform hover:scale-102`}>
            <div className={`h-4 bg-gradient-to-r ${currentQuote.color}`}></div>
            <div className="p-8">
              <div className={`text-sm uppercase tracking-wide font-semibold mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentQuote.category}
              </div>
              <p className={`text-2xl font-medium mb-6 leading-relaxed ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                "{currentQuote.text}"
              </p>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                — {currentQuote.author}
              </p>
              
              {/* Actions */}
              <div className="mt-8 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                    <Heart size={20} className={darkMode ? 'text-pink-400' : 'text-pink-500'} />
                  </button>
                  <button 
                    onClick={() => saveQuote(currentQuote)} 
                    className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <BookmarkPlus size={20} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
                  </button>
                  <button className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                    <Share size={20} className={darkMode ? 'text-green-400' : 'text-green-500'} />
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={prevQuote}
                    className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <ArrowLeft size={20} className={darkMode ? 'text-white' : 'text-gray-800'} />
                  </button>
                  <button 
                    onClick={nextQuote}
                    className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <ArrowRight size={20} className={darkMode ? 'text-white' : 'text-gray-800'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Saved Quotes Section */}
        {savedQuotes.length > 0 && (
          <div className={`mt-12 w-full max-w-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-xl font-bold mb-4">Saved Quotes</h2>
            <div className="space-y-4">
              {savedQuotes.map(quote => (
                <div 
                  key={quote.id} 
                  className={`rounded-2xl p-4 ${darkMode ? 
                    'bg-gray-800 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]' : 
                    'bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'
                  } transition-all`}
                >
                  <div className={`text-xs uppercase tracking-wide font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {quote.category}
                  </div>
                  <p className="text-lg font-medium mb-2">"{quote.text}"</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>— {quote.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Quote Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <div className="relative p-6">
              <button 
                onClick={() => setShowAddDialog(false)}
                className={`absolute top-6 right-6 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <X size={20} className={darkMode ? 'text-white' : 'text-gray-800'} />
              </button>
              
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Quote</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="text" className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Quote Text
                    </label>
                    <textarea
                      id="text"
                      name="text"
                      value={newQuote.text}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 
                        'bg-gray-700 border-gray-600 text-white' : 
                        'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:outline-none ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}`}
                      placeholder="Enter the quote text"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="author" className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Author
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={newQuote.author}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 
                        'bg-gray-700 border-gray-600 text-white' : 
                        'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:outline-none ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}`}
                      placeholder="Enter the author's name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={newQuote.category}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 
                        'bg-gray-700 border-gray-600 text-white' : 
                        'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:outline-none ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-600'}`}
                      placeholder="Enter a category (e.g., Motivation, Leadership)"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className={`mt-6 w-full py-3 px-4 rounded-xl ${darkMode ? 
                    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 
                    'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                  } text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Add Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesApp;
