import { Guest, PastEvent, Table } from '../types';

const KEYS = {
  GUESTS: 'los_cosos_guests',
  EVENTS: 'los_cosos_events',
  VERSION: 'los_cosos_db_version'
};

// Increment this version when you want to force an update to the core guest list
const GUEST_DB_VERSION = 6; 

// --- Updated Master Guest List from CSV (48 Guests) ---

const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'Don Luis', seatingName: 'Don Luis', group: 'Don Luis', classification: 'A', isInvited: false, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g2', seatTogether: false, tags: ['Veg'], assignedTableId: null },
  { id: 'g2', name: 'Doña Laura', seatingName: 'Doña Laura', group: 'Doña Laura', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g1', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g3', name: 'Alejandra de Yturbe', seatingName: 'Ale', group: 'Alejandra', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g4', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g4', name: 'Tony Abud', seatingName: 'Tony', group: 'Alejandra', classification: 'A', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g3', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g5', name: 'Laurita de Yturbe', seatingName: 'Laurita', group: 'Laurita', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g6', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g6', name: 'Oswaldo Loret de Mola', seatingName: 'Oswaldo', group: 'Laurita', classification: 'A', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g5', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g7', name: 'Luison de Yturbe', seatingName: 'Luison', group: 'Luison', classification: 'A', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g8', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g8', name: 'Laura Izaguirre', seatingName: 'Laura', group: 'Luison', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g7', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g9', name: 'Ander Palafox', seatingName: 'Ander', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g10', name: 'Ileanita Menendez', seatingName: 'Ilianita', group: 'Don Luis', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g11', name: 'Margarita Molina', seatingName: 'Margarita', group: 'Don Luis', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g12', name: 'Invone Millet', seatingName: 'Invone', group: 'Doña Laura', classification: 'A', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g13', name: 'Calin Millet', seatingName: 'Calin', group: 'Luison', classification: 'A', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g14', name: 'Ivoncita Millet', seatingName: 'Ivoncita', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g15', name: 'Alonso Millet', seatingName: 'Alonso', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g16', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g16', name: 'Ana Martin', seatingName: 'Ana', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g15', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g17', name: 'Rodolfo Menendez', seatingName: 'Rodolfo', group: 'Don Luis', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Senior', isCouple: true, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g18', name: 'Enrique Molina', seatingName: 'Suizo', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g19', name: 'Arturo Peniche', seatingName: 'Arturo', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g20', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g20', name: 'Giuvy', seatingName: 'Giuvy', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g19', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g21', name: 'Alvaro Baqueiro', seatingName: 'Alvaro', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g22', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g22', name: 'Silvita Menendez', seatingName: 'Silvita', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g21', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g23', name: 'William Gaber', seatingName: 'William', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g24', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g24', name: 'Alejandro Carlin', seatingName: 'Alejandro', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g23', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g25', name: 'Javier Casares', seatingName: 'Javier', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g26', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g26', name: 'Michelle Peschard', seatingName: 'Michelle', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g25', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g27', name: 'Gabriel Campos', seatingName: 'Gabriel', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g28', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g28', name: 'Marisol Barrera', seatingName: 'Marisol', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g27', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g29', name: 'Manina Baqueiro', seatingName: 'Manina', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g30', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g30', name: 'Joselo Ponce', seatingName: 'Joselo', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g29', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g31', name: 'Juan Manuel Diaz', seatingName: 'Juan Manuel', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g32', name: 'Boro Laviada', seatingName: 'Boro', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g33', name: 'Patricio Cummings', seatingName: 'Pato', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g34', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g34', name: 'Benni Cummings', seatingName: 'Benni', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g33', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g35', name: 'Pablo Maya', seatingName: 'Pablo', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g36', name: 'Ena Rosa Peniche', seatingName: 'Ena', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g37', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g37', name: 'Pavo Goff', seatingName: 'Pavo', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g36', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g38', name: 'Abuelo Villamill', seatingName: 'Abuelo', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g39', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g39', name: 'Sandra Santineli', seatingName: 'Sandra', group: 'Laurita', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g38', seatTogether: true, tags: [], assignedTableId: null },
  { id: 'g40', name: 'Anibal Gonzalez', seatingName: 'Anibal', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g41', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g41', name: 'Monica Hernandez', seatingName: 'Monica', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g40', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g42', name: 'Mimi Vazquez', seatingName: 'Mimi', group: 'Alejandra', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g43', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g43', name: 'Oscar J-T Holm', seatingName: 'Oscar', group: 'Alejandra', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g42', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g44', name: 'Sole Miglioli', seatingName: 'Sole', group: 'Luison', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Adult', isCouple: true, partnerId: 'g45', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g45', name: 'Rafael Barrera', seatingName: 'Rach', group: 'Luison', classification: 'D', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: true, partnerId: 'g44', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g46', name: 'Mercedes Colomer', seatingName: 'Meche', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Female', ageGroup: 'Senior', isCouple: true, partnerId: 'g47', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g47', name: 'Leonardo Colomer', seatingName: 'Leo', group: 'Doña Laura', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Senior', isCouple: true, partnerId: 'g46', seatTogether: false, tags: [], assignedTableId: null },
  { id: 'g48', name: 'Juan Carlos Gonzalez Luna', seatingName: 'Flash', group: 'Luison', classification: 'B', isInvited: false, gender: 'Male', ageGroup: 'Adult', isCouple: false, seatTogether: false, tags: [], assignedTableId: null },
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
      { ...MOCK_GUESTS[0], assignedTableId: 't1', seatIndex: 0, isInvited: true },
      { ...MOCK_GUESTS[1], assignedTableId: 't1', seatIndex: 1, isInvited: true },
    ],
    accessLevel: 'owner'
  }
];

// --- Helpers ---

export const getGuests = (): Guest[] => {
  const stored = localStorage.getItem(KEYS.GUESTS);
  const storedVersion = parseInt(localStorage.getItem(KEYS.VERSION) || '0');
  
  if (!stored || storedVersion < GUEST_DB_VERSION) {
    console.log(`Database version outdated (${storedVersion} < ${GUEST_DB_VERSION}). Updating registry...`);
    localStorage.setItem(KEYS.GUESTS, JSON.stringify(MOCK_GUESTS));
    localStorage.setItem(KEYS.VERSION, GUEST_DB_VERSION.toString());
    return MOCK_GUESTS;
  }
  
  return JSON.parse(stored);
};

export const saveGuests = (guests: Guest[]) => {
  localStorage.setItem(KEYS.GUESTS, JSON.stringify(guests));
};

export const getEvents = (): PastEvent[] => {
  const stored = localStorage.getItem(KEYS.EVENTS);
  let events: PastEvent[] = stored ? JSON.parse(stored) : MOCK_PAST_EVENTS;

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
    events.unshift(event);
  }
  
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  return events;
};

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
