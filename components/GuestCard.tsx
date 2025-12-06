import React from 'react';
import { Guest } from '../types';
import { User, GripVertical, Heart, Edit2 } from 'lucide-react';

interface GuestCardProps {
  guest: Guest;
  onDragStart: (e: React.DragEvent, guestId: string) => void;
  onClick?: () => void;
  onEdit?: () => void;
  variant?: 'card' | 'avatar' | 'compact';
  isSelected?: boolean;
}

export const GuestCard: React.FC<GuestCardProps> = ({ 
  guest, 
  onDragStart, 
  onClick, 
  onEdit,
  variant = 'card',
  isSelected = false
}) => {
  const getGroupColor = (group: string) => {
    const colors = [
      'bg-rose-100 text-rose-800 border-rose-200 ring-rose-300',
      'bg-blue-100 text-blue-800 border-blue-200 ring-blue-300',
      'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-300',
      'bg-violet-100 text-violet-800 border-violet-200 ring-violet-300',
      'bg-cyan-100 text-cyan-800 border-cyan-200 ring-cyan-300',
      'bg-amber-100 text-amber-800 border-amber-200 ring-amber-300',
    ];
    let hash = 0;
    for (let i = 0; i < group.length; i++) {
      hash = group.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getClassificationColor = (cls: string) => {
    switch (cls) {
      case 'A': return 'bg-yellow-500 ring-yellow-200';
      case 'B': return 'bg-primary ring-orange-200';
      case 'C': return 'bg-slate-400 ring-slate-200';
      case 'D': return 'bg-gray-300 ring-gray-100';
      default: return 'bg-gray-300 ring-gray-100';
    }
  };

  const colorClass = getGroupColor(guest.group);
  const displayName = variant === 'avatar' && guest.seatingName ? guest.seatingName : guest.name;

  // Selected Style Override
  const selectedStyle = isSelected 
    ? 'ring-4 ring-primary ring-offset-2 z-10 scale-105 shadow-lg' 
    : '';

  // Avatar Variant (For Visual Table)
  if (variant === 'avatar') {
    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, guest.id)}
        onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        className={`group relative cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${isSelected ? 'z-50' : 'z-10'}`}
      >
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm bg-white
          ${colorClass} ${selectedStyle}
        `}>
          <span className="font-bold text-xs">{displayName.charAt(0)}</span>
          <div 
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getClassificationColor(guest.classification)}`} 
          />
        </div>
        
        <span className={`
          mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border truncate max-w-[90px] text-center leading-tight backdrop-blur-sm
          ${isSelected ? 'bg-primary text-white border-primary' : 'text-slate-700 bg-white/95 border-slate-200'}
        `}>
            {displayName}
        </span>
      </div>
    );
  }

  // Card & Compact Variant
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, guest.id)}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      className={`
        relative group flex items-center gap-2 rounded-lg border bg-white shadow-sm hover:shadow-md cursor-pointer select-none transition-all
        ${variant === 'compact' ? 'py-2 px-2.5 mb-0 border-slate-100 h-full' : 'p-2 mb-2 border-slate-200'}
        ${isSelected ? 'border-primary ring-2 ring-primary/50 ring-offset-1 bg-rose-50' : ''}
      `}
    >
      {variant !== 'compact' && <GripVertical size={16} className="text-slate-300" />}
      
      <div className={`
        flex-shrink-0 rounded-full flex items-center justify-center
        ${variant === 'compact' ? 'w-8 h-8 text-xs' : 'w-8 h-8 text-xs'}
        ${colorClass}
      `}>
        {variant === 'compact' ? guest.name.charAt(0) : <User size={16} />}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className={`font-medium truncate text-slate-700 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
            {guest.name}
          </div>

          {variant === 'compact' && (
             <div className="flex items-center gap-1.5 ml-2">
                 {guest.isCouple && <Heart size={10} className="text-rose-500 fill-rose-500" />}
             </div>
          )}
        </div>
        
        {variant !== 'compact' && (
          <div className="text-xs text-slate-500 flex items-center mt-0.5">
            <span className="truncate max-w-[80px] text-slate-400 mr-2">{guest.group}</span>
            <div className="flex items-center gap-2 ml-auto">
                {guest.isCouple && <Heart size={12} className="text-rose-400" />}
                <div className={`w-2 h-2 rounded-full ring-1 ${getClassificationColor(guest.classification)}`} />
            </div>
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="ml-2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};