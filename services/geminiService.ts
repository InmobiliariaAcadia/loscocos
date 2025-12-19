import { GoogleGenAI, Type } from "@google/genai";
import { Guest, Table, AISeatingResponse } from "../types";

export const isConfigured = () => {
  return !!process.env.API_KEY;
};

/**
 * Generates a seating plan using Gemini AI.
 * Uses gemini-3-pro-preview for advanced reasoning and large context.
 */
export const generateSeatingPlan = async (
  guests: Guest[],
  tables: Table[],
  constraints: string = "Mix groups to encourage conversation, but keep families together.",
  options: { alternateGender: boolean; separateCouples: boolean } = { alternateGender: false, separateCouples: false }
): Promise<AISeatingResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const simplifiedGuests = guests.map(g => ({
    id: g.id,
    name: g.name,
    group: g.group,
    gender: g.gender,
    age: g.ageGroup,
    classification: g.classification,
    relationship: g.isCouple ? `Pareja con ${g.partnerId}` : 'Soltero',
    seatTogether: options.separateCouples ? false : g.seatTogether, 
    tags: g.tags
  }));

  const simplifiedTables = tables.map(t => ({ 
    id: t.id, 
    name: t.name, 
    capacity: t.capacity
  }));

  const coupleRule = options.separateCouples 
    ? "IMPORTANTE: SEPARA a las parejas. No los sientes juntos ni en la misma mesa si es posible para fomentar socialización." 
    : "IMPORTANTE: Las parejas que quieren estar juntas DEBEN estar en la misma mesa y preferiblemente contiguas.";

  const genderRule = options.alternateGender
    ? "IMPORTANTE: Intercala estrictamente Hombre-Mujer (M-F-M-F) en el orden de los asientos."
    : "Intenta equilibrar géneros y grupos de edad en cada mesa.";
  
  const prompt = `
    Sistema de Planificación de Asientos Inteligente para Eventos "Los Cocos".
    Tu tarea es asignar a cada invitado a una mesa respetando estrictamente las capacidades.

    MESAS DISPONIBLES:
    ${JSON.stringify(simplifiedTables)}

    LISTADO DE INVITADOS (${guests.length} personas):
    ${JSON.stringify(simplifiedGuests)}

    REGLAS DE ORO:
    1. CAPACIDAD: No excedas bajo ninguna circunstancia la capacidad de las mesas.
    2. COBERTURA: Intenta sentar al 100% de los invitados listados.
    3. PAREJAS: ${coupleRule}
    4. GÉNERO: ${genderRule}
    5. PRIORIDAD: Los invitados de Clasificación 'A' son prioritarios y deben tener los mejores lugares.
    6. RESTRICCIONES ADICIONALES DEL USUARIO: ${constraints}

    FORMATO DE SALIDA:
    Debes responder ÚNICAMENTE con un objeto JSON que siga este esquema:
    {
      "assignments": [{"guestId": "string", "tableId": "string"}],
      "reasoning": "Explicación breve en español de la estrategia utilizada."
    }
  `;

  try {
    // Correctly call generateContent with model name and contents string.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        // By default, you do not need to set thinkingBudget as the model decides automatically.
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
              type: Type.STRING
            }
          },
          required: ["assignments", "reasoning"]
        }
      }
    });

    // Access the text output via the response.text property (not a method).
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    
    return JSON.parse(jsonStr.trim()) as AISeatingResponse;
  } catch (error) {
    console.error("Error generating seating plan:", error);
    throw error;
  }
};
