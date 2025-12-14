
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
        // Blue Theme
        return 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-200';
      case 'Female':
        // Red/Rose Theme
        return 'bg-rose-100 text-rose-700 border-rose-300 ring-rose-200';
      default: 
        // Non-binary or other (Purple)
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

  // Selected Style Override
  const selectedAvatarStyle = isSelected 
    ? 'ring-2 ring-primary ring-offset-2 z-20 scale-110 shadow-xl' 
    : '';

  // Touch Handlers for Mobile Drag and Drop
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    // Clear any existing timeout
    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);

    // Long press to initiate drag (200ms)
    dragTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      
      // Notify App
      onDragStart(null, guest.id);
      if(navigator.vibrate) navigator.vibrate(50); // Haptic feedback

      // Create ghost element
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
      ghost.style.backgroundColor = 'white'; // Ensure ghost has background
      
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      // Dim original
      target.style.opacity = '0.4';
    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && ghostRef.current) {
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      ghostRef.current.style.left = `${touch.clientX}px`;
      ghostRef.current.style.top = `${touch.clientY}px`;
    } else {
      // If moved before timeout triggers, it's a scroll or tap
      clearTimeout(dragTimeoutRef.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(dragTimeoutRef.current);
    
    // Restore opacity
    (e.currentTarget as HTMLElement).style.opacity = '1';

    if (isDraggingRef.current) {
      // It was a drag
      e.preventDefault(); // Prevent click
      
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }

      // Find drop target
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

  // Avatar Variant (For Visual Table)
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
        className={`group relative cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${isSelected ? 'z-50' : 'z-10'}`}
      >
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-200
          ${colorClass} ${selectedAvatarStyle}
        `}>
          <span className="font-bold text-xs">{displayName.charAt(0)}</span>
          <div 
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getClassificationColor(guest.classification)}`} 
          />
        </div>
        
        {isSelected && (
           <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-sm z-30 animate-in zoom-in duration-200">
             <CheckCircle2 size={10} strokeWidth={3} />
           </div>
        )}
        
        <span className={`
          mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border truncate max-w-[90px] text-center leading-tight backdrop-blur-sm transition-colors duration-200
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
        <div className="absolute top-1 right-1 text-primary animate-in zoom-in duration-200">
          <CheckCircle2 size={14} className="fill-white" />
        </div>
      )}
    </div>
  );
};
