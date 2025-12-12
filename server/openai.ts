import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface CarSearchFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  maxMileage?: number;
  location?: string;
  bodyType?: string;
  color?: string;
}

export interface ChatResponse {
  message: string;
  filters: CarSearchFilters;
  shouldSearch: boolean;
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export async function processCarSearchChat(
  userMessage: string,
  currentFilters: CarSearchFilters,
  conversationHistory: { role: string; content: string }[]
): Promise<ChatResponse> {
  const systemPrompt = `You are AutoNinja's helpful car search assistant. Your job is to help buyers find their perfect used car through natural conversation.

Current active filters: ${JSON.stringify(currentFilters)}

When users describe what car they're looking for, extract these possible filters:
- make: car brand (Toyota, Honda, BMW, etc.)
- model: specific model (Camry, Civic, 3 Series, etc.)
- minPrice / maxPrice: price range in numbers
- minYear / maxYear: year range
- fuelType: Petrol, Diesel, Hybrid, Electric
- transmission: Manual, Automatic
- maxMileage: maximum mileage in km
- location: city or area
- bodyType: Sedan, SUV, Hatchback, Coupe, etc.
- color: car color

Be conversational and friendly. If the user's request is vague, ask ONE clarifying question about the most important missing filter. 
If they give enough info to search, confirm what you understood and set shouldSearch to true.

Respond in JSON format with:
{
  "message": "Your conversational response",
  "filters": { ...updated filters object },
  "shouldSearch": boolean
}`;

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      message: parsed.message || "I'm here to help you find your perfect car!",
      filters: { ...currentFilters, ...parsed.filters },
      shouldSearch: parsed.shouldSearch || false
    };
  } catch (error) {
    console.error("OpenAI chat error:", error);
    return {
      message: "I'm having trouble understanding. Could you tell me more about what kind of car you're looking for?",
      filters: currentFilters,
      shouldSearch: false
    };
  }
}

export async function transcribeAudioWithGemini(audioBase64: string, mimeType: string): Promise<string> {
  // Using Gemini for audio transcription since OpenAI Whisper isn't available via AI Integrations
  // This is a fallback - for now we'll use text-based chat
  // In production, you would integrate Gemini's audio capabilities here
  console.log("Audio transcription requested - using text-based fallback");
  return "";
}
