import React from 'react';

interface ClickDetail {
  label: string;
  count: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  clickDetails?: ClickDetail[]; // Para mostrar detalles de clicks
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon, color, clickDetails }) => (
  <div className={`bg-[#232323] rounded-xl p-6 flex flex-col shadow-md min-w-[220px] ${color ?? ''}`}>
    <div className="flex items-center mb-2">
      <div className="mr-4 text-2xl">{icon}</div>
      <div>
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{title}</div>
        <div className="text-white text-xl font-semibold">{value}</div>
      </div>
    </div>
    {clickDetails && clickDetails.length > 0 && (
      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">Clicks breakdown:</div>
        <ul className="text-xs text-gray-300 space-y-1">
          {clickDetails.map((detail, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{detail.label}</span>
              <span className="font-semibold">{detail.count}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export type { ClickDetail };
export default AnalyticsCard;
