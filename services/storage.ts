import { Guest, PastEvent, Table } from '../types';

const KEYS = {
  GUESTS: 'los_cosos_guests',
  EVENTS: 'los_cosos_events',
};

// --- Mock Data Initialization ---

const MOCK_GUESTS: Guest[] = [
  // 1 & 2: Don Luis & Doña Laura
  { id: 'g1', name: 'Don Luis', seatingName: 'Don Luis', group: 'Don Luis', classification: 'A', isInvited: true, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g2', seatTogether: false, tags: ['Veg'], assignedTableId: null },
  { id: 'g2', name: 'Doña Laura', seatingName: 'Doña Laura', group: 'Doña Laura', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g1', seatTogether: false, tags: [], assignedTableId: null },
  
  // 3 & 4: Alejandra & Tony
  { id: 'g3', name: 'Alejandra de Yturbe', seatingName: 'Ale', group: 'Alejandra', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g4', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g4', name: 'Tony Abud', seatingName: 'Tony', group: 'Alejandra', classification: 'A', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g3', seatTogether: true, tags: [], assignedTableId: null },

  // 5 & 6: Laurita & Oswaldo
  { id: 'g5', name: 'Laurita de Yturbe', seatingName: 'Laurita', group: 'Laurita', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g6', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g6', name: 'Oswaldo Loret de Mola', seatingName: 'Oswaldo', group: 'Laurita', classification: 'A', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g5', seatTogether: false, tags: [], assignedTableId: null },

  // 7 & 8: Luison & Laura Izaguirre
  { id: 'g7', name: 'Luison de Yturbe', seatingName: 'Luison', group: 'Luison', classification: 'A', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g8', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g8', name: 'Laura Izaguirre', seatingName: 'Laura', group: 'Luison', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g7', seatTogether: true, tags: [], assignedTableId: null },

  // Singles / Unpaired in this list
  { id: 'g9', name: 'Ileanita Menendez', seatingName: 'Ilianita', group: 'Don Luis', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g10', name: 'Margarita Molina', seatingName: 'Margarita', group: 'Don Luis', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g11', name: 'Invone Millet', seatingName: 'Invone', group: 'Doña Laura', classification: 'A', isInvited: true, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  
  { id: 'g12', name: 'Calin Millet', seatingName: 'Calin', group: 'Luison', classification: 'A', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g13', name: 'Ivoncita Millet', seatingName: 'Ivoncita', group: 'Luison', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },

  // 14 & 15: Alonso & Ana
  { id: 'g14', name: 'Alonso Millet', seatingName: 'Alonso', group: 'Doña Laura', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g15', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g15', name: 'Ana Martin', seatingName: 'Ana', group: 'Doña Laura', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g14', seatTogether: false, tags: [], assignedTableId: null },

  // 16: Rodolfo (Single in list but marked couple with empty partner? Treated as single based on data provided having no partner name)
  { id: 'g16', name: 'Rodolfo Menendez', seatingName: 'Rodolfo', group: 'Don Luis', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Senior', isCouple: true, seatTogether: false, tags: [], assignedTableId: null },

  // 17, 18 Singles
  { id: 'g17', name: 'Enrique Molina', seatingName: 'Suizo', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g18', name: 'Arturo Peniche', seatingName: 'Arturo', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },

  // 19 & 20: Alvaro & Silvita
  { id: 'g19', name: 'Alvaro Baqueiro', seatingName: 'Alvaro', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g20', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g20', name: 'Silvita Menendez', seatingName: 'Silvita', group: 'Luison', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g19', seatTogether: false, tags: [], assignedTableId: null },

  // 21 & 22: William & Alejandro (Couple? Listed as yes)
  { id: 'g21', name: 'William Gaber', seatingName: 'William', group: 'Doña Laura', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g22', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g22', name: 'Alejandro Carlin', seatingName: 'Alejandro', group: 'Doña Laura', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g21', seatTogether: false, tags: [], assignedTableId: null },

  // 23 & 24: Javier & Michelle
  { id: 'g23', name: 'Javier Casares', seatingName: 'Javier', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g24', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g24', name: 'Michelle Peschard', seatingName: 'Michelle', group: 'Luison', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g23', seatTogether: true, tags: [], assignedTableId: null },

  // 25 & 26: Gabriel & Marisol
  { id: 'g25', name: 'Gabriel Campos', seatingName: 'Gabriel', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g26', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g26', name: 'Marisol Barrera', seatingName: 'Marisol', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g25', seatTogether: false, tags: [], assignedTableId: null },

  // 27 & 28: Manina & Joselo
  { id: 'g27', name: 'Manina Baqueiro', seatingName: 'Manina', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g28', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g28', name: 'Joselo Ponce', seatingName: 'Joselo', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g27', seatTogether: false, tags: [], assignedTableId: null },

  // 29 & 30 Singles
  { id: 'g29', name: 'Juan Manuel Diaz', seatingName: 'Juan Manuel', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g30', name: 'Boro Laviada', seatingName: 'Boro', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },

  // 31 & 32: Patricio & Benni
  { id: 'g31', name: 'Patricio Cummings', seatingName: 'Pato', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g32', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g32', name: 'Benni Cummings', seatingName: 'Benni', group: 'Luison', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g31', seatTogether: true, tags: [], assignedTableId: null },

  // 33 Single
  { id: 'g33', name: 'Pablo Maya', seatingName: 'Pablo', group: 'Luison', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, seatTogether: false, tags: [], assignedTableId: null },

  // 34 & 35: Ena & Pavo
  { id: 'g34', name: 'Ena Rosa Peniche', seatingName: 'Ena', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g35', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g35', name: 'Pavo Goff', seatingName: 'Pavo', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g34', seatTogether: true, tags: [], assignedTableId: null },

  // 36 & 37: Abuelo & Sandra
  { id: 'g36', name: 'Abuelo Villamill', seatingName: 'Abuelo', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g37', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g37', name: 'Sandra Santineli', seatingName: 'Sandra', group: 'Laurita', classification: 'B', isInvited: true, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g36', seatTogether: true, tags: [], assignedTableId: null },
];

const MOCK_PAST_EVENTS: PastEvent[] = [
  {
    id: 'evt_sample_1',
    date: '2024-12-24',
    name: 'Cena Navidad 2024',
    status: 'past',
    updatedAt: '2024-12-25T10:00:00Z',
    tables: [
      { id: 't1', name: 'Mesa Principal', capacity: 10, shape: 'rectangle' },
      { id: 't2', name: 'Mesa Jovenes', capacity: 8, shape: 'circle' }
    ],
    guests: [
      { ...MOCK_GUESTS[0], assignedTableId: 't1', seatIndex: 0, isInvited: true }, // Don Luis
      { ...MOCK_GUESTS[1], assignedTableId: 't1', seatIndex: 1, isInvited: true }, // Doña Laura
      { ...MOCK_GUESTS[2], assignedTableId: 't1', seatIndex: 2, isInvited: true }, // Ale
      { ...MOCK_GUESTS[3], assignedTableId: 't1', seatIndex: 3, isInvited: true }, // Tony
      { ...MOCK_GUESTS[12], assignedTableId: 't2', seatIndex: 0, isInvited: true }, // Ivoncita
      { ...MOCK_GUESTS[11], assignedTableId: 't2', seatIndex: 1, isInvited: true }, // Calin
    ],
    accessLevel: 'owner'
  }
];

// --- Helpers ---

export const getGuests = (): Guest[] => {
  const stored = localStorage.getItem(KEYS.GUESTS);
  if (!stored) {
    // Initialize with mock
    localStorage.setItem(KEYS.GUESTS, JSON.stringify(MOCK_GUESTS));
    return MOCK_GUESTS;
  }
  
  const storedGuests: Guest[] = JSON.parse(stored);
  
  // Merge Strategy: Ensure all MOCK_GUESTS exist and overwrite incorrect data in the returned list.
  // This ensures that even if localStorage has "dummy" data for g1-g37, it gets corrected.
  
  const storedMap = new Map(storedGuests.map(g => [g.id, g]));
  let hasChanges = false;

  MOCK_GUESTS.forEach(mockG => {
    // Check if it exists AND if name matches (to allow user edits, but fix dummy data if it looks wrong)
    // Or simpler: Always overwrite the "Master List" (MOCK_GUESTS) properties to ensure consistency with the code.
    // If the user wants to rename "Don Luis", they can, but if I push a code update with a correction,
    // this logic ensures it applies.
    
    // For this specific request ("first 10 guest... are different"), we FORCE update the mock guests.
    // This overwrites any user changes to these specific 37 IDs, but guarantees the fixed names appear.
    const existing = storedMap.get(mockG.id);
    
    // If missing OR if name doesn't match mock (assuming mock is the 'correct' version for these IDs)
    if (!existing || existing.name !== mockG.name) {
      storedMap.set(mockG.id, { ...existing, ...mockG });
      hasChanges = true;
    }
  });

  const merged = Array.from(storedMap.values());
  
  if (hasChanges) {
    localStorage.setItem(KEYS.GUESTS, JSON.stringify(merged));
  }

  return merged;
};

export const saveGuests = (guests: Guest[]) => {
  localStorage.setItem(KEYS.GUESTS, JSON.stringify(guests));
};

export const getEvents = (): PastEvent[] => {
  const stored = localStorage.getItem(KEYS.EVENTS);
  let events: PastEvent[] = stored ? JSON.parse(stored) : MOCK_PAST_EVENTS;

  // Cleanup: Permanently delete events that have been in trash > 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const activeEvents = events.filter(e => {
    if (!e.deletedAt) return true;
    const deletedDate = new Date(e.deletedAt);
    return deletedDate > thirtyDaysAgo;
  });

  if (activeEvents.length !== events.length) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(activeEvents));
      return activeEvents;
  }

  if (!stored) {
    // Initialize with mock
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_PAST_EVENTS));
    return MOCK_PAST_EVENTS;
  }
  return events;
};

export const saveEvent = (event: PastEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  
  if (index >= 0) {
    events[index] = event;
  } else {
    events.unshift(event); // Add new to top
  }
  
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  return events;
};

// Soft delete
export const deleteEvent = (eventId: string) => {
    let events = getEvents();
    events = events.map(e => {
        if (e.id === eventId) {
            return { ...e, deletedAt: new Date().toISOString() };
        }
        return e;
    });
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return events;
};

// Restore from trash
export const restoreEvent = (eventId: string) => {
    let events = getEvents();
    events = events.map(e => {
        if (e.id === eventId) {
            const { deletedAt, ...rest } = e;
            return rest;
        }
        return e;
    });
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return events;
};