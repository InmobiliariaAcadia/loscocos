import { GoogleGenAI, Type } from "@google/genai";
import { Guest, Table, AISeatingResponse } from "../types";

// Access API key safely
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSeatingPlan = async (
  guests: Guest[],
  tables: Table[],
  constraints: string = "Mix groups to encourage conversation, but keep families together.",
  options: { alternateGender: boolean; separateCouples: boolean } = { alternateGender: false, separateCouples: false }
): Promise<AISeatingResponse> => {
  
  const simplifiedGuests = guests.map(g => ({
    id: g.id,
    name: g.name,
    group: g.group,
    gender: g.gender,
    age: g.ageGroup,
    classification: g.classification,
    relationship: g.isCouple ? `Couple with ${g.partnerId}` : 'Single',
    // If separateCouples is true, we override the seatTogether preference for the AI prompt
    seatTogether: options.separateCouples ? false : g.seatTogether, 
    tags: g.tags
  }));

  const simplifiedTables = tables.map(t => ({ 
    id: t.id, 
    name: t.name, 
    capacity: t.capacity,
    shape: t.shape 
  }));

  // Dynamic Rule Strings
  const coupleRule = options.separateCouples 
    ? "IMPORTANT: Do NOT seat couples/partners next to each other. Separate them within the table or at different tables." 
    : "Couples who want to seat together MUST be at the same table and seated side-by-side if possible.";

  const genderRule = options.alternateGender
    ? "IMPORTANT: Strictly arrange seating to alternate Male and Female (M-F-M-F) pattern around the table."
    : "Balance genders and age groups where possible.";
  
  const prompt = `
    I need to seat guests at an event.
    
    Here are the Tables:
    ${JSON.stringify(simplifiedTables)}

    Here are the Guests:
    ${JSON.stringify(simplifiedGuests)}

    Rules:
    1. STRICTLY do not exceed table capacities.
    2. Try to seat everyone.
    3. ${coupleRule}
    4. ${genderRule}
    5. User Constraints: ${constraints}
    
    Return a JSON object with a list of assignments and a short reasoning.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  guestId: { type: Type.STRING },
                  tableId: { type: Type.STRING }
                },
                required: ["guestId", "tableId"]
              }
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation of the strategy used."
            }
          },
          required: ["assignments"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    
    return JSON.parse(jsonStr) as AISeatingResponse;
  } catch (error) {
    console.error("Error generating seating plan:", error);
    throw error;
  }
};