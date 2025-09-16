import React from 'react';

const ColorPalette = () => {
  const colorPalettes = [
    {
      name: 'Primary Colors',
      description: 'Modern Blue-Green palette for main actions and brand elements',
      colors: [
        { name: '50', hex: '#f0fdfa', usage: 'Lightest background' },
        { name: '100', hex: '#ccfbf1', usage: 'Light background' },
        { name: '200', hex: '#99f6e4', usage: 'Very light accent' },
        { name: '300', hex: '#5eead4', usage: 'Light accent' },
        { name: '400', hex: '#2dd4bf', usage: 'Medium accent' },
        { name: '500', hex: '#14b8a6', usage: 'Main brand color' },
        { name: '600', hex: '#0d9488', usage: 'Primary buttons' },
        { name: '700', hex: '#0f766e', usage: 'Hover states' },
        { name: '800', hex: '#115e59', usage: 'Active states' },
        { name: '900', hex: '#134e4a', usage: 'Dark text' },
        { name: '950', hex: '#042f2e', usage: 'Darkest accent' },
      ]
    },
    {
      name: 'Secondary Colors',
      description: 'Warm Orange palette for highlights and secondary actions',
      colors: [
        { name: '50', hex: '#fff7ed', usage: 'Lightest background' },
        { name: '100', hex: '#ffedd5', usage: 'Light background' },
        { name: '200', hex: '#fed7aa', usage: 'Very light accent' },
        { name: '300', hex: '#fdba74', usage: 'Light accent' },
        { name: '400', hex: '#fb923c', usage: 'Medium accent' },
        { name: '500', hex: '#f97316', usage: 'Main secondary' },
        { name: '600', hex: '#ea580c', usage: 'Secondary buttons' },
        { name: '700', hex: '#c2410c', usage: 'Hover states' },
        { name: '800', hex: '#9a3412', usage: 'Active states' },
        { name: '900', hex: '#7c2d12', usage: 'Dark text' },
        { name: '950', hex: '#431407', usage: 'Darkest accent' },
      ]
    },
    {
      name: 'Neutral Colors',
      description: 'Foundation colors for text, backgrounds, and borders',
      colors: [
        { name: '50', hex: '#fafafa', usage: 'Lightest background' },
        { name: '100', hex: '#f5f5f5', usage: 'Light background' },
        { name: '200', hex: '#e5e5e5', usage: 'Light borders' },
        { name: '300', hex: '#d4d4d4', usage: 'Medium borders' },
        { name: '400', hex: '#a3a3a3', usage: 'Muted text' },
        { name: '500', hex: '#737373', usage: 'Secondary text' },
        { name: '600', hex: '#525252', usage: 'Primary text' },
        { name: '700', hex: '#404040', usage: 'Dark text' },
        { name: '800', hex: '#262626', usage: 'Dark background' },
        { name: '900', hex: '#171717', usage: 'Darker background' },
        { name: '950', hex: '#0a0a0a', usage: 'Darkest background' },
      ]
    },
    {
      name: 'Semantic Colors',
      description: 'Purpose-specific colors for different states and actions',
      colors: [
        { name: 'Success', hex: '#22c55e', usage: 'Success actions and states' },
        { name: 'Warning', hex: '#f59e0b', usage: 'Warning states and alerts' },
        { name: 'Error', hex: '#ef4444', usage: 'Error states and alerts' },
        { name: 'Info', hex: '#3b82f6', usage: 'Information states and alerts' },
      ]
    }
  ];

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    // You could add a toast notification here
  };

  return (
    <div className="container mx-auto p-6 space-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">
          Skill-Lift Design System
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          A comprehensive color palette and design system for building modern, accessible, and scalable user interfaces.
        </p>
      </div>

      {colorPalettes.map((palette) => (
        <div key={palette.name} className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              {palette.name}
            </h2>
            <p className="text-neutral-600">{palette.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {palette.colors.map((color) => (
              <div
                key={color.name}
                className="card card-elevated p-4 cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => copyToClipboard(color.hex)}
              >
                <div
                  className="w-full h-20 rounded-lg mb-3 border border-neutral-200"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="space-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-900">
                      {color.name}
                    </span>
                    <span className="text-sm text-neutral-500 font-mono">
                      {color.hex}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {color.usage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Component Examples */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
          Component Examples
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="space-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-outline">Outline Button</button>
              <button className="btn btn-ghost">Ghost Button</button>
            </div>
          </div>

          {/* Badges */}
          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Badges</h3>
            <div className="space-2">
              <span className="badge badge-primary">Primary</span>
              <span className="badge badge-secondary">Secondary</span>
              <span className="badge badge-success">Success</span>
              <span className="badge badge-warning">Warning</span>
              <span className="badge badge-error">Error</span>
            </div>
          </div>

          {/* Alerts */}
          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Alerts</h3>
            <div className="space-3">
              <div className="alert alert-success">Success message</div>
              <div className="alert alert-warning">Warning message</div>
              <div className="alert alert-error">Error message</div>
              <div className="alert alert-info">Info message</div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
            <div className="space-3">
              <input
                type="text"
                className="input-modern"
                placeholder="Modern input field"
              />
              <button className="btn btn-gradient-primary w-full">
                Gradient Button
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
          Usage Guidelines
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Color Usage</h3>
            <ul className="space-2 text-sm text-neutral-600">
              <li>• <strong>Primary colors</strong> for main actions and brand elements</li>
              <li>• <strong>Secondary colors</strong> for highlights and secondary actions</li>
              <li>• <strong>Semantic colors</strong> for their specific purposes</li>
              <li>• <strong>Neutral colors</strong> for text, backgrounds, and borders</li>
            </ul>
          </div>

          <div className="card card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
            <ul className="space-2 text-sm text-neutral-600">
              <li>• Maintain 4.5:1 contrast ratio for normal text</li>
              <li>• Use focus indicators for keyboard navigation</li>
              <li>• Support reduced motion preferences</li>
              <li>• Provide high contrast mode support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-neutral-500">
        <p>Click on any color swatch to copy the hex value to clipboard</p>
      </div>
    </div>
  );
};

export default ColorPalette;
