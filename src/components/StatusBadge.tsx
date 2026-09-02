import React from 'react';
import { ListingStatus } from '../types.ts';
import { CheckCircle2, Clock, CheckCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: ListingStatus;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', id }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (status === 'Open') {
    return (
      <span
        id={id || 'status-badge-open'}
        className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium ${sizeClasses[size]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Clock size={iconSizes[size]} className="text-emerald-600" />
        Open
      </span>
    );
  }

  if (status === 'Claimed') {
    return (
      <span
        id={id || 'status-badge-claimed'}
        className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium ${sizeClasses[size]}`}
      >
        <CheckCircle2 size={iconSizes[size]} className="text-amber-600" />
        Claimed
      </span>
    );
  }

  // Resolved
  return (
    <span
      id={id || 'status-badge-resolved'}
      className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium ${sizeClasses[size]}`}
    >
      <CheckCheck size={iconSizes[size]} className="text-slate-500" />
      Resolved
    </span>
  );
};
