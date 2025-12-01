import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AiAnalysis } from '../types';
import { formatEther } from './etherscanService';

// Initialize Gemini
// Note: In a real production app, you might want to proxy this request 
// to avoid exposing logic or handling keys purely on client side if possible, 
// but for this SPA demo, we use the env key directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWalletActivity = async (
  address: string, 
  transactions: Transaction[]
): Promise<AiAnalysis> => {
  
  if (transactions.length === 0) {
    return {
      summary: "No recent transactions found to analyze.",
      riskAssessment: "LOW",
      keyActivities: ["Inactive wallet"]
    };
  }

  // Prepare a simplified dataset for the AI to save tokens
  const simpleTxData = transactions.map(tx => ({
    date: new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0],
    type: tx.from.toLowerCase() === address.toLowerCase() ? 'OUT' : 'IN',
    valueETH: formatEther(tx.value),
    otherParty: tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from,
    isError: tx.isError === '1'
  }));

  const prompt = `
    Analyze the following recent Ethereum transactions for wallet address ${address}.
    
    Transaction Data:
    ${JSON.stringify(simpleTxData, null, 2)}
    
    Provide a structured analysis in JSON format containing:
    1. A brief "summary" of the wallet's recent behavior (max 2 sentences).
    2. A "riskAssessment" (LOW, MEDIUM, or HIGH) based on failed transactions, interactions with suspicious patterns (if inferable), or high frequency.
    3. A list of "keyActivities" (e.g., "Frequent trading", "Holding", "Interacting with DeFi").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskAssessment: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
            keyActivities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "riskAssessment", "keyActivities"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AiAnalysis;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      summary: "AI Analysis currently unavailable.",
      riskAssessment: "LOW",
      keyActivities: []
    };
  }
};
