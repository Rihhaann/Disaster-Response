import React, { useState, useEffect, useCallback } from 'react';
import { analyzeSituation } from './services/geminiService';
import { SensorData, DisasterResponse, SimulationPreset } from './types';
import { SensorControl } from './components/SensorControl';
import { RiskGauge } from './components/RiskGauge';
import { TacticalMap } from './components/TacticalMap';
import { ShieldAlert, AlertTriangle, Siren, ArrowRight, Loader2, Volume2, VolumeX } from 'lucide-react';

const INITIAL_SENSOR_DATA: SensorData = {
  temperature: 22,
  windSpeed: 10,
  waterLevel: 0.5,
  seismicActivity: 0,
  airQualityIndex: 40,
  precipitation: 0,
};

const INITIAL_RESPONSE: DisasterResponse = {
  risk_level: 10,
  danger_type: 'unknown',
  risk_description: "Conditions normal. Monitoring active.",
  safe_zones: [],
  recommended_route: { steps: ["Maintain situational awareness."], total_distance_km: 0, eta_min: 0 },
  crowd_density: 'low',
  alerts: [],
  sos_recommendation: 'no'
};

export default function App() {
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [analysis, setAnalysis] = useState<DisasterResponse>(INITIAL_RESPONSE);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Load geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSensorData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.warn("Geolocation failed", error);
        }
      );
    }
  }, []);

  // Analysis Loop - Debounced or triggered by user action? 
  // For a "Real-Time" feel, let's trigger it when significant data changes or manually.
  // We'll use a manual "Analyze" or auto-trigger with debounce.
  // To save API calls for this demo, we'll use a "SCAN" button and auto-scan on preset change.

  const performScan = useCallback(async (currentData: SensorData) => {
    setLoading(true);
    try {
      const result = await analyzeSituation(currentData);
      setAnalysis(result);
      setLastUpdated(new Date());
      
      // Text-to-speech for critical alerts if enabled
      if (audioEnabled && result.alerts.length > 0 && result.risk_level > 60) {
        const msg = new SpeechSynthesisUtterance(`Warning. ${result.alerts[0]}. Risk level ${result.risk_level}.`);
        window.speechSynthesis.speak(msg);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [audioEnabled]);

  const handlePreset = (preset: SimulationPreset) => {
    let newData = { ...INITIAL_SENSOR_DATA, latitude: sensorData.latitude, longitude: sensorData.longitude };
    switch (preset) {
      case SimulationPreset.WILDFIRE:
        newData = { ...newData, temperature: 45, windSpeed: 80, airQualityIndex: 450, precipitation: 0 };
        break;
      case SimulationPreset.FLOOD:
        newData = { ...newData, precipitation: 120, waterLevel: 4.5, windSpeed: 60 };
        break;
      case SimulationPreset.EARTHQUAKE:
        newData = { ...newData, seismicActivity: 7.2, windSpeed: 5 };
        break;
      case SimulationPreset.CLEAR:
      default:
        break;
    }
    setSensorData(newData);
    performScan(newData);
  };

  return (
    <div className="min-h-screen bg-sentinel-bg text-gray-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-12">
      {/* Scanline Effect */}
      <div className="scanline"></div>

      {/* Header */}
      <header className="border-b border-sentinel-border bg-sentinel-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <ShieldAlert className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg leading-none tracking-tight text-white">SENTINEL<span className="text-emerald-500">.AI</span></h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Disaster Response System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-full hover:bg-white/10 transition ${audioEnabled ? 'text-emerald-400' : 'text-gray-500'}`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 font-mono">LAST SCAN</div>
              <div className="text-sm font-mono text-emerald-500">{lastUpdated.toLocaleTimeString()}</div>
            </div>
            <button 
              onClick={() => performScan(sensorData)}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-sm px-4 py-2 rounded transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ActivityIcon />}
              SCAN NOW
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <SensorControl data={sensorData} onChange={setSensorData} onPreset={handlePreset} />
          
          {/* System Status / Crowd Density */}
          <div className="bg-sentinel-card border border-sentinel-border p-6 rounded-lg">
             <h3 className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-4">Area Analytics</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase">Crowd Density</div>
                  <div className={`text-xl font-mono font-bold uppercase ${
                    analysis.crowd_density === 'high' ? 'text-red-500' : 
                    analysis.crowd_density === 'medium' ? 'text-orange-500' : 'text-emerald-500'
                  }`}>
                    {analysis.crowd_density}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded border border-white/5">
                  <div className="text-gray-500 text-[10px] uppercase">Threat Type</div>
                  <div className="text-xl font-mono font-bold uppercase text-white truncate">
                    {analysis.danger_type}
                  </div>
                </div>
             </div>
          </div>

          {/* SOS Button - Only shows if risk is high */}
          {analysis.sos_recommendation === 'yes' && (
             <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg animate-pulse flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <Siren className="w-6 h-6" />
                BROADCAST S.O.S. BEACON
             </button>
          )}
        </div>

        {/* Middle Column: Main Viz (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
           {/* Risk Gauge */}
           <div className="bg-sentinel-card border border-sentinel-border p-6 rounded-lg relative overflow-hidden min-h-[300px] flex items-center justify-center">
              <div className="absolute top-2 right-2 text-xs font-mono text-gray-500">THREAT METER</div>
              <RiskGauge score={analysis.risk_level} dangerType={analysis.danger_type} />
           </div>

           {/* Alerts Panel */}
           <div className="bg-sentinel-card border border-sentinel-border p-0 rounded-lg overflow-hidden flex-1">
              <div className="bg-red-900/20 border-b border-red-900/30 p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-400 font-mono text-xs font-bold uppercase">Active Alerts</span>
              </div>
              <div className="p-4 space-y-2">
                {analysis.alerts.length > 0 ? analysis.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-200">
                    <span className="mt-0.5">•</span>
                    {alert}
                  </div>
                )) : (
                  <div className="text-gray-500 text-sm font-mono text-center py-4">NO ACTIVE THREATS DETECTED</div>
                )}
              </div>
           </div>
        </div>

        {/* Right Column: Evacuation (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
            {/* Tactical Map */}
            <div className="h-64">
               <TacticalMap safeZones={analysis.safe_zones} userLat={sensorData.latitude} userLng={sensorData.longitude} />
            </div>

            {/* Route Guide */}
            <div className="bg-sentinel-card border border-sentinel-border p-6 rounded-lg flex-1">
               <h3 className="text-emerald-400 font-mono text-xs uppercase tracking-wider mb-4 border-b border-emerald-900/30 pb-2">
                 Evacuation Protocol
               </h3>
               
               <div className="mb-4 flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-white">{analysis.recommended_route.total_distance_km}</span>
                 <span className="text-sm text-gray-500">KM TO SAFETY</span>
               </div>
               
               <div className="space-y-4">
                  {analysis.recommended_route.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center text-xs text-emerald-400 font-mono">
                          {idx + 1}
                        </div>
                        {idx !== analysis.recommended_route.steps.length - 1 && (
                          <div className="w-px h-full bg-emerald-900/50 my-1 group-hover:bg-emerald-500/30 transition-colors"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 py-0.5">{step}</p>
                    </div>
                  ))}
               </div>

               {analysis.recommended_route.eta_min > 0 && (
                 <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded text-center">
                   <div className="text-xs text-emerald-400 font-mono uppercase">Estimated Time to Safety</div>
                   <div className="text-xl font-bold text-white">{analysis.recommended_route.eta_min} MIN</div>
                 </div>
               )}
            </div>
        </div>

      </main>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}