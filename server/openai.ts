import OpenAI from "openai";

/**
 * OpenAI client instance configured for Replit AI Integrations
 *
 * This provides OpenAI-compatible API access through Replit's infrastructure,
 * eliminating the need for a separate OpenAI API key when deployed on Replit.
 *
 * @see {@link https://docs.replit.com/hosting/deployments/ai-integrations}
 */
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

/**
 * Car search filter parameters for filtering database queries
 */
export interface CarSearchFilters {
  /** Car manufacturer (e.g., "BMW", "Toyota") */
  make?: string;
  /** Car model (e.g., "3 Series", "Camry") */
  model?: string;
  /** Minimum price in euros */
  minPrice?: number;
  /** Maximum price in euros */
  maxPrice?: number;
  /** Minimum year of manufacture */
  minYear?: number;
  /** Maximum year of manufacture */
  maxYear?: number;
  /** Fuel type (Petrol, Diesel, Hybrid, Electric) */
  fuelType?: string;
  /** Transmission type (Manual, Automatic) */
  transmission?: string;
  /** Maximum mileage in kilometers */
  maxMileage?: number;
  /** Location/county */
  location?: string;
  /** Body type (Saloon, SUV, Hatchback, etc.) */
  bodyType?: string;
  /** Car color */
  color?: string;
}

/**
 * Response from AI chat processing including extracted filters and search intent
 */
export interface ChatResponse {
  /** AI-generated message to display to user */
  message: string;
  /** Extracted and updated search filters */
  filters: CarSearchFilters;
  /** Whether to execute a car search with current filters */
  shouldSearch: boolean;
}

/**
 * Processes natural language car search queries using OpenAI GPT-5
 *
 * Analyzes user messages to extract car search criteria and provides
 * conversational responses while updating search filters progressively.
 *
 * @param userMessage - User's natural language search query
 * @param currentFilters - Currently active search filters
 * @param conversationHistory - Previous messages for context (up to 10 kept)
 * @returns Chat response with updated filters and search intent
 *
 * @example
 * ```typescript
 * const response = await processCarSearchChat(
 *   "I want a BMW under 20k",
 *   {},
 *   []
 * );
 * // response.filters = { make: "BMW", maxPrice: 20000 }
 * // response.shouldSearch = true
 * ```
 *
 * @note Uses GPT-5 (released August 7, 2025) - the newest OpenAI model
 */
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

/**
 * Vehicle data extracted from logbook/registration documents via OCR
 */
export interface LogbookData {
  /** Vehicle Identification Number (17 characters) */
  vin?: string;
  /** Registration plate number */
  registrationNumber?: string;
  /** Car manufacturer */
  make?: string;
  /** Car model */
  model?: string;
  /** Year the vehicle was manufactured */
  yearOfManufacture?: number;
  /** Number of previous owners */
  owners?: number;
  /** Vehicle color */
  color?: string;
  /** Engine size in liters (e.g., "2.0") */
  engineSize?: string;
  /** Fuel type (Petrol, Diesel, etc.) */
  fuelType?: string;
  /** Transmission type (Manual, Automatic) */
  transmission?: string;
  /** OCR confidence score from 0-100 */
  confidence?: number;
  /** Raw JSON response from vision model */
  rawText?: string;
}

/**
 * Extract vehicle information from logbook images using OpenAI Vision API
 * @param imageUrl - URL or base64 encoded image of the logbook
 * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns Extracted logbook data with confidence score
 */
export async function extractLogbookData(
  imageUrl: string,
  mimeType: string
): Promise<LogbookData> {
  const systemPrompt = `You are an expert at extracting vehicle information from logbook documents (V5C/registration documents).

Extract the following information from the logbook image:
- VIN (Vehicle Identification Number)
- Registration Number (number plate)
- Make (manufacturer)
- Model
- Year of Manufacture
- Number of Previous Owners
- Color/Colour
- Engine Size (in liters)
- Fuel Type (Petrol, Diesel, Hybrid, Electric, etc.)
- Transmission (Manual, Automatic)

Respond in JSON format with the extracted data. If a field is not visible or unclear, omit it.
Also include a confidence score (0-100) for the overall extraction quality.

Example response:
{
  "vin": "WBADT43452G123456",
  "registrationNumber": "191D12345",
  "make": "BMW",
  "model": "3 Series",
  "yearOfManufacture": 2019,
  "owners": 2,
  "color": "Black",
  "engineSize": "2.0",
  "fuelType": "Diesel",
  "transmission": "Automatic",
  "confidence": 95
}`;

  try {
    // Determine if the imageUrl is a base64 string or URL
    let imageContent: any;

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('/uploads/')) {
      // If it's a data URL or local path, use URL format
      imageContent = {
        type: "image_url" as const,
        image_url: {
          url: imageUrl.startsWith('/uploads/')
            ? `file://${process.cwd()}${imageUrl}`
            : imageUrl
        }
      };
    } else {
      // Assume it's a base64 string, construct data URL
      imageContent = {
        type: "image_url" as const,
        image_url: {
          url: `data:${mimeType};base64,${imageUrl}`
        }
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            imageContent
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      vin: parsed.vin,
      registrationNumber: parsed.registrationNumber,
      make: parsed.make,
      model: parsed.model,
      yearOfManufacture: parsed.yearOfManufacture,
      owners: parsed.owners,
      color: parsed.color,
      engineSize: parsed.engineSize,
      fuelType: parsed.fuelType,
      transmission: parsed.transmission,
      confidence: parsed.confidence || 0,
      rawText: JSON.stringify(parsed)
    };
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw new Error("Failed to extract logbook data from image");
  }
}

/**
 * Verify if extracted logbook data matches the car listing data
 * @param logbookData - Data extracted from logbook
 * @param carData - Data from car listing
 * @returns Verification result with match percentage
 */
export function verifyLogbookData(
  logbookData: LogbookData,
  carData: { make?: string; model?: string; year?: number; registration?: string }
): { isVerified: boolean; matchPercentage: number; mismatches: string[] } {
  const mismatches: string[] = [];
  let matches = 0;
  let totalChecks = 0;

  if (logbookData.make && carData.make) {
    totalChecks++;
    if (logbookData.make.toLowerCase() === carData.make.toLowerCase()) {
      matches++;
    } else {
      mismatches.push(`Make mismatch: ${logbookData.make} vs ${carData.make}`);
    }
  }

  if (logbookData.model && carData.model) {
    totalChecks++;
    const logbookModel = logbookData.model.toLowerCase();
    const carModel = carData.model.toLowerCase();
    if (logbookModel.includes(carModel) || carModel.includes(logbookModel)) {
      matches++;
    } else {
      mismatches.push(`Model mismatch: ${logbookData.model} vs ${carData.model}`);
    }
  }

  if (logbookData.yearOfManufacture && carData.year) {
    totalChecks++;
    if (logbookData.yearOfManufacture === carData.year) {
      matches++;
    } else {
      mismatches.push(`Year mismatch: ${logbookData.yearOfManufacture} vs ${carData.year}`);
    }
  }

  if (logbookData.registrationNumber && carData.registration) {
    totalChecks++;
    const logbookReg = logbookData.registrationNumber.replace(/\s/g, '').toUpperCase();
    const carReg = carData.registration.replace(/\s/g, '').toUpperCase();
    if (logbookReg === carReg) {
      matches++;
    } else {
      mismatches.push(`Registration mismatch: ${logbookData.registrationNumber} vs ${carData.registration}`);
    }
  }

  const matchPercentage = totalChecks > 0 ? Math.round((matches / totalChecks) * 100) : 0;
  const isVerified = matchPercentage >= 75 && mismatches.length === 0;

  return { isVerified, matchPercentage, mismatches };
}

export async function transcribeAudioWithGemini(audioBase64: string, mimeType: string): Promise<string> {
  // Using Gemini for audio transcription since OpenAI Whisper isn't available via AI Integrations
  // This is a fallback - for now we'll use text-based chat
  // In production, you would integrate Gemini's audio capabilities here
  console.log("Audio transcription requested - using text-based fallback");
  return "";
}
