import React, { useState, useRef, useEffect } from 'react';
import { 
  FaDesktop, 
  FaWindowMaximize, 
  FaVideo, 
  FaStop, 
  FaPause, 
  FaPlay,
  FaExpand,
  FaCompress,
  FaCog,
  FaShare,
  FaUsers,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import { showError, showSuccess } from '../../services/toastService.jsx';

const ScreenSharing = ({ sessionId, userRole, isActive = true }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [shareType, setShareType] = useState('screen'); // 'screen', 'window', 'tab'
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Mock available sources
  const mockSources = [
    { id: 'screen-1', name: 'Entire Screen', type: 'screen', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMGgxMjB2NTBIMjB6IiBmaWxsPSIjRjNGNEY2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K' },
    { id: 'window-1', name: 'Chrome Browser', type: 'window', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0Y5RkFGQiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==' },
    { id: 'tab-1', name: 'Code Editor Tab', type: 'tab', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzFGN0FGRiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==' }
  ];

  useEffect(() => {
    setAvailableSources(mockSources);
  }, []);

  const startScreenShare = async () => {
    try {
      if (!isActive) {
        showError('Screen sharing is not available for this session');
        return;
      }

      // Mock screen sharing start
      setIsSharing(true);
      setSelectedSource(availableSources[0]);
      
      // Simulate getting stream
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream();
      }

      showSuccess('Screen sharing started successfully!');
    } catch (error) {
      console.error('Error starting screen share:', error);
      showError('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    try {
      setIsSharing(false);
      setIsPaused(false);
      setSelectedSource(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      showSuccess('Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
      showError('Failed to stop screen sharing');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    showSuccess(isPaused ? 'Screen sharing resumed' : 'Screen sharing paused');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    showSuccess(audioEnabled ? 'Audio disabled' : 'Audio enabled');
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    showSuccess(videoEnabled ? 'Video disabled' : 'Video enabled');
  };

  const selectSource = (source) => {
    setSelectedSource(source);
    setShareType(source.type);
    showSuccess(`Switched to ${source.name}`);
  };

  const SourceSelector = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Source to Share</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableSources.map((source) => (
          <div
            key={source.id}
            onClick={() => selectSource(source)}
            className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
              selectedSource?.id === source.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={source.thumbnail}
              alt={source.name}
              className="w-full h-20 object-cover rounded mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{source.name}</span>
              <span className="text-xs text-gray-500 capitalize">{source.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ControlPanel = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Start/Stop Button */}
          {!isSharing ? (
            <button
              onClick={startScreenShare}
              disabled={!isActive}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FaShare className="text-sm" />
              <span>Start Sharing</span>
            </button>
          ) : (
            <button
              onClick={stopScreenShare}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <FaStop className="text-sm" />
              <span>Stop Sharing</span>
            </button>
          )}

          {/* Pause/Resume Button */}
          {isSharing && (
            <button
              onClick={togglePause}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
            >
              {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          {/* Fullscreen Button */}
          {isSharing && (
            <button
              onClick={toggleFullscreen}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            disabled={!isSharing}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            } ${!isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
          >
            {audioEnabled ? <FaVolumeUp className="text-sm" /> : <FaVolumeMute className="text-sm" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            disabled={!isSharing}
            className={`p-2 rounded-lg transition-colors ${
              videoEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            } ${!isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
          >
            {videoEnabled ? <FaVideo className="text-sm" /> : <FaVideo className="text-sm" />}
          </button>

          {/* Settings */}
          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FaCog className="text-sm" />
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      {isSharing && (
        <div className="mt-3 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700">Live</span>
          </div>
          {isPaused && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700">Paused</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <FaUsers className="text-gray-500" />
            <span className="text-gray-700">5 viewers</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <ControlPanel />

      {/* Source Selector */}
      {!isSharing && isActive && <SourceSelector />}

      {/* Video Display */}
      <div className="bg-black rounded-lg overflow-hidden">
        {isSharing ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-96 object-contain"
            />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedSource?.name}
                </div>
                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                  LIVE
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePause}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                </button>
                <button
                  onClick={stopScreenShare}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaStop className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-96 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FaDesktop className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No active screen sharing</p>
              <p className="text-sm">Click "Start Sharing" to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {isSharing && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sharing Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="high">High Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="low">Low Quality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frame Rate</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="30">30 FPS</option>
                <option value="24">24 FPS</option>
                <option value="15">15 FPS</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenSharing;
