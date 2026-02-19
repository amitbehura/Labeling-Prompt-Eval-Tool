import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiModel } from "../types";

export interface GenerationResult {
  output: string;
  reasoning: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

export const generateWithGemini = async (
  systemPrompt: string,
  userInput: string,
  modelName: string = GeminiModel.FLASH,
  categories: string[] = [],
  apiKey?: string
): Promise<GenerationResult> => {
  const startTime = performance.now();

  try {
    // Priority: User provided key > Environment key
    const effectiveApiKey = apiKey || process.env.API_KEY || '';
    
    if (!effectiveApiKey) {
        throw new Error("No API Key provided. Please check Settings or environment variables.");
    }

    // Initialize client per request to allow dynamic key switching
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    // Construct the response schema
    // If categories are provided, we restrict the 'output' field to be one of those strings.
    let responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        reasoning: { type: Type.STRING, description: "Brief reasoning, max 10 words" },
        output: { type: Type.STRING, description: "The actual result of the prompt execution" }
      },
      required: ["reasoning", "output"]
    };

    let finalSystemPrompt = systemPrompt;

    if (categories.length > 0) {
      // Update schema to use ENUM for output
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          reasoning: { type: Type.STRING, description: "Brief reasoning, max 10 words" },
          output: { 
            type: Type.STRING, 
            enum: categories,
            description: `One of the following categories: ${categories.join(', ')}` 
          }
        },
        required: ["reasoning", "output"]
      };

      finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must classify the input into exactly one of the following categories: ${categories.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: 'user', parts: [{ text: `System Instruction: ${finalSystemPrompt}\n\nUser Input: ${userInput}` }] }
      ],
      config: {
        systemInstruction: "You are an evaluation assistant. Process the user input based on the system instruction. You must respond in valid JSON format.",
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const text = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response", text);
      parsed = { reasoning: "Error parsing JSON", output: "ERROR" };
    }

    // Estimate tokens if usageMetadata is missing
    const usage = response.usageMetadata;
    const inputTokens = usage?.promptTokenCount || Math.ceil((systemPrompt.length + userInput.length) / 4);
    const outputTokens = usage?.candidatesTokenCount || Math.ceil(text.length / 4);

    return {
      output: parsed.output || "",
      reasoning: parsed.reasoning || "",
      latencyMs,
      inputTokens,
      outputTokens
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Unknown error during generation");
  }
};