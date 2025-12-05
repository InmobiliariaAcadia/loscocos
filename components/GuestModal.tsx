import React, { useState, useEffect } from 'react';
import { Guest, AgeGroup, Gender, Classification, PastEvent } from '../types';
import { X, User, Heart, Type, Clock, Calendar, History, Info } from 'lucide-react';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  editingGuest?: Guest | null;
  allGuests: Guest[];
  pastEvents?: PastEvent[];
}

export const GuestModal: React.FC<GuestModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingGuest, 
  allGuests,
  pastEvents = []
}) => {
  // Form State
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [name, setName] = useState('');
  const [seatingName, setSeatingName] = useState('');
  const [group, setGroup] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('Adult');
  const [classification, setClassification] = useState<Classification>('B');
  const [isCouple, setIsCouple] = useState(false);
  const [partnerId, setPartnerId] = useState<string>('');
  const [seatTogether, setSeatTogether] = useState(true);
  const [isInvited, setIsInvited] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const invitedByOptions = [
    "Doña Laura",
    "Don Luis",
    "Alejandra",
    "Luison",
    "Laurita",
    "Otro"
  ];

  useEffect(() => {
    if (editingGuest) {
      setName(editingGuest.name);
      setSeatingName(editingGuest.seatingName || '');
      setGroup(editingGuest.group);
      setGender(editingGuest.gender);
      setAgeGroup(editingGuest.ageGroup);
      setClassification(editingGuest.classification);
      setIsCouple(editingGuest.isCouple);
      setPartnerId(editingGuest.partnerId || '');
      setSeatTogether(editingGuest.seatTogether);
      setTags(editingGuest.tags);
      setIsInvited(editingGuest.isInvited);
    } else {
      resetForm();
    }
    setActiveTab('details'); // Reset to details on open
  }, [editingGuest, isOpen]);

  const resetForm = () => {
    setName('');
    setSeatingName('');
    setGroup('Doña Laura'); // Default to first option
    setGender('Male');
    setAgeGroup('Adult');
    setClassification('B');
    setIsCouple(false);
    setPartnerId('');
    setSeatTogether(true);
    setTags([]);
    setTagInput('');
    setIsInvited(true);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuest: Guest = {
      id: editingGuest?.id || `g${Date.now()}`,
      name: name || 'Guest',
      seatingName: seatingName || name.split(' ')[0], // Default to first name if empty
      group: group || 'Otro',
      assignedTableId: editingGuest?.assignedTableId || null,
      seatIndex: editingGuest?.seatIndex,
      tags,
      gender,
      ageGroup,
      classification,
      isCouple,
      partnerId: isCouple ? partnerId : undefined,
      seatTogether: isCouple ? seatTogether : false,
      isInvited
    };
    onSave(newGuest);
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // --- History Logic ---
  const guestHistory = editingGuest 
    ? pastEvents.filter(event => event.guests.some(g => g.id === editingGuest.id))
    : [];

  const getGuestSnapshot = (event: PastEvent) => {
    return event.guests.find(g => g.id === editingGuest?.id);
  };

  const getAssignment = (event: PastEvent) => {
    return event.assignments.find(a => a.guestId === editingGuest?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-300 h-[90vh] md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-primary" />
              {editingGuest ? 'Guest Profile' : 'Add New Guest'}
            </h3>
            {editingGuest && <p className="text-xs text-slate-500 mt-0.5">ID: {editingGuest.id}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        {editingGuest && (
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'details' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Info size={16} /> Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-secondary text-secondary bg-secondary/5' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <History size={16} /> History & Stats
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          
          {/* --- DETAILS TAB --- */}
          <div className={activeTab === 'details' ? 'block' : 'hidden'}>
            <form id="guest-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Status Row */}
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="invitedCheck"
                    checked={isInvited} 
                    onChange={e => setIsInvited(e.target.checked)}
                    className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <label htmlFor="invitedCheck" className="text-sm font-bold text-slate-800 cursor-pointer">
                    Invited to this event?
                  </label>
              </div>

              {/* Basic Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus={!editingGuest}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invited by</label>
                  <select
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                  >
                    {invitedByOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seating Name</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Name to display on the chart (e.g. Uncle Bob)"
                    value={seatingName}
                    onChange={e => setSeatingName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">If left blank, will use First Name.</p>
              </div>

              {/* Demographics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age Group</label>
                  <select 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  >
                    <option value="Child">Child</option>
                    <option value="Teen">Teen</option>
                    <option value="Adult">Adult</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classification</label>
                  <select 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as Classification)}
                  >
                    <option value="A">A - Always Invited</option>
                    <option value="B">B - Occasionally</option>
                    <option value="C">C - Relatively New</option>
                    <option value="D">D - First Time</option>
                  </select>
                </div>
              </div>

              {/* Relationship Section */}
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={18} className="text-red-500" />
                  <label className="text-sm font-bold text-slate-800">Relationship Status</label>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isCouple} 
                      onChange={e => setIsCouple(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">Part of a couple?</span>
                  </label>
                </div>

                {isCouple && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Partner's Name</label>
                      <select 
                        className="w-full border border-slate-300 p-2.5 rounded-lg text-sm"
                        value={partnerId}
                        onChange={e => setPartnerId(e.target.value)}
                      >
                        <option value="">-- Select Partner --</option>
                        {allGuests
                          .filter(g => g.id !== editingGuest?.id)
                          .map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input 
                          type="checkbox" 
                          checked={seatTogether} 
                          onChange={e => setSeatTogether(e.target.checked)}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">Prefer to sit together?</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Press Enter to add)</label>
                <input
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none mb-2"
                  placeholder="e.g. Vegetarian, Wheelchair access"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                    </span>
                  ))}
                </div>
              </div>

            </form>
          </div>

          {/* --- HISTORY TAB --- */}
          <div className="hidden" style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
            <div className="space-y-6">
              
              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                   <div className="text-3xl font-bold text-slate-600">{guestHistory.length + (isInvited ? 1 : 0)}</div>
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Events</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center">
                   <div className="text-3xl font-bold text-amber-800">{editingGuest?.classification || 'N/A'}</div>
                   <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Current Class</div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock size={16} /> Past Invitations
                </h4>
                
                {guestHistory.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-sm">
                    No past event history found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guestHistory.map(event => {
                       const snapshot = getGuestSnapshot(event);
                       const assignment = getAssignment(event);
                       return (
                        <div key={event.id} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary border-4 border-white shadow-sm"></div>
                          
                          <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-1">
                               <span className="font-bold text-slate-800">{event.name}</span>
                               <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                 <Calendar size={10} /> {new Date(event.date).toLocaleDateString()}
                               </span>
                            </div>
                            
                            <div className="text-sm text-slate-600 grid grid-cols-2 gap-2 mt-2">
                               <div>
                                  <span className="text-xs text-slate-400 block">Classification</span>
                                  <span className="font-medium">{snapshot?.classification || 'Unknown'}</span>
                               </div>
                               <div>
                                  <span className="text-xs text-slate-400 block">Seated At</span>
                                  <span className="font-medium text-primary">
                                    {assignment ? assignment.tableName : 'Not Seated'}
                                  </span>
                               </div>
                            </div>
                          </div>
                        </div>
                       );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="guest-form"
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg shadow hover:opacity-90 active:scale-95 transition-all"
          >
            Save Guest
          </button>
        </div>
      </div>
    </div>
  );
};