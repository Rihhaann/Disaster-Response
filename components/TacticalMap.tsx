import React from 'react';
import { SafeZone } from '../types';
import { MapPin, Navigation, LocateFixed } from 'lucide-react';

interface TacticalMapProps {
  safeZones: SafeZone[];
  userLat?: number;
  userLng?: number;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ safeZones, userLat, userLng }) => {
  // We can't render a real Google Map easily without a key for the JS API (different from GenAI key).
  // We will create a "Radar" aesthetic visualization.

  return (
    <div className="bg-sentinel-card border border-sentinel-border rounded-lg p-4 h-full flex flex-col relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }}>
        </div>

        {/* Radar Sweep Animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent w-[200%] h-[200%] -top-[50%] -left-[50%] animate-spin-slow pointer-events-none opacity-20"></div>
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-emerald-500 font-mono text-sm font-bold flex items-center gap-2">
                    <LocateFixed className="w-4 h-4" />
                    TACTICAL GRID
                </h3>
                {userLat && (
                    <div className="text-[10px] font-mono text-emerald-600/60">
                        LAT: {userLat.toFixed(4)} <br/>
                        LNG: {userLng.toFixed(4)}
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center relative">
                 {/* User Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                    <div className="w-12 h-12 border border-emerald-500/30 rounded-full absolute -top-4 -left-4 animate-ping"></div>
                </div>

                {/* Safe Zones (Abstracted positions for demo aesthetic) */}
                {safeZones.map((zone, idx) => {
                    // Randomly position them around the center for the "radar" look
                    // In a real map, we'd project lat/lng to pixels.
                    // This is strictly for visual flair as requested by "Dashboard" style without Maps API
                    const angle = (idx / (safeZones.length || 1)) * 2 * Math.PI;
                    const distance = 40 + (Math.random() * 60); // px from center
                    const top = `calc(50% + ${Math.sin(angle) * distance}px)`;
                    const left = `calc(50% + ${Math.cos(angle) * distance}px)`;
                    
                    return (
                        <div key={idx} className="absolute flex flex-col items-center group" style={{ top, left }}>
                            <MapPin className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                            <span className="text-[10px] font-mono bg-black/80 px-1 rounded text-sky-200 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {zone.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 border-t border-sentinel-border pt-4">
                <h4 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Identified Safe Zones</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {safeZones.length === 0 ? (
                        <div className="text-xs text-gray-600 font-mono italic">Scanning area...</div>
                    ) : safeZones.map((zone, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs hover:bg-white/10 transition">
                            <span className="text-gray-200 font-medium truncate max-w-[60%]">{zone.name}</span>
                            <div className="flex items-center gap-3 text-gray-400 font-mono">
                                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {zone.distance_km}km</span>
                                <span>{zone.eta_min}m</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};