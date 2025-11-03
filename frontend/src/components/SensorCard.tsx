'use client';

import { Thermometer } from 'lucide-react';

interface SensorData {
  id: string;
  name: string;
  temperature: number;
  unit: string;
}

interface SensorCardProps {
  sensor: SensorData;
}

function getStatusColor(temp: number): { bg: string; text: string; status: string } {
  if (temp < 20) return { bg: 'bg-blue-500/10', text: 'text-blue-500', status: '正常' };
  if (temp < 30) return { bg: 'bg-green-500/10', text: 'text-green-500', status: '正常' };
  if (temp < 40) return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', status: '警告' };
  return { bg: 'bg-red-500/10', text: 'text-red-500', status: '危险' };
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const { bg, text, status } = getStatusColor(sensor.temperature);

  return (
    <div className={`${bg} rounded-lg p-4 border border-slate-700 transition-all hover:border-slate-600`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className={`w-5 h-5 ${text}`} />
          <h3 className="font-medium text-slate-200">{sensor.name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${text} ${bg}`}>
          {status}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${text}`}>
          {sensor.temperature.toFixed(1)}
        </span>
        <span className="text-slate-400">{sensor.unit}</span>
      </div>
    </div>
  );
}
