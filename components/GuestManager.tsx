import React, { useState } from 'react';
import { Guest, Gender, AgeGroup } from '../types';
import { Search, UserPlus, ArrowRight, Check, X, Users, Trash2, Edit2, ArrowLeft, Save, Palmtree, Filter, XCircle } from 'lucide-react';

interface GuestManagerProps {
  guests: Guest[];
  onUpdateGuest: (guest: Guest) => void;
  onAddGuest: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onProceed: () => void;
  onBack: () => void;
  onSave: () => void;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  guests,
  onUpdateGuest,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
  onProceed,
  onBack,
  onSave
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'invited' | 'not-invited'>('all');
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | AgeGroup>('all');
  const [coupleFilter, setCoupleFilter] = useState<'all' | 'couple' | 'single'>('all');

  const filteredGuests = guests.filter(g => {
    // 1. Search Term
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.group.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    // 2. Primary Status Filter
    if (filter === 'invited' && !g.isInvited) return false;
    if (filter === 'not-invited' && g.isInvited) return false;

    // 3. Advanced Filters
    if (genderFilter !== 'all' && g.gender !== genderFilter) return false;
    if (ageFilter !== 'all' && g.ageGroup !== ageFilter) return false;
    if (coupleFilter === 'couple' && !g.isCouple) return false;
    if (coupleFilter === 'single' && g.isCouple) return false;

    return true;
  });

  const clearAdvancedFilters = () => {
    setGenderFilter('all');
    setAgeFilter('all');
    setCoupleFilter('all');
  };

  const hasActiveAdvancedFilters = genderFilter !== 'all' || ageFilter !== 'all' || coupleFilter !== 'all';

  const toggleInvited = (e: React.MouseEvent, guest: Guest) => {
    e.stopPropagation();
    onUpdateGuest({ ...guest, isInvited: !guest.isInvited });
  };

  const invitedCount = guests.filter(g => g.isInvited).length;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      
      {/* HEADER SECTION - Flex Child (Not Fixed) */}
      <div className="bg-white border-b border-slate-200 z-10 shrink-0">
        
        {/* Top Bar */}
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="md:hidden bg-rose-50 p-1.5 rounded-full">
                    <Palmtree size={20} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Guest Registry</h1>
                    <p className="text-xs md:text-sm text-slate-500">Manage database</p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={onSave} className="text-primary hover:bg-rose-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Save size={18} /> Save
              </button>
              <div className="bg-rose-50 text-rose-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-rose-100">
                  <Users size={18} /> <span>{invitedCount} Invited</span>
              </div>
              <button onClick={onProceed} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-colors">
                  Go to Seating <ArrowRight size={18} />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-3">
                <button onClick={onSave} className="p-2 text-primary bg-rose-50 rounded-full active:bg-rose-100">
                    <Save size={18} />
                </button>
                <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1">
                    <Users size={12} /> {invitedCount}
                </div>
            </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 md:px-8 pb-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 md:bg-white border border-transparent md:border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-base"
              />
            </div>
            
            <div className="flex gap-2">
               <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium transition-colors ${hasActiveAdvancedFilters || showFilters ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-100 border-transparent text-slate-600'}`}
                >
                  <Filter size={18} /> <span className="hidden md:inline">Filters</span>
                  {hasActiveAdvancedFilters && <span className="w-2 h-2 rounded-full bg-primary"></span>}
               </button>

               <div className="flex bg-slate-100 md:bg-white rounded-lg p-1 border border-transparent md:border-slate-300 shrink-0 overflow-hidden">
                <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'all' ? 'bg-white md:bg-slate-100 shadow-sm' : 'text-slate-500'}`}>All</button>
                <button onClick={() => setFilter('invited')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'invited' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-500'}`}>Invited</button>
                <button onClick={() => setFilter('not-invited')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'not-invited' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Uninvited</button>
              </div>
              
              <button onClick={onAddGuest} className="ml-auto flex items-center gap-2 bg-primary/10 text-primary font-bold hover:bg-primary/20 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                <UserPlus size={16} /> <span className="hidden md:inline">Register New</span><span className="md:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-100">
               <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <select 
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value as any)}
                  >
                    <option value="all">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>

                  <select 
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value as any)}
                  >
                    <option value="all">Any Age</option>
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Teen">Teen</option>
                    <option value="Senior">Senior</option>
                  </select>

                  <select 
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={coupleFilter}
                    onChange={(e) => setCoupleFilter(e.target.value as any)}
                  >
                    <option value="all">Any Status</option>
                    <option value="couple">Couples Only</option>
                    <option value="single">Singles Only</option>
                  </select>
               </div>
               {hasActiveAdvancedFilters && (
                 <div className="flex justify-end mt-2">
                    <button onClick={clearAdvancedFilters} className="text-xs text-rose-500 flex items-center gap-1 hover:underline">
                      <XCircle size={12} /> Clear filters
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* LIST SECTION - Flex Child (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 pt-4 bg-slate-50">
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredGuests.map(guest => (
             <div 
               key={guest.id}
               onClick={() => onEditGuest(guest)}
               className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all flex items-center gap-3 ${guest.isInvited ? 'ring-1 ring-emerald-500/20' : 'opacity-80 grayscale-[0.5]'}`}
             >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${guest.isInvited ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  {guest.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 truncate">{guest.name}</h3>
                      {guest.isCouple && <span className="text-red-500 text-[10px]">♥</span>}
                   </div>
                   <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{guest.group}</span>
                      <span className="text-[10px]">{guest.classification}</span>
                   </div>
                </div>
                <div onClick={(e) => toggleInvited(e, guest)} className={`h-8 w-14 rounded-full p-1 transition-colors flex items-center cursor-pointer ${guest.isInvited ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-200 flex items-center justify-center ${guest.isInvited ? 'translate-x-6' : 'translate-x-0'}`}>
                      {guest.isInvited ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-300" />}
                    </div>
                </div>
             </div>
          ))}
          {filteredGuests.length === 0 && <div className="text-center py-12 text-slate-400">No guests found.</div>}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Guest Name</th>
                <th className="px-6 py-4">Invited By</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 text-center">Invited?</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map(guest => (
                <tr key={guest.id} className={`hover:bg-slate-50 transition-colors ${guest.isInvited ? '' : 'opacity-60 bg-slate-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${guest.isInvited ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>{guest.name.charAt(0)}</div>
                      <div>
                        <div className="font-medium text-slate-900">{guest.name}</div>
                        {guest.isCouple && <div className="text-xs text-red-500">Couple</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded">{guest.group}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-600">{guest.classification}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={(e) => toggleInvited(e, guest)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${guest.isInvited ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${guest.isInvited ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => onEditGuest(guest)} className="text-slate-400 hover:text-primary"><Edit2 size={16} /></button>
                      <button onClick={() => onDeleteGuest(guest.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Mobile Action */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={onProceed} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98]">
          Go to Seating <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
};