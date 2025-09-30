import React from 'react';

const EnvironmentDebugger = () => {
  const apiKey = import.meta.env.VITE_STREAM_API_KEY;
  const apiSecret = import.meta.env.VITE_STREAM_API_SECRET;
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 Environment Variables Debug</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium mb-2">Environment Variables Status:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>VITE_STREAM_API_KEY:</span>
              <span className={apiKey ? 'text-green-600' : 'text-red-600'}>
                {apiKey ? `✅ Set (${apiKey.substring(0, 8)}...)` : '❌ Not Set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VITE_STREAM_API_SECRET:</span>
              <span className={apiSecret ? 'text-green-600' : 'text-red-600'}>
                {apiSecret ? `✅ Set (${apiSecret.substring(0, 8)}...)` : '❌ Not Set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VITE_API_URL:</span>
              <span className={apiUrl ? 'text-green-600' : 'text-red-600'}>
                {apiUrl ? `✅ Set (${apiUrl})` : '❌ Not Set'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">Troubleshooting Steps:</h3>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Make sure your <code className="bg-blue-100 px-1 rounded">.env</code> file is in the <code className="bg-blue-100 px-1 rounded">frontend</code> directory</li>
            <li>Restart your frontend server after creating/updating the <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
            <li>Check that the variable names start with <code className="bg-blue-100 px-1 rounded">VITE_</code></li>
            <li>Make sure there are no spaces around the <code className="bg-blue-100 px-1 rounded">=</code> sign</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium mb-2">Current .env File Content:</h3>
          <pre className="text-yellow-700 text-xs bg-yellow-100 p-2 rounded overflow-x-auto">
{`VITE_STREAM_API_KEY=j86qtfj4kzaf
VITE_STREAM_API_SECRET=qknvfbg6wb9dcw3akapwc8tsj74h77axb2xsdhyd7tvgqbqyv9xyeejm5bjd4a7k
VITE_API_URL=http://localhost:5000/api`}
          </pre>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🔄 Refresh Page
        </button>
      </div>
    </div>
  );
};

export default EnvironmentDebugger;
