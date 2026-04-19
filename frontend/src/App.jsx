import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, X } from 'lucide-react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

function App() {
  const [nodes, setNodes] = useState([]);
  const [stats, setStats] = useState({ total: 0, osint: 0, humint: 0, imint: 0 });
  const [showModal, setShowModal] = useState(true);

  const fetchNodes = async () => {
    try {
      // In production, use standard env var or relative path
      const res = await axios.get('http://localhost:5000/api/intelligence');
      const data = res.data;
      setNodes(data);
      
      // Calculate Stats
      const newStats = {
        total: data.length,
        osint: data.filter(n => n.sourceType === 'OSINT').length,
        humint: data.filter(n => n.sourceType === 'HUMINT').length,
        imint: data.filter(n => n.sourceType === 'IMINT').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch intelligence nodes:', error);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-900 text-gray-100 font-sans relative">
      {/* Upload Caution Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-dark-800 border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-xl font-bold text-white">How to Upload Intelligence</h2>
              </div>
              <div className="text-gray-300 text-sm space-y-4">
                <p>
                  To accurately map <strong>IMINT (Images)</strong>, this software relies on Geographic EXIF Metadata hidden inside raw picture files.
                </p>
                <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-brand-400 font-semibold mb-2">⚠️ Avoid Stripped Files</h3>
                  <p className="text-xs text-gray-400">
                    Do <strong>NOT</strong> upload screenshots or images downloaded directly from WhatsApp, Telegram, Facebook, or Discord. These applications permanently delete GPS EXIF data for privacy, meaning your pin will not accurately track on the map.
                  </p>
                </div>
                <div className="bg-dark-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Recommended Methods</h3>
                  <p className="text-xs text-gray-400">
                    To upload raw photos that retain GPS coordinates securely:
                  </p>
                  <ul className="list-disc ml-5 mt-2 text-xs text-gray-400 space-y-1">
                    <li>Upload the original photo securely via <strong>Google Drive / OneDrive</strong> or transfer it directly via <strong>USB Cable</strong>.</li>
                    <li>If transferring via WhatsApp, send it strictly as a <strong>"Document"</strong>.</li>
                    <li>Send the photo to your PC via Email (Select "Actual/Original Size").</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  className="w-full bg-brand-500 hover:bg-brand-400 text-white font-bold py-2 px-4 rounded transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  I understand, access dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar onUploadSuccess={fetchNodes} stats={stats} />
      <div className="flex-grow h-full relative z-0">
        <MapView nodes={nodes} />
      </div>
    </div>
  );
}

export default App;
