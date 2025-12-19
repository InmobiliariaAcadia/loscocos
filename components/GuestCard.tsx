import React, { useRef } from 'react';
import { Guest } from '../types';
import { User, GripVertical, Heart, Edit2, CheckCircle2 } from 'lucide-react';

interface GuestCardProps {
  guest: Guest;
  onDragStart: (e: React.DragEvent | null, guestId: string) => void;
  onClick?: () => void;
  onEdit?: () => void;
  variant?: 'card' | 'avatar' | 'compact';
  isSelected?: boolean;
  onTouchDragEnd?: (tableId: string, seatIndex?: number) => void;
}

export const GuestCard: React.FC<GuestCardProps> = ({ 
  guest, 
  onDragStart, 
  onClick, 
  onEdit,
  variant = 'card',
  isSelected = false,
  onTouchDragEnd
}) => {
  const ghostRef = useRef<HTMLElement | null>(null);
  const dragTimeoutRef = useRef<any>(null);
  const isDraggingRef = useRef(false);

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'Male':
        return 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-200';
      case 'Female':
        return 'bg-rose-100 text-rose-700 border-rose-300 ring-rose-200';
      default: 
        return 'bg-purple-100 text-purple-700 border-purple-300 ring-purple-200';
    }
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

  const colorClass = getGenderColor(guest.gender);
  const displayName = variant === 'avatar' && guest.seatingName ? guest.seatingName : guest.name;

  const selectedAvatarStyle = isSelected 
    ? 'ring-2 ring-primary ring-offset-2 z-20 scale-110 shadow-xl' 
    : '';

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);

    dragTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      onDragStart(null, guest.id);
      if(navigator.vibrate) navigator.vibrate(50);

      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.left = `${startX}px`;
      ghost.style.top = `${startY}px`;
      ghost.style.width = `${target.offsetWidth}px`;
      ghost.style.height = `${target.offsetHeight}px`;
      ghost.style.opacity = '0.8';
      ghost.style.zIndex = '9999';
      ghost.style.pointerEvents = 'none';
      ghost.style.transform = 'translate(-50%, -50%) scale(1.1)';
      ghost.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
      ghost.style.backgroundColor = 'white'; 
      
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
      target.style.opacity = '0.4';
    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && ghostRef.current) {
      e.preventDefault(); 
      const touch = e.touches[0];
      ghostRef.current.style.left = `${touch.clientX}px`;
      ghostRef.current.style.top = `${touch.clientY}px`;
    } else {
      clearTimeout(dragTimeoutRef.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(dragTimeoutRef.current);
    (e.currentTarget as HTMLElement).style.opacity = '1';

    if (isDraggingRef.current) {
      e.preventDefault(); 
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
      const touch = e.changedTouches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const dropZone = elements.find(el => el.hasAttribute('data-drop-target'));

      if (dropZone && onTouchDragEnd) {
        const tableId = dropZone.getAttribute('data-table-id');
        const seatIndexStr = dropZone.getAttribute('data-seat-index');
        if (tableId) {
          onTouchDragEnd(tableId, seatIndexStr ? parseInt(seatIndexStr) : undefined);
        }
      }
      isDraggingRef.current = false;
    }
  };

  if (variant === 'avatar') {
    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, guest.id)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => { 
          if (!isDraggingRef.current) {
            e.stopPropagation(); 
            onClick && onClick(); 
          }
        }}
        className={`group relative cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${isSelected ? 'z-50' : 'z-20'}`}
      >
        {/* Label on Top - We increase z-index and use pointer-events-none to prevent it from blocking interactions with the bubble */}
        <div className={`
          absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 rounded-full shadow-lg border truncate max-w-[130px] text-center leading-tight backdrop-blur-md transition-all duration-200 pointer-events-none z-[200]
          ${isSelected ? 'bg-primary text-white border-primary scale-110' : 'text-slate-900 bg-white/95 border-slate-300'}
        `}>
          <span className="text-[11px] font-black tracking-tight">{displayName}</span>
        </div>

        {/* Bubble Below - Lower z-index than the label above it */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-200 z-10
          ${colorClass} ${selectedAvatarStyle}
        `}>
          <span className="font-bold text-xs">{displayName.charAt(0)}</span>
          <div 
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getClassificationColor(guest.classification)}`} 
          />
        </div>
        
        {isSelected && (
           <div className="absolute top-0 -right-2 bg-primary text-white rounded-full p-0.5 shadow-sm z-[210] animate-in zoom-in duration-200">
             <CheckCircle2 size={12} strokeWidth={3} />
           </div>
        )}
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, guest.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => { 
        if (!isDraggingRef.current) {
           e.stopPropagation(); 
           onClick && onClick(); 
        }
      }}
      className={`
        relative group flex items-center gap-2 rounded-lg border shadow-sm cursor-pointer select-none transition-all duration-200
        ${variant === 'compact' ? 'py-2 px-2.5 mb-0 h-full' : 'p-2 mb-2'}
        ${isSelected 
            ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' 
            : 'bg-white border-slate-200 hover:border-primary/30 hover:shadow-md'}
      `}
    >
      {variant !== 'compact' && <GripVertical size={16} className={`transition-colors ${isSelected ? 'text-primary' : 'text-slate-300'}`} />}
      
      <div className={`
        flex-shrink-0 rounded-full flex items-center justify-center transition-all
        ${variant === 'compact' ? 'w-8 h-8 text-xs' : 'w-8 h-8 text-xs'}
        ${colorClass} ${isSelected ? 'ring-2 ring-offset-1 ring-primary/30' : ''}
      `}>
        {variant === 'compact' ? guest.name.charAt(0) : <User size={16} />}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className={`font-medium truncate transition-colors ${variant === 'compact' ? 'text-xs' : 'text-sm'} ${isSelected ? 'text-primary font-bold' : 'text-slate-700'}`}>
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

      {isSelected && (
        <div className="absolute top-1 right-1 text-primary animate-in zoom-in duration-200 z-50">
          <CheckCircle2 size={14} className="fill-white" />
        </div>
      )}
    </div>
  );
};