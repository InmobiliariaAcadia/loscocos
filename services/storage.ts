
import { Guest, PastEvent, Table } from '../types';

const KEYS = {
  GUESTS: 'los_cosos_guests',
  EVENTS: 'los_cosos_events',
};

// --- Mock Data Initialization ---

const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'Alice Johnson', seatingName: 'Alice', group: 'Doña Laura', tags: ['Veg'], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g2', seatTogether: true, classification: 'A', isInvited: true },
  { id: 'g2', name: 'Bob Smith', seatingName: 'Uncle Bob', group: 'Doña Laura', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g1', seatTogether: true, classification: 'A', isInvited: true },
  { id: 'g3', name: 'Charlie Brown', seatingName: 'Charlie', group: 'Alejandra', tags: ['Kid'], assignedTableId: null, gender: 'Male', ageGroup: 'Child', isCouple: false, seatTogether: false, classification: 'B', isInvited: true },
  { id: 'g4', name: 'Diana Prince', group: 'Don Luis', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: false, seatTogether: false, classification: 'B', isInvited: true },
  { id: 'g5', name: 'Evan Wright', group: 'Luison', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Senior', isCouple: false, seatTogether: false, classification: 'A', isInvited: false },
  { id: 'g6', name: 'Fiona Green', group: 'Luison', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, classification: 'A', isInvited: false },
  { id: 'g7', name: 'George Hall', group: 'Laurita', tags: [], assignedTableId: null, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g8', seatTogether: true, classification: 'C', isInvited: true },
  { id: 'g8', name: 'Hannah Lee', group: 'Laurita', tags: [], assignedTableId: null, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g7', seatTogether: true, classification: 'C', isInvited: true },
];

const MOCK_PAST_EVENTS: PastEvent[] = [
  {
    id: 'evt_2023_xmas',
    date: '2023-12-24',
    name: 'Christmas Eve 2023',
    status: 'past',
    updatedAt: '2023-12-25T10:00:00Z',
    tables: [
      { id: 't1', name: 'Family Table', capacity: 6, shape: 'rectangle' },
      { id: 't2', name: 'Kids Table', capacity: 4, shape: 'circle' }
    ],
    guests: [
      { ...MOCK_GUESTS[0], assignedTableId: 't1', seatIndex: 0, isInvited: true },
      { ...MOCK_GUESTS[1], assignedTableId: 't1', seatIndex: 1, isInvited: true },
      { ...MOCK_GUESTS[2], assignedTableId: 't2', seatIndex: 0, isInvited: true },
      { ...MOCK_GUESTS[3], assignedTableId: 't1', seatIndex: 2, isInvited: true },
    ]
  },
  {
    id: 'evt_2024_summer',
    date: '2024-07-15',
    name: 'Summer BBQ',
    status: 'upcoming',
    updatedAt: '2024-07-01T14:30:00Z',
    tables: [
      { id: 't1', name: 'Main Deck', capacity: 10, shape: 'oval' }
    ],
    guests: [
      { ...MOCK_GUESTS[0], assignedTableId: 't1', seatIndex: 0, isInvited: true },
      { ...MOCK_GUESTS[1], assignedTableId: 't1', seatIndex: 1, isInvited: true },
      { ...MOCK_GUESTS[6], assignedTableId: 't1', seatIndex: 2, isInvited: true },
      { ...MOCK_GUESTS[7], assignedTableId: 't1', seatIndex: 3, isInvited: true },
    ]
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
  return JSON.parse(stored);
};

export const saveGuests = (guests: Guest[]) => {
  localStorage.setItem(KEYS.GUESTS, JSON.stringify(guests));
};

export const getEvents = (): PastEvent[] => {
  const stored = localStorage.getItem(KEYS.EVENTS);
  if (!stored) {
    // Initialize with mock
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_PAST_EVENTS));
    return MOCK_PAST_EVENTS;
  }
  return JSON.parse(stored);
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

export const deleteEvent = (eventId: string) => {
    const events = getEvents().filter(e => e.id !== eventId);
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    return events;
};
