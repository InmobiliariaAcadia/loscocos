
export type Classification = 'A' | 'B' | 'C' | 'D'; // A: Always, B: Occasional, C: New, D: First time
export type AgeGroup = 'Child' | 'Teen' | 'Adult' | 'Senior';
export type Gender = 'Male' | 'Female' | 'Non-binary';

export interface Guest {
  id: string;
  name: string;
  seatingName?: string; // Short name for the chart (e.g., "Uncle Bob")
  group: string; // e.g., "Bride Family", "Work Friends"
  
  assignedTableId: string | null;
  seatIndex?: number; // Specific position at the table (0 to capacity-1)

  tags: string[]; // e.g., "Vegetarian", "Child"
  
  // Detailed fields
  gender: Gender;
  ageGroup: AgeGroup;
  isCouple: boolean;
  partnerId?: string; // ID of partner
  seatTogether: boolean; // If couple, do they prefer to sit together?
  classification: Classification;
  
  // Status
  isInvited: boolean; // True = Active for this event, False = In database but not invited
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: 'circle' | 'rectangle' | 'square' | 'oval';
}

export interface SeatingAssignment {
  guestId: string;
  tableId: string;
}

export interface AISeatingResponse {
  assignments: SeatingAssignment[];
  reasoning?: string;
}

// --- History & Past Events ---

export interface PastAssignment {
  guestId: string;
  tableId: string;
  tableName: string;
  seatIndex?: number;
}

// Full snapshot of a past event
export interface PastEvent {
  id: string;
  date: string; // ISO Date string
  name: string;
  status: 'upcoming' | 'past'; // To distinguish active planning vs archived
  tables: Table[]; // Snapshot of tables configuration
  guests: Guest[]; // Snapshot of guests (invitation status, details at that time)
  updatedAt: string;
  accessLevel?: 'owner' | 'viewer'; // 'owner' = can edit, 'viewer' = read only
  deletedAt?: string; // ISO Date string if deleted (Soft Delete)
}