import React from 'react';
import { SensorData, SimulationPreset } from '../types';
import { Wind, Thermometer, Waves, Activity, CloudRain, Flame } from 'lucide-react';

interface SensorControlProps {
  data: SensorData;
  onChange: (newData: SensorData) => void;
  onPreset: (preset: SimulationPreset) => void;
}

export const SensorControl: React.FC<SensorControlProps> = ({ data, onChange, onPreset }) => {
  const handleChange = (key: keyof SensorData, value: number) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="bg-sentinel-card border border-sentinel-border p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-mono font-bold text-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          TELEMETRY INPUT
        </h2>
        <div className="flex gap-2">
          <button onClick={() => onPreset(SimulationPreset.CLEAR)} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300 transition">CLEAR</button>
          <button onClick={() => onPreset(SimulationPreset.WILDFIRE)} className="text-xs bg-orange-900/50 hover:bg-orange-900 px-3 py-1 rounded text-orange-200 border border-orange-800 transition">FIRE</button>
          <button onClick={() => onPreset(SimulationPreset.FLOOD)} className="text-xs bg-blue-900/50 hover:bg-blue-900 px-3 py-1 rounded text-blue-200 border border-blue-800 transition">FLOOD</button>
          <button onClick={() => onPreset(SimulationPreset.EARTHQUAKE)} className="text-xs bg-red-900/50 hover:bg-red-900 px-3 py-1 rounded text-red-200 border border-red-800 transition">QUAKE</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> TEMP (°C)</span>
            <span className="text-white">{data.temperature}°</span>
          </div>
          <input
            type="range"
            min="-30"
            max="100"
            value={data.temperature}
            onChange={(e) => handleChange('temperature', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        {/* Wind Speed */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> WIND (km/h)</span>
            <span className="text-white">{data.windSpeed}</span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            value={data.windSpeed}
            onChange={(e) => handleChange('windSpeed', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Water Level */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Waves className="w-3 h-3" /> WATER (m)</span>
            <span className="text-white">{data.waterLevel}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={data.waterLevel}
            onChange={(e) => handleChange('waterLevel', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

         {/* Seismic */}
         <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> SEISMIC (R)</span>
            <span className="text-white">{data.seismicActivity}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={data.seismicActivity}
            onChange={(e) => handleChange('seismicActivity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

         {/* AQI */}
         <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> AQI</span>
            <span className="text-white">{data.airQualityIndex}</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={data.airQualityIndex}
            onChange={(e) => handleChange('airQualityIndex', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
        </div>

        {/* Precipitation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> RAIN (mm/h)</span>
            <span className="text-white">{data.precipitation}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={data.precipitation}
            onChange={(e) => handleChange('precipitation', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-300"
          />
        </div>
      </div>
    </div>
  );
};