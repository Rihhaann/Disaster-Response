import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskGaugeProps {
  score: number;
  dangerType: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, dangerType }) => {
  const data = [
    { name: 'Risk', value: score },
    { name: 'Safe', value: 100 - score },
  ];

  let color = '#10b981'; // green
  if (score > 40) color = '#f97316'; // orange
  if (score > 75) color = '#ef4444'; // red

  return (
    <div className="relative h-64 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="risk" fill={color} />
            <Cell key="safe" fill="#27272a" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
        <div className="text-5xl font-mono font-bold text-white tracking-tighter">{score}</div>
        <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Risk Index</div>
      </div>
      <div className="absolute bottom-4 uppercase text-center font-mono text-sm tracking-wider">
        STATUS: <span style={{ color }} className="font-bold">{score > 75 ? 'CRITICAL' : score > 40 ? 'WARNING' : 'STABLE'}</span>
      </div>
    </div>
  );
};