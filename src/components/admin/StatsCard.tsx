import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: number;
  color?: 'yellow' | 'green' | 'blue' | 'gray' | 'red';
}

const colorMap = {
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  gray: 'bg-gray-50 text-gray-600 border-gray-100',
  red: 'bg-red-50 text-red-600 border-red-100'
};

export function StatsCard({ icon, label, value, color = 'gray' }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
