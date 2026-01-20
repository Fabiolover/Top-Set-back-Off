
import { GoogleGenAI } from "@google/genai";
import { TrainingSet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCoachAdvice = async (exercise: string, weight: number, sets: TrainingSet[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Agisci come un esperto coach di Bodybuilding.
    L'atleta sta eseguendo: ${exercise}
    Il Top Set è di ${weight}kg.
    La struttura dell'allenamento calcolata è:
    ${sets.map(s => `- ${s.type}: ${s.weight}kg, ${s.reps} reps, RPE ${s.rpe}, Rest ${s.rest}`).join('\n')}

    Fornisci 3 brevi consigli tecnici e motivazionali specifici per questa combinazione di carichi e esercizio.
    Focus su: esecuzione tecnica nel Top Set e gestione della fatica nel Drop Metabolico.
    Rispondi in Italiano in formato Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Non sono riuscito a contattare il coach al momento. Concentrati sulla tecnica e spingi forte!";
  }
};
