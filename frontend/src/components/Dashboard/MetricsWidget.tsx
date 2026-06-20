import React from 'react';

interface MetricsWidgetProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; isPositive: boolean };
  colorClass: string;
}

const MetricsWidget: React.FC<MetricsWidgetProps> = ({ title, value, icon: Icon, trend, colorClass }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 font-medium text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 backdrop-blur-md ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2 mt-4 text-sm font-medium">
          <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsWidget;
