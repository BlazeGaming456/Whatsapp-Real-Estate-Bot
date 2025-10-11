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

    const fullPrompt = `You're an AI Real Estate Listing Parser. I'm giving you the messages from a Real Estate Whatsapp group. I want you to take it, and then categorize it into features such as bhk, location, price and then return a JSON object output.
            
            The below is the Whatsapp chat that has been exported -
            ${prompt}

            The output should be a JSON object with the following keys - 
            bhk numeric, 
            location text, 
            price numeric,
            contact text. If any of the features are not present in the message, please return null as the value for that key. Only return values with types as mentioned. The output should be only a JSON object and nothing else. No text regarding assumptions, etc., should be included in the response. Only the JSON object.`;
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
