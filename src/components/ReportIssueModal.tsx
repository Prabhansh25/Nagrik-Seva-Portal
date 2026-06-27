import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, MapPin, Loader2, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Issue } from '../types';

interface ReportIssueModalProps {
  onClose: () => void;
  onSubmit: (issue: Partial<Issue>) => void;
  lat: number;
  lng: number;
  locationName: string;
}

export default function ReportIssueModal({
  onClose,
  onSubmit,
  lat,
  lng,
  locationName,
}: ReportIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Issue['category']>('Infrastructure');
  const [priority, setPriority] = useState<Issue['priority']>('Medium');
  
  // Image states
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMime, setImageMime] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiSuggestedSolution, setAiSuggestedSolution] = useState('');

  // Handle file import
  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAiError('Please select a valid image file (jpeg, png, WebP).');
      return;
    }

    setImageName(file.name);
    setImageMime(file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // AI Autofill logic
  const handleAiAnalyze = async () => {
    if (!title && !description && !imageBase64) {
      setAiError('Provide at least a title, detailed description, or an issue image to run AI analysis.');
      return;
    }

    try {
      setIsAiAnalyzing(true);
      setAiError(null);
      setAiAnalysisComplete(false);

      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageBase64,
          imageMime,
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini analysis pipeline offline.');
      }

      const result = await response.json();
      
      // Auto upgrade input values
      if (result.category) setCategory(result.category as Issue['category']);
      if (result.priority) setPriority(result.priority as Issue['priority']);
      if (result.aiSuggestedSolution) {
        setAiSuggestedSolution(result.aiSuggestedSolution);
      }
      setAiAnalysisComplete(true);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error occurred while calling analyzer module.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Provide a valid title and details summary before filing.');
      return;
    }

    onSubmit({
      title,
      description,
      category,
      priority,
      imageUrl: imageBase64 || undefined,
      latitude: lat,
      longitude: lng,
      locationName: locationName || `${lat}, ${lng}`,
      aiSuggestedSolution: aiSuggestedSolution || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-mono tracking-widest uppercase font-bold">
              Form Gateway
            </span>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-display">Report Public Issue</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE GRID FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Coordinate status */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-4 h-4 text-blue-700" />
              <div>
                <span className="font-bold text-slate-705 text-slate-700">Geographic Lock:</span>{' '}
                <span className="truncate inline-block max-w-[200px] align-bottom select-all font-medium">{locationName}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              GPS: {lat}, {lng}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Report Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Deep Sewer Valve Fracture or Caved Pavement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Description Summary / Details</label>
            <textarea
              required
              rows={3}
              placeholder="Provide exact details of the public risk. Identify adjacent reference hubs or landmarks with safety suggestions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition resize-none"
            />
          </div>

          {/* IMAGE DRAG AND DROP ZONE */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Attach Issue Photo</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                dragOver 
                  ? 'border-blue-700 bg-blue-50/30' 
                  : imageBase64 
                    ? 'border-slate-300 bg-slate-50' 
                    : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imageBase64 ? (
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 font-sans">
                    <img
                      src={imageBase64}
                      alt="Thumbnail Preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-250 shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-850 truncate max-w-[240px]">{imageName}</p>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">File attached successfully</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageBase64('');
                      setImageMime('');
                      setImageName('');
                    }}
                    className="text-[10px] text-red-700 hover:text-red-800 font-bold uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-1.5 py-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto animate-bounce duration-1000" />
                  <p className="text-xs text-slate-500">
                    <span className="text-blue-700 font-bold">Click to upload</span> or drag and drop issue image
                  </p>
                  <p className="text-[10px] text-slate-450">Supports JPEG, PNG, or WebP formats</p>
                </div>
              )}
            </div>
          </div>

          {/* AI ASSISTANCE MODULE */}
          <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-150 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 font-display font-bold">
                  <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                  AI Automatic Categorization & Solutions Suggestion
                </h4>
                <p className="text-[10px] text-slate-600 leading-relaxed max-w-md font-sans">
                  Calls Gemini to process your text or uploaded image. It evaluates the hazards, matches community priority tags, and suggests a step-by-step resolution.
                </p>
              </div>

              <button
                type="button"
                disabled={isAiAnalyzing}
                onClick={handleAiAnalyze}
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-650 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isAiAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-white/20 text-white" />
                    AI Autofill ⚡
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-700 text-xs flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{aiError}</p>
              </div>
            )}

            {aiAnalysisComplete && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-700" />
                  Analysis complete! Auto-selected Category and Priority levels.
                </div>
                {aiSuggestedSolution && (
                  <div className="space-y-0.5 text-xs text-slate-700 font-sans">
                    <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">AI Action Recommendation:</div>
                    <p className="leading-relaxed text-[11px] text-emerald-950 font-medium italic">
                      "{aiSuggestedSolution}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DUAL ARRAYS DROPDOWN INPUT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Category Match</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Issue['category'])}
                className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                <option value="Infrastructure">Infrastructure (Roads & Sidewalks)</option>
                <option value="Waste Management">Waste & Sanitation</option>
                <option value="Safety & Hazard">Safety & Immediate Hazards</option>
                <option value="Utilities">Utilities (Water, Power, Lights)</option>
                <option value="Parks & Recreation">Parks & Green Domains</option>
                <option value="Traffic & Transit">Traffic, Transit & Signs</option>
                <option value="General">General / Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Priority Rating</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Issue['priority'])}
                className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                <option value="Low">Low - Cosmetic or delayed repairs</option>
                <option value="Medium">Medium - Regular public upkeep</option>
                <option value="High">High - Hinders active transportation or safety</option>
                <option value="Critical">Critical - Safety threat or emergency block</option>
              </select>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="border-t border-slate-150 pt-4 flex justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-55 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-650 font-bold text-white px-5 py-2.5 rounded-xl shadow-xs transition text-xs"
            >
              File Verified Issue Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
