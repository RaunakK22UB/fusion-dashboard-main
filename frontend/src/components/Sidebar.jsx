import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, Layers, ShieldAlert, Users, Image as ImageIcon, Map as MapIcon, Link } from 'lucide-react';

const Sidebar = ({ onUploadSuccess, stats }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    if (manualLat && !isNaN(parseFloat(manualLat))) {
      formData.append('latitude', manualLat);
    }
    if (manualLon && !isNaN(parseFloat(manualLon))) {
      formData.append('longitude', manualLon);
    }

    try {
      // In production, pass Authorization headers if needed. We use a dummy for the demo.
      const res = await axios.post('https://fusion-dashboard-main.onrender.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-role': 'admin'
        }
      });
      setMessage({ type: 'success', text: res.data.message });
      onUploadSuccess(); // refresh map and stats
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    multiple: false
  });

  return (
    <div className="w-80 h-full bg-dark-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl relative">
      <div className="p-6 border-b border-gray-800 bg-dark-800">
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <MapIcon className="text-brand-500" />
          Fusion Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-2">Multi-Source Intelligence</p>
      </div>

      <div className="p-6 flex-grow overflow-y-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Ingestion Engine</h2>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${
            isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-dark-800'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-10 h-10 mb-3 ${isDragActive ? 'text-brand-500' : 'text-gray-400'}`} />
          {uploading ? (
            <p className="text-sm text-brand-400 animate-pulse">Uploading and Parsing...</p>
          ) : isDragActive ? (
            <p className="text-sm text-brand-500">Drop the file here ...</p>
          ) : (
            <p className="text-sm text-gray-400">
              <span className="text-brand-400 font-medium hover:underline">Click to upload</span> or drag and drop
              <br />
              <span className="text-xs text-gray-500 mt-1 block">CSV, JSON, JPG, PNG</span>
            </p>
          )}
        </div>

        <div className="mt-4 p-4 border border-gray-800 rounded-lg bg-dark-800/50">
           <h3 className="text-xs font-semibold text-gray-400 mb-2">OPTIONAL: MANUAL COORDINATES</h3>
           <p className="text-[10px] text-gray-500 mb-3 leading-tight">If your image was sent via WhatsApp and lacks GPS EXIF data, manually type the coordinates below before dropping the file.</p>
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Latitude (e.g. 31.1471)" 
               className="w-1/2 bg-dark-900 border border-gray-700 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-500 text-gray-200"
               value={manualLat}
               onChange={(e) => setManualLat(e.target.value)}
             />
             <input 
               type="text" 
               placeholder="Longitude (e.g. 75.3412)" 
               className="w-1/2 bg-dark-900 border border-gray-700 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-500 text-gray-200"
               value={manualLon}
               onChange={(e) => setManualLon(e.target.value)}
             />
           </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mt-8 mb-4">Real-time Statistics</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Layers className="w-4 h-4 text-brand-500" />} label="Total Nodes" value={stats.total} />
          <StatCard icon={<Link className="w-4 h-4 text-purple-400" />} label="OSINT" value={stats.osint} />
          <StatCard icon={<Users className="w-4 h-4 text-green-400" />} label="HUMINT" value={stats.humint} />
          <StatCard icon={<ImageIcon className="w-4 h-4 text-amber-400" />} label="IMINT" value={stats.imint} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-dark-800 rounded-lg p-4 border border-gray-800 flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
    <span className="text-2xl font-bold text-gray-100">{value}</span>
  </div>
);

export default Sidebar;
