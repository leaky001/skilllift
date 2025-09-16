import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaSearch, 
  FaTimes, 
  FaFilter, 
  FaHistory, 
  FaStar,
  FaClock,
  FaBook,
  FaUser,
  FaFileAlt,
  FaCog,
  FaLightbulb
} from 'react-icons/fa';

const SmartSearch = ({ 
  onSearch, 
  placeholder = "Search...", 
  data = [], 
  searchFields = ['title', 'description'],
  filters = [],
  showSuggestions = true,
  showHistory = true,
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Generate search suggestions
  const generateSuggestions = useCallback((searchTerm) => {
    if (!searchTerm.trim() || !data.length) return [];

    const term = searchTerm.toLowerCase();
    const suggestions = [];

    // Search in data
    data.forEach(item => {
      searchFields.forEach(field => {
        if (item[field] && item[field].toLowerCase().includes(term)) {
          const suggestion = {
            type: 'data',
            text: item[field],
            item: item,
            field: field,
            icon: getItemIcon(item)
          };
          
          if (!suggestions.find(s => s.text === suggestion.text)) {
            suggestions.push(suggestion);
          }
        }
      });
    });

    // Add filter suggestions
    filters.forEach(filter => {
      if (filter.label.toLowerCase().includes(term)) {
        suggestions.push({
          type: 'filter',
          text: `Filter by ${filter.label}`,
          filter: filter,
          icon: FaFilter
        });
      }
    });

    // Add smart suggestions
    if (term.includes('assign')) {
      suggestions.push({
        type: 'smart',
        text: 'Show all assignments',
        action: 'filter_assignments',
        icon: FaFileAlt
      });
    }

    if (term.includes('student') || term.includes('learner')) {
      suggestions.push({
        type: 'smart',
        text: 'Show all students',
        action: 'filter_students',
        icon: FaUser
      });
    }

    if (term.includes('course') || term.includes('class')) {
      suggestions.push({
        type: 'smart',
        text: 'Show all courses',
        action: 'filter_courses',
        icon: FaBook
      });
    }

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [data, searchFields, filters]);

  // Get icon for item type
  const getItemIcon = (item) => {
    if (item.type === 'assignment') return FaFileAlt;
    if (item.type === 'course') return FaBook;
    if (item.type === 'student') return FaUser;
    if (item.type === 'tutor') return FaUser;
    return FaSearch;
  };

  // Handle search input changes
  const handleInputChange = useCallback((value) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [generateSuggestions]);

  // Handle search submission
  const handleSearch = useCallback((searchTerm = query) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    saveToHistory(searchTerm);
    
    // Apply filters
    let results = data.filter(item => {
      const matchesSearch = searchFields.some(field => 
        item[field] && item[field].toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesFilters = Object.keys(activeFilters).every(filterKey => {
        const filterValue = activeFilters[filterKey];
        return !filterValue || item[filterKey] === filterValue;
      });
      
      return matchesSearch && matchesFilters;
    });

    setFilteredData(results);
    setShowDropdown(false);
    
    // Call parent search handler
    if (onSearch) {
      onSearch(searchTerm, results, activeFilters);
    }
    
    setIsLoading(false);
  }, [query, data, searchFields, activeFilters, onSearch, saveToHistory]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDropdown, suggestions, selectedIndex, handleSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    switch (suggestion.type) {
      case 'data':
        setQuery(suggestion.text);
        handleSearch(suggestion.text);
        break;
      case 'filter':
        setActiveFilters(prev => ({
          ...prev,
          [suggestion.filter.key]: suggestion.filter.value
        }));
        setQuery('');
        setShowDropdown(false);
        break;
      case 'smart':
        // Handle smart actions
        console.log('Smart action:', suggestion.action);
        break;
      case 'history':
        setQuery(suggestion.text);
        handleSearch(suggestion.text);
        break;
    }
  }, [handleSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get active filters count
  const activeFiltersCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowDropdown(true)}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-1 rounded ${
                activeFiltersCount > 0 
                  ? 'text-blue-600 bg-blue-100' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Filters"
            >
              <FaFilter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filters.map(filter => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {showDropdown && (suggestions.length > 0 || (showHistory && searchHistory.length > 0)) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={`${suggestion.type}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                      selectedIndex === index ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{suggestion.text}</span>
                    {suggestion.type === 'filter' && (
                      <FaFilter className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && !query && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Recent Searches
              </div>
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ type: 'history', text: term })}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors text-gray-900"
                >
                  <FaHistory className="h-4 w-4 text-gray-400" />
                  <span className="flex-1">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Smart Tips */}
          {!query && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Search Tips
              </div>
              <div className="px-3 py-2 text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <FaLightbulb className="h-3 w-3 text-yellow-500" />
                  <span>Use quotes for exact phrases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaLightbulb className="h-3 w-3 text-yellow-500" />
                  <span>Type "assign" to find assignments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaLightbulb className="h-3 w-3 text-yellow-500" />
                  <span>Use filters to narrow results</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find(f => f.key === key);
            const option = filter?.options.find(o => o.value === value);
            
            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
