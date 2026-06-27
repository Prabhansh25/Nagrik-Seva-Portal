import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ZoomIn, ZoomOut, Compass, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import { Issue } from '../types';
import { METRO_DISTRICTS } from '../utils/civicData';

interface VisualCityMapProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue) => void;
  isSelectingLocation: boolean;
  onLocationSelected?: (lat: number, lng: number, name: string) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

export default function VisualCityMap({
  issues,
  selectedIssue,
  onSelectIssue,
  isSelectingLocation,
  onLocationSelected,
  selectedLocation,
}: VisualCityMapProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map limits: lat [40.68, 40.76], lng [-74.04, -73.94]
  const minLat = 40.68, maxLat = 40.76;
  const minLng = -74.04, maxLng = -73.94;

  const latToY = (lat: number) => {
    // Top of map is maxLat, bottom is minLat
    return 600 - ((lat - minLat) / (maxLat - minLat)) * 600;
  };

  const lngToX = (lng: number) => {
    // Left of map is minLng, right is maxLng
    return ((lng - minLng) / (maxLng - minLng)) * 800;
  };

  // Convert SVG coordinate back to lat/lng for custom placement
  const coordToLatLng = (x: number, y: number) => {
    const lng = minLng + (x / 800) * (maxLng - minLng);
    const lat = minLat + ((600 - y) / 600) * (maxLat - minLat);
    
    // Find district
    let guessedDistrict = 'Indiranagar Ward (BBMP)';
    for (const dist of METRO_DISTRICTS) {
      if (lat >= dist.bounds.minLat && lat <= dist.bounds.maxLat &&
          lng >= dist.bounds.minLng && lng <= dist.bounds.maxLng) {
        guessedDistrict = dist.name;
        break;
      }
    }

    return {
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      district: guessedDistrict,
    };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Get mouse coordinate relative to original 800x600 coordinate grid
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    const percentX = rawX / rect.width;
    const percentY = rawY / rect.height;
    
    const x = percentX * 800;
    const y = percentY * 600;

    const loc = coordToLatLng(x, y);
    
    if (onLocationSelected) {
      onLocationSelected(loc.lat, loc.lng, `${loc.district} Sector (Map Pin)`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart.x === 0 && dragStart.y === 0) return;
    const dx = Math.abs(e.clientX - (dragStart.x + offset.x));
    const dy = Math.abs(e.clientY - (dragStart.y + offset.y));
    if (dx > 3 || dy > 3) {
      setIsDragging(true);
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart({ x: 0, y: 0 });
    // Let drag complete after small delay to block single-click event
    setTimeout(() => setIsDragging(false), 50);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Infrastructure': return 'fill-blue-500 stroke-blue-200';
      case 'Waste Management': return 'fill-orange-500 stroke-orange-200';
      case 'Safety & Hazard': return 'fill-red-500 stroke-red-200';
      case 'Utilities': return 'fill-yellow-500 stroke-yellow-200';
      case 'Parks & Recreation': return 'fill-green-500 stroke-green-200';
      case 'Traffic & Transit': return 'fill-violet-500 stroke-violet-200';
      default: return 'fill-zinc-500 stroke-zinc-200';
    }
  };

  const getDistrictIssuesCount = (districtName: string) => {
    return issues.filter(issue => issue.locationName.includes(districtName)).length;
  };

  return (
    <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm h-[520px] flex flex-col md:flex-row">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm">
          <Compass className="w-5 h-5 text-blue-700 rotate-12 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Live Civic Core Map</h4>
            <p className="text-[10px] text-slate-500">Click to locate existing grid details</p>
          </div>
        </div>
        
        {isSelectingLocation && (
          <div className="bg-blue-700 text-white text-xs px-3 py-2 rounded-xl shadow-md border border-blue-600 font-semibold animate-bounce flex items-center gap-2">
            <MapPin className="w-4 h-4 fill-white text-blue-400 animate-pulse" />
            Click on map to set report location!
          </div>
        )}
      </div>

      {/* Map utilities */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-sm">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => {
            setZoom(prev => Math.max(prev - 0.25, 1));
            setOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-800 transition"
        >
          Reset
        </button>
      </div>

      {/* Main SVG Container */}
      <div 
        className="flex-1 w-full relative h-[360px] md:h-full cursor-grab active:cursor-grabbing overflow-hidden bg-slate-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          onClick={handleMapClick}
          viewBox="0 0 800 600"
          className="w-full h-full select-none transform transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* DEFINITIONS FOR GRADIENTS AND ACCENTS */}
          <defs>
            <radialGradient id="highlight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BASE CANVAS BACKDROP */}
          <rect width="800" height="600" fill="#f8fafc" />

          {/* 1. DISTRICT GRID REGIONS */}
          {/* Bandra West Ward (BMC) [d2] */}
          <path
            d="M 50 50 L 320 50 L 320 300 Q 200 400 50 300 Z"
            fill={hoveredDistrict === 'Bandra West Ward (BMC)' ? '#e2e8f0' : '#f1f5f9'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict('Bandra West Ward (BMC)')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />

          {/* Indiranagar Ward (BBMP) [d1] */}
          <path
            d="M 320 50 L 550 50 L 550 360 L 320 300 Z"
            fill={hoveredDistrict === 'Indiranagar Ward (BBMP)' ? '#e2e8f0' : '#f1f5f9'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict('Indiranagar Ward (BBMP)')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />

          {/* Jubilee Hills Ward (GHMC) [d5] */}
          <path
            d="M 550 50 L 750 50 L 750 280 L 550 360 Z"
            fill={hoveredDistrict === 'Jubilee Hills Ward (GHMC)' ? '#e2e8f0' : '#f1f5f9'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict('Jubilee Hills Ward (GHMC)')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />

          {/* Yamuna Ghats Zone (NDMC) [d3] */}
          <path
            d="M 50 300 Q 200 400 320 300 L 320 550 L 50 550 Z"
            fill={hoveredDistrict === 'Yamuna Ghats Zone (NDMC)' ? '#e2e8f0' : '#f1f5f9'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict('Yamuna Ghats Zone (NDMC)')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />

          {/* Shivaji Nagar (PMC) [d4] */}
          <path
            d="M 320 300 L 550 360 L 550 550 L 320 550 Z"
            fill={hoveredDistrict === 'Shivaji Nagar (PMC)' ? '#e2e8f0' : '#f1f5f9'}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredDistrict('Shivaji Nagar (PMC)')}
            onMouseLeave={() => setHoveredDistrict(null)}
          />

          {/* GREENWOOD PARK ASSET (An actual green block) */}
          <rect
            x="590"
            y="90"
            width="120"
            height="150"
            rx="10"
            fill="#10b981"
            fillOpacity="0.1"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text x="650" y="170" fill="#047857" fontSize="11" textAnchor="middle" className="font-sans font-medium tracking-wide">Jubilee Hills (GHMC)</text>

          {/* WATER BODY: METROPOLITAN RESERVOIR / RIVER */}
          <path
            d="M 750 280 Q 550 360 550 550"
            fill="none"
            stroke="#dbeafe"
            strokeWidth="45"
            strokeLinecap="round"
            className="opacity-85"
          />
          <path
            d="M 750 280 Q 550 360 550 550"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="20"
            strokeLinecap="round"
            className="opacity-90"
          />
          <text x="600" y="450" fill="#1e40af" fontSize="9" fontWeight="bold" transform="rotate(-70 600 450)" className="tracking-widest">YAMUNA RIVER</text>

          {/* GRID ROAD NETWORK */}
          {/* Main Expressway (Vertical) */}
          <line x1="320" y1="50" x2="320" y2="550" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="10 5" />
          <line x1="320" y1="50" x2="320" y2="550" stroke="#94a3b8" strokeWidth="2" />

          {/* Cross Highway (Horizontal) */}
          <path d="M 50 300 Q 200 400 320 300 L 750 360" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="10 5" />
          <path d="M 50 300 Q 200 400 320 300 L 750 360" fill="none" stroke="#94a3b8" strokeWidth="2" />

          {/* Minor avenues */}
          <line x1="180" y1="50" x2="180" y2="330" stroke="#e2e8f0" strokeWidth="3" />
          <line x1="450" y1="50" x2="450" y2="550" stroke="#e2e8f0" strokeWidth="3" />
          <line x1="50" y1="180" x2="550" y2="180" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50" y1="460" x2="450" y2="460" stroke="#e2e8f0" strokeWidth="2.5" />

          {/* ROAD LABELS */}
          <text x="328" y="100" fill="#64748b" fontSize="8" fontWeight="bold" transform="rotate(90 328 100)">INDIRANAGAR DOUBLE ROAD</text>
          <text x="120" y="335" fill="#64748b" fontSize="8" fontWeight="bold">CARTER ROAD BYPASS</text>

          {/* 3. ISSUE MARKERS (PINS) */}
          {issues.map((issue) => {
            const x = lngToX(issue.longitude);
            const y = latToY(issue.latitude);
            const isSelected = selectedIssue && selectedIssue.id === issue.id;

            // Simple pulsing halo around critical markers
            const isCritical = issue.priority === 'Critical' && issue.status !== 'Resolved';

            return (
              <g key={issue.id} className="cursor-pointer">
                {/* Pulsing visual halo for highlighted critical risks */}
                {isCritical && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="url(#hotspot)"
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '3s' }}
                  />
                )}

                {/* Animated Ring on selection */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    className="animate-spin"
                    style={{ strokeDasharray: '4 2', transformOrigin: `${x}px ${y}px`, animationDuration: '6s' }}
                  />
                )}

                {/* Pin Head shadow */}
                <circle cx={x} cy={y + 1} r="5" fill="#000" fillOpacity="0.2" />

                {/* Main Pin Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  className={`${getCategoryColor(issue.category)} transition-all duration-300 hover:scale-150`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIssue(issue);
                  }}
                />

                {/* Category abbreviation display inside pin on high zoom */}
                {zoom > 1.5 && (
                  <text
                    x={x}
                    y={y + 2}
                    fill="#ffffff"
                    fontSize="5"
                    fontWeight="black"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {issue.category[0]}
                  </text>
                )}
              </g>
            );
          })}

          {/* ACTIVE SELECTED PLACEMENT PIN */}
          {selectedLocation && (
            <g>
              <g className="animate-bounce" style={{ animationDuration: '1.2s' }}>
                <path
                  d={`M ${lngToX(selectedLocation.lng)} ${latToY(selectedLocation.lat)}
                     C ${lngToX(selectedLocation.lng) - 10} ${latToY(selectedLocation.lat) - 25}
                       ${lngToX(selectedLocation.lng) + 10} ${latToY(selectedLocation.lat) - 25}
                       ${lngToX(selectedLocation.lng)} ${latToY(selectedLocation.lat)} Z`}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <circle cx={lngToX(selectedLocation.lng)} cy={latToY(selectedLocation.lat) - 16} r="4" fill="#ffffff" />
              </g>
              <circle cx={lngToX(selectedLocation.lng)} cy={latToY(selectedLocation.lat)} r="14" fill="url(#highlight)" />
            </g>
          )}
        </svg>
      </div>

      {/* Side Status Drawer - Shows details of selected pin */}
      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-display">
              <Info className="w-4 h-4 text-blue-700" />
              Map Inspector
            </h3>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              Z: {Math.round(zoom * 100)}%
            </span>
          </div>

          {selectedIssue ? (
            <motion.div
              key={selectedIssue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1.5 ${
                  selectedIssue.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                  selectedIssue.priority === 'High' ? 'bg-amber-55/65 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {selectedIssue.priority} Priority
                </span>
                <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{selectedIssue.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-700 font-medium">{selectedIssue.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Neighborhood:</span>
                  <span className="text-slate-700 font-medium truncate max-w-[120px]">{selectedIssue.locationName.split(',')[1] || selectedIssue.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reputation:</span>
                  <span className="text-blue-700 font-semibold">{selectedIssue.votes} votes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Verification:</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                    selectedIssue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    selectedIssue.status === 'Verified' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    selectedIssue.status === 'Disputed' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectIssue(selectedIssue)}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1 font-semibold group shadow-sm"
                >
                  Inspect Report
                  <ArrowRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : hoveredDistrict ? (
            <div className="h-44 flex flex-col justify-center items-center text-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm mb-1">
                {hoveredDistrict}
              </span>
              <p className="text-[11px] text-slate-500">Hovering Neighborhood Zone</p>
              <div className="mt-4 border-t border-slate-100 w-full pt-3 flex justify-evenly">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-blue-700">
                    {getDistrictIssuesCount(hoveredDistrict)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Active Reports</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col justify-center items-center text-center p-4">
              <Info className="w-7 h-7 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">Select any community issue pin on the map to inspect live verification, coordinates, and official statuses.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-slate-100 pt-3">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Codes</h5>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Infrastructure
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Waste Mgmt
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Parks & Rec
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Utilities
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Safety Risk
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span> Transit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
