import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';
import type { EvolutionResponse } from '../types/api';

interface EvolutionChartProps {
  evolution: EvolutionResponse;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ evolution }) => {
  const { trajectory, progression_pattern, time_to_concern } = evolution;

  // Transform data for recharts
  const chartData = trajectory.map((point) => ({
    timepoint: point.timepoint,
    Asymmetry: (point.asymmetry * 100).toFixed(1),
    Border: (point.border_irregularity * 100).toFixed(1),
    Color: (point.color_variation * 100).toFixed(1),
    'Diameter (mm)': point.diameter.toFixed(1),
    'Risk Score': (point.risk_score * 100).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600" />
        <h3 className="text-xl font-bold text-gray-900">Evolution Trajectory</h3>
      </div>

      {/* Time to Concern Warning */}
      {time_to_concern !== null && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">Time to Clinical Concern</p>
              <p className="text-sm text-yellow-700">
                Estimated {time_to_concern} timepoint{time_to_concern !== 1 ? 's' : ''} until risk exceeds 70%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progression Pattern Description */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold">Analysis: </span>
          {progression_pattern}
        </p>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timepoint"
              label={{ value: 'Timepoint', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis
              label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Asymmetry"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Border"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Color"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Risk Score"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Progression Details */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Initial Risk', value: trajectory[0].risk_score, color: 'blue' },
          { label: 'Final Risk', value: trajectory[trajectory.length - 1].risk_score, color: 'red' },
          {
            label: 'Risk Change',
            value: trajectory[trajectory.length - 1].risk_score - trajectory[0].risk_score,
            color: 'yellow',
            isChange: true,
          },
          {
            label: 'Max Diameter',
            value: Math.max(...trajectory.map((p) => p.diameter)),
            color: 'green',
            unit: 'mm',
          },
        ].map((stat) => (
          <div key={stat.label} className={`p-3 bg-${stat.color}-50 rounded-lg border border-${stat.color}-200`}>
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">
              {stat.isChange && stat.value > 0 && '+'}
              {stat.unit ? stat.value.toFixed(1) : (stat.value * 100).toFixed(1)}
              {stat.unit || '%'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvolutionChart;

