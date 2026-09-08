import React from 'react';
import { Card } from './Card';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600',
  subtitle,
}) => {
  return (
    <Card className="hover:border-slate-300 hover:shadow-dropdown transition-all">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBgColor)}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {change && (
            <div
              className={clsx(
                'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};
