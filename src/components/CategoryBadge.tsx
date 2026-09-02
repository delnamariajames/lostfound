import React from 'react';
import { ItemCategory } from '../../server/models/types.js';
import { 
  CreditCard, 
  Smartphone, 
  Coffee, 
  BookOpen, 
  PenTool, 
  Package 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: ItemCategory;
  className?: string;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  className = '', 
  showIcon = true 
}) => {
  const config: Record<ItemCategory, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    'ID Card': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <CreditCard size={13} className="text-indigo-600 shrink-0" />,
    },
    'Electronics': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Smartphone size={13} className="text-blue-600 shrink-0" />,
    },
    'Bottle': {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      icon: <Coffee size={13} className="text-cyan-600 shrink-0" />,
    },
    'Book': {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
      icon: <BookOpen size={13} className="text-violet-600 shrink-0" />,
    },
    'Stationery': {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      icon: <PenTool size={13} className="text-teal-600 shrink-0" />,
    },
    'Other': {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Package size={13} className="text-slate-600 shrink-0" />,
    },
  };

  const item = config[category] || config['Other'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {showIcon && item.icon}
      {category}
    </span>
  );
};
