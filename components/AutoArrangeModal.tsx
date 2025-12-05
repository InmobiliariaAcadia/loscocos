import React, { useState } from 'react';
import { Sparkles, X, Users, Split, Check } from 'lucide-react';

interface AutoArrangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { alternateGender: boolean; separateCouples: boolean; extraConstraints: string }) => void;
  initialConstraints: string;
}

export const AutoArrangeModal: React.FC<AutoArrangeModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  initialConstraints
}) => {
  const [alternateGender, setAlternateGender] = useState(false);
  const [separateCouples, setSeparateCouples] = useState(false);
  const [extraConstraints, setExtraConstraints] = useState(initialConstraints);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ alternateGender, separateCouples, extraConstraints });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-rose-200" />
            <h3 className="text-lg font-bold">Auto-Arrange Settings</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-500">
            Configure how the AI should organize the tables.
          </p>

          <div className="space-y-3">
            {/* Rule 1: Alternate Gender */}
            <div 
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${alternateGender ? 'border-primary bg-rose-50' : 'border-slate-100 hover:border-slate-200'}
              `}
              onClick={() => setAlternateGender(!alternateGender)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${alternateGender ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                <Users size={20} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">Hombres y mujeres intercalados</div>
                <div className="text-xs text-slate-500">Boy-Girl-Boy-Girl pattern</div>
              </div>
              {alternateGender && <Check size={20} className="text-primary" />}
            </div>

            {/* Rule 2: Separate Couples */}
            <div 
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${separateCouples ? 'border-primary bg-rose-50' : 'border-slate-100 hover:border-slate-200'}
              `}
              onClick={() => setSeparateCouples(!separateCouples)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${separateCouples ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                <Split size={20} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">Parejas separadas</div>
                <div className="text-xs text-slate-500">Do not seat partners next to each other</div>
              </div>
              {separateCouples && <Check size={20} className="text-primary" />}
            </div>
          </div>

          {/* Extra Constraints */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Instructions</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]"
              placeholder="e.g. Keep families together, put kids at a separate table..."
              value={extraConstraints}
              onChange={(e) => setExtraConstraints(e.target.value)}
            />
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Generate Seating Plan
          </button>
        </div>
      </div>
    </div>
  );
};