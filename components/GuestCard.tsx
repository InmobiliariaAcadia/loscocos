import React from 'react';
import { Guest } from '../types';
import { User, GripVertical, Heart } from 'lucide-react';

interface GuestCardProps {
  guest: Guest;
  onDragStart: (e: React.DragEvent, guestId: string) => void;
  onClick?: () => void;
  variant?: 'card' | 'avatar' | 'compact';
}

export const GuestCard: React.FC<GuestCardProps> = ({ guest, onDragStart, onClick, variant = 'card' }) => {
  const getGroupColor = (group: string) => {
    // New vibrant palette to match Coral/Blue theme
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
      case 'A': return 'bg-yellow-500 ring-yellow-200'; // Always - Gold
      case 'B': return 'bg-primary ring-orange-200';   // Occasional - Coral
      case 'C': return 'bg-slate-400 ring-slate-200'; // New - Slate
      case 'D': return 'bg-gray-300 ring-gray-100'; // First time - Gray
      default: return 'bg-gray-300 ring-gray-100';
    }
  };

  const colorClass = getGroupColor(guest.group);
  const displayName = variant === 'avatar' && guest.seatingName ? guest.seatingName : guest.name;

  // Avatar Variant (For Visual Table)
  if (variant === 'avatar') {
    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, guest.id)}
        onClick={onClick}
        className="group relative cursor-grab active:cursor-grabbing flex flex-col items-center justify-center"
      >
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-transform hover:scale-110 z-10 bg-white
          ${colorClass}
        `}>
          <span className="font-bold text-xs">{displayName.charAt(0)}</span>
          {/* Classification Dot on Avatar */}
          <div 
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getClassificationColor(guest.classification)} z-20`} 
            title={`Class: ${guest.classification}`}
          />
        </div>
        
        {/* Seating Name Label beneath avatar - Enhanced Visibility */}
        <span className="mt-1.5 text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full shadow-sm border border-slate-200 truncate max-w-[90px] text-center leading-tight backdrop-blur-sm z-20">
            {displayName}
        </span>
        
        {/* Tooltip Full Name */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
          {guest.name}
          {guest.isCouple && <span className="ml-1 text-rose-300">♥</span>}
        </div>
      </div>
    );
  }

  // Card & Compact Variant (For Sidebar or List View)
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, guest.id)}
      onClick={onClick}
      className={`
        relative group flex items-center gap-2 rounded-lg border bg-white shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none
        ${variant === 'compact' ? 'py-1 px-2 mb-1 border-slate-100' : 'p-2 mb-2 border-slate-200'}
      `}
    >
      {variant !== 'compact' && <GripVertical size={16} className="text-slate-300" />}
      
      <div className={`
        flex-shrink-0 rounded-full flex items-center justify-center
        ${variant === 'compact' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'}
        ${colorClass}
      `}>
        {variant === 'compact' ? guest.name.charAt(0) : <User size={16} />}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className={`font-medium truncate text-slate-700 ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
            {guest.name}
          </div>

          {/* Indicators for Compact View */}
          {variant === 'compact' && (
             <div className="flex items-center gap-1.5 ml-2">
                 {guest.isCouple && (
                     <Heart size={10} className="text-rose-500 fill-rose-500" />
                 )}
                 <div 
                     className={`w-2 h-2 rounded-full ring-1 ${getClassificationColor(guest.classification)}`} 
                     title={`Class: ${guest.classification}`}
                 />
             </div>
          )}
        </div>
        
        {/* Extended info for standard Card view */}
        {variant !== 'compact' && (
          <div className="text-xs text-slate-500 flex items-center mt-0.5">
            <span className="truncate max-w-[80px] text-slate-400 mr-2">{guest.group}</span>
            <div className="flex items-center gap-2 ml-auto">
                {guest.isCouple && <Heart size={12} className="text-rose-400" />}
                <div 
                    className={`w-2 h-2 rounded-full ring-1 ${getClassificationColor(guest.classification)}`} 
                    title={`Class: ${guest.classification}`} 
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};