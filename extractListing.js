import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// This router is mounted at '/extract' in server.js, so the path here should be '/'
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const apiKey =
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      "";
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Missing GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const fullPrompt = `
You are an AI Real Estate Listing Parser. I will give you a WhatsApp message that contains property listing details. 
Your job is to extract the structured data and return a clean JSON object.

The input message may include information like BHK, location, price, rent, furnishing status, and contact number.

Follow these rules strictly:
1. Output ONLY a valid JSON object — no extra text, explanations, or notes.
2. The JSON must contain these exact keys:
   - bhk (number)
   - location (string)
   - price (number or null)
   - rentpermonth (number or null)
   - listing_type (string: either "sale" or "rent")
   - furnished_status (string or null)
   - area (string or null)
   - contact (string or null)
3. Convert prices like:
   - "2.5 cr" or "2.5 crore" → 25000000
   - "75 lakh" or "0.75 cr" → 7500000
   - "35,000/month" → rentpermonth = 35000
   - "₹45,000" → 45000
   - Ignore currency symbols and commas.
4. If the message is about renting, fill **rentpermonth** and set **price** to null.  
   If it's about selling, fill **price** and set **rentpermonth** to null.
5. If any information is missing, return null for that field.
6. Do not include any fields other than those listed above.

Here is the WhatsApp message:

${prompt}

Return only the JSON object.
`;
    let lastError = null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      // Extract JSON object if wrapped in fences or extra text
      const match = text.match(/\{[\s\S]*\}/);
      const jsonString = match ? match[0] : text;
      JSON.parse(jsonString); // validate

      return res.status(200).json({ success: true, result: jsonString });
    } catch (err) {
      lastError = err;
      console.log(`Model ${modelId} failed:`, err?.message || err);
    }

    return res.status(500).json({
      success: false,
      error: lastError?.message || "All models failed",
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
