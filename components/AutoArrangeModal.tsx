import React, { useState } from 'react';
import { Sparkles, X, Users, Split, Check, Info } from 'lucide-react';

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
            <h3 className="text-lg font-bold">Configuración de Organización IA</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemini analizará tu lista de invitados y mesas para crear la distribución ideal basada en estas reglas.
            </p>
          </div>

          <div className="space-y-4">
            {/* Rule 1: Alternate Gender */}
            <div 
              className={`
                flex flex-col gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all
                ${alternateGender ? 'border-primary bg-rose-50 ring-4 ring-primary/5' : 'border-slate-100 hover:border-slate-200'}
              `}
              onClick={() => setAlternateGender(!alternateGender)}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${alternateGender ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}
                `}>
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Intercalar Género</div>
                </div>
                {alternateGender && <Check size={20} className="text-primary" />}
              </div>
              <p className="text-[11px] text-slate-500 ml-13 mt-1">
                Acomoda a los invitados siguiendo un patrón Hombre-Mujer para equilibrar las mesas socialmente.
              </p>
            </div>

            {/* Rule 2: Separate Couples */}
            <div 
              className={`
                flex flex-col gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all
                ${separateCouples ? 'border-primary bg-rose-50 ring-4 ring-primary/5' : 'border-slate-100 hover:border-slate-200'}
              `}
              onClick={() => setSeparateCouples(!separateCouples)}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${separateCouples ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}
                `}>
                  <Split size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">Separar Parejas</div>
                </div>
                {separateCouples && <Check size={20} className="text-primary" />}
              </div>
              <p className="text-[11px] text-slate-500 ml-13 mt-1">
                Fomenta la socialización sentando a los compañeros en diferentes lugares o mesas opuestas.
              </p>
            </div>
          </div>

          {/* Extra Constraints */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instrucciones Adicionales</label>
            <textarea
              className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none min-h-[100px] transition-all resize-none"
              placeholder="e.g. Mantén a las familias juntas, niños en mesas separadas, mezcla grupos de amigos..."
              value={extraConstraints}
              onChange={(e) => setExtraConstraints(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">
              * Puedes escribir instrucciones en lenguaje natural.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
          >
            <Sparkles size={18} />
            Generar Plano Inteligente
          </button>
        </div>
      </div>
    </div>
  );
};