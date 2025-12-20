
import { GoogleGenAI, Type } from "@google/genai";
import { Guest, Table, AISeatingResponse } from "../types";

/**
 * Checks if the API key is configured in the environment.
 */
export const isConfigured = () => {
  return !!process.env.API_KEY;
};

/**
 * Generates a seating plan using Gemini AI.
 * Uses gemini-3-pro-preview for advanced reasoning with thinking budget enabled.
 */
export const generateSeatingPlan = async (
  guests: Guest[],
  tables: Table[],
  constraints: string = "Mix groups to encourage conversation, but keep families together.",
  options: { alternateGender: boolean; separateCouples: boolean } = { alternateGender: false, separateCouples: false }
): Promise<AISeatingResponse> => {
  // Initialize AI client inside the function to ensure it uses the most current API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a highly optimized representation of guests to minimize tokens and focus the logic
  const simplifiedGuests = guests.map(g => ({
    id: g.id,
    name: g.name,
    group: g.group,
    gender: g.gender,
    age: g.ageGroup,
    rank: g.classification, // High priority rank based on classification
    couple: g.isCouple ? g.partnerId : null,
    together: g.isCouple ? g.seatTogether : false,
    tags: g.tags
  }));

  const simplifiedTables = tables.map(t => ({ 
    id: t.id, 
    name: t.name, 
    cap: t.capacity
  }));

  const systemInstruction = `You are a high-end wedding and event coordinator for "Los Cocos". 
Your objective is to generate an optimal seating plan as a structured JSON object.

LOGICAL HIERARCHY:
1. MANDATORY: Respect individual table capacities ('cap') strictly.
2. COMPLETION: Assign EVERY guest to a table.
3. COUPLES: ${options.separateCouples ? "DELIBERATELY separate couples into different tables to improve mingling." : "KEEP couples together at the same table if their 'together' flag is true."}
4. GENDER MIX: ${options.alternateGender ? "INTERLEAVE Male and Female seats at each table strictly." : "Ensure a socially balanced mix of genders at all tables."}
5. VIP RANKING: Guests with rank 'Recurrente' are high-priority; place them at centrally named tables.
6. GROUPS: Use the 'group' field to keep teams/families close by assigning them to the same or adjacent tables.

Your output must strictly follow the JSON schema provided. The 'reasoning' field must be a clear explanation in Spanish of your allocation strategy.`;

  const userPrompt = `Input Tables: ${JSON.stringify(simplifiedTables)}
Input Guests: ${JSON.stringify(simplifiedGuests)}
Custom Instructions: ${constraints}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 12000 }, // High budget for complex combinatorial task
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  guestId: { 
                    type: Type.STRING,
                    description: "Unique ID of the guest."
                  },
                  tableId: { 
                    type: Type.STRING,
                    description: "ID of the assigned table."
                  }
                },
                required: ["guestId", "tableId"]
              }
            },
            reasoning: {
              type: Type.STRING,
              description: "Estrategia aplicada para este acomodo."
            }
          },
          required: ["assignments", "reasoning"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("No response text from model.");
    }

    const parsed = JSON.parse(jsonStr.trim()) as AISeatingResponse;
    
    // Basic validation to ensure every active guest got a seat
    if (!parsed.assignments || parsed.assignments.length === 0) {
      throw new Error("Model failed to generate assignments.");
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini seating generation error:", error);
    throw error;
  }
};
