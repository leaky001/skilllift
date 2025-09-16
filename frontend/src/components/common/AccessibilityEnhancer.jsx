import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  FaKeyboard, 
  FaEye, 
  FaEyeSlash, 
  FaVolumeUp, 
  FaVolumeMute,
  FaFont,
  FaContrast,
  FaHandPaper,
  FaCog,
  FaTimes,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

// Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider Component
export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    colorBlindness: 'none', // none, protanopia, deuteranopia, tritanopia
    fontSize: 'medium', // small, medium, large, xlarge
    lineSpacing: 'normal', // tight, normal, loose
    cursorSize: 'normal' // small, normal, large
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const focusableElements = useRef(new Set());

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    applyAccessibilitySettings();
  }, [settings]);

  // Apply accessibility settings to document
  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.style.setProperty('--font-size', getFontSizeValue(settings.fontSize));
    
    // Line spacing
    root.style.setProperty('--line-spacing', getLineSpacingValue(settings.lineSpacing));
    
    // Cursor size
    root.style.setProperty('--cursor-size', getCursorSizeValue(settings.cursorSize));

    // Color blindness simulation
    applyColorBlindnessFilter(settings.colorBlindness);
  };

  // Get font size value
  const getFontSizeValue = (size) => {
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      xlarge: '1.25rem'
    };
    return sizes[size] || sizes.medium;
  };

  // Get line spacing value
  const getLineSpacingValue = (spacing) => {
    const spacings = {
      tight: '1.2',
      normal: '1.5',
      loose: '2.0'
    };
    return spacings[spacing] || spacings.normal;
  };

  // Get cursor size value
  const getCursorSizeValue = (size) => {
    const sizes = {
      small: '1px',
      normal: '2px',
      large: '4px'
    };
    return sizes[size] || sizes.normal;
  };

  // Apply color blindness filter
  const applyColorBlindnessFilter = (type) => {
    const filters = {
      none: 'none',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };
    
    document.documentElement.style.filter = filters[type] || filters.none;
  };

  // Announce to screen readers
  const announce = (message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  };

  // Register focusable element
  const registerFocusableElement = (element) => {
    if (element) {
      focusableElements.current.add(element);
    }
  };

  // Unregister focusable element
  const unregisterFocusableElement = (element) => {
    if (element) {
      focusableElements.current.delete(element);
    }
  };

  // Get all focusable elements
  const getFocusableElements = () => {
    return Array.from(focusableElements.current);
  };

  // Focus management
  const focusFirstElement = () => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  };

  const focusLastElement = () => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'Tab':
          // Handle tab navigation
          break;
        case 'Escape':
          // Close modals, panels, etc.
          setIsPanelOpen(false);
          break;
        case 'F1':
          // Open accessibility panel
          e.preventDefault();
          setIsPanelOpen(true);
          break;
        case 'F2':
          // Toggle high contrast
          e.preventDefault();
          setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
          announce(`High contrast ${!settings.highContrast ? 'enabled' : 'disabled'}`);
          break;
        case 'F3':
          // Toggle large text
          e.preventDefault();
          setSettings(prev => ({ ...prev, largeText: !prev.largeText }));
          announce(`Large text ${!settings.largeText ? 'enabled' : 'disabled'}`);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, settings.highContrast, settings.largeText]);

  const contextValue = {
    settings,
    setSettings,
    isPanelOpen,
    setIsPanelOpen,
    announce,
    registerFocusableElement,
    unregisterFocusableElement,
    getFocusableElements,
    focusFirstElement,
    focusLastElement
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Accessibility Panel */}
      <AccessibilityPanel />
      
      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncements announcements={announcements} />
      
      {/* Color Blindness Filters */}
      <ColorBlindnessFilters />
    </AccessibilityContext.Provider>
  );
};

// Accessibility Panel Component
const AccessibilityPanel = () => {
  const { settings, setSettings, isPanelOpen, setIsPanelOpen, announce } = useAccessibility();

  if (!isPanelOpen) return null;

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FaCog className="text-2xl text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Accessibility Settings</h2>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaContrast className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">High Contrast</p>
                    <p className="text-sm text-gray-600">Increase color contrast</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaFont className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Large Text</p>
                    <p className="text-sm text-gray-600">Increase font size</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('largeText', !settings.largeText)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaHandPaper className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Reduced Motion</p>
                    <p className="text-sm text-gray-600">Minimize animations</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FaKeyboard className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Keyboard Navigation</p>
                    <p className="text-sm text-gray-600">Enhanced keyboard support</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {['small', 'medium', 'large', 'xlarge'].map(size => (
                <button
                  key={size}
                  onClick={() => handleSettingChange('fontSize', size)}
                  className={`p-3 rounded-lg border transition-colors ${
                    settings.fontSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`block ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : size === 'xlarge' ? 'text-xl' : 'text-base'}`}>
                    Aa
                  </span>
                  <span className="text-xs mt-1 block capitalize">{size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Blindness */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Vision</h3>
            <select
              value={settings.colorBlindness}
              onChange={(e) => handleSettingChange('colorBlindness', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
            </select>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Open accessibility panel</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">F1</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Toggle high contrast</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">F2</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Toggle large text</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">F3</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Close panels/modals</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Escape</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setSettings({
                  highContrast: false,
                  largeText: false,
                  reducedMotion: false,
                  screenReader: false,
                  keyboardNavigation: true,
                  focusVisible: true,
                  colorBlindness: 'none',
                  fontSize: 'medium',
                  lineSpacing: 'normal',
                  cursorSize: 'normal'
                });
                announce('Accessibility settings reset to default');
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Screen Reader Announcements Component
const ScreenReaderAnnouncements = ({ announcements }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map(announcement => (
        <div key={announcement.id}>
          {announcement.message}
        </div>
      ))}
    </div>
  );
};

// Color Blindness Filters Component
const ColorBlindnessFilters = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
};

// Focusable Element Hook
export const useFocusableElement = (ref) => {
  const { registerFocusableElement, unregisterFocusableElement } = useAccessibility();

  useEffect(() => {
    if (ref.current) {
      registerFocusableElement(ref.current);
      return () => unregisterFocusableElement(ref.current);
    }
  }, [ref, registerFocusableElement, unregisterFocusableElement]);
};

// Accessibility Button Component
export const AccessibilityButton = () => {
  const { setIsPanelOpen, announce } = useAccessibility();

  const handleClick = () => {
    setIsPanelOpen(true);
    announce('Accessibility settings panel opened');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open accessibility settings"
      title="Accessibility Settings (F1)"
    >
      <FaCog className="text-xl" />
    </button>
  );
};

export default AccessibilityEnhancer;
