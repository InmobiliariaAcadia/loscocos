import React, { useState, useEffect } from 'react';
import { Table } from '../types';
import { X, Check } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableData: { name: string; capacity: number; shape: Table['shape']; id?: string }) => void;
  editingTable?: Table | null;
}

export const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onSave, editingTable }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [shape, setShape] = useState<Table['shape']>('circle');

  useEffect(() => {
    if (editingTable) {
      setName(editingTable.name);
      setCapacity(editingTable.capacity);
      setShape(editingTable.shape);
    } else {
      setName('');
      setCapacity(8);
      setShape('circle'); // Default
    }
  }, [editingTable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name: name || `Table ${Math.floor(Math.random() * 1000)}`, 
      capacity, 
      shape,
      id: editingTable?.id 
    });
    onClose();
  };

  const shapes: { id: Table['shape']; label: string; class: string }[] = [
    { id: 'circle', label: 'Circle', class: 'rounded-full aspect-square' },
    { id: 'rectangle', label: 'Rectangle', class: 'rounded-md aspect-[3/2]' },
    { id: 'square', label: 'Square', class: 'rounded-none aspect-square' },
    { id: 'oval', label: 'Oval', class: 'rounded-[50%] aspect-[2/1]' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {editingTable ? 'Edit Table' : 'Add New Table'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Head Table"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-12 text-center font-mono font-bold text-lg bg-gray-50 py-1 rounded border">
                  {capacity}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
              <div className="grid grid-cols-4 gap-3">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShape(s.id)}
                    className={`
                      relative group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                      ${shape === s.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-500'}
                    `}
                  >
                    <div className={`w-8 bg-current opacity-20 border-2 border-current mb-2 ${s.class}`}></div>
                    <span className="text-[10px] font-medium uppercase tracking-wide">{s.label}</span>
                    {shape === s.id && (
                      <div className="absolute top-1 right-1 text-primary">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg shadow hover:bg-indigo-600 active:scale-95 transition-all"
            >
              Save Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};