import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Gemini SDK Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, image, file } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const parts: any[] = [{ text: message || " " }];
    
    if (image?.data) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }

    if (file?.data) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    }

    // Filter history to ensure alternating roles and only user/model roles
    const formattedHistory: any[] = [];
    const rawHistory = history || [];
    
    for (let i = 0; i < rawHistory.length; i++) {
      const h = rawHistory[i];
      if (h.role !== 'user' && h.role !== 'model') continue;
      
      // Basic role alternation check
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === h.role) {
        // If consecutive roles, skip or merge. For now, let's skip the earlier one if it's the same role
        formattedHistory[formattedHistory.length - 1] = {
          role: h.role,
          parts: [{ text: h.content || " " }]
        };
      } else {
        formattedHistory.push({
          role: h.role,
          parts: [{ text: h.content || " " }]
        });
      }
    }

    // Ensure the last message in history is NOT a user message before we add the current user message
    // If it is, we remove it from history (since it's likely the same as the current message or a duplicate)
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }
    
    console.log(`Sending prompt to Gemini with ${formattedHistory.length} history messages`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: 'user', parts }
      ],
      config: {
        systemInstruction: `You are MA AI Assistant, the prestigious "Gold Edition" artificial intelligence. 
        Your responses must be elite: precise, deeply analytical, yet warmly professional.
        
        Core Directive:
        - Provide high-value, comprehensive analysis.
        - Anticipate next steps for the user.
        - Handle documents and images with exceptional detail.
        - Maintain a tone of professional excellence.
        - Multilingual fluency is mandatory; always match the user's language.
        
        Branding: You are the peak of MA's AI technology, reserved for high-performance users.`,
      },
    });

    const text = response.text;
    if (!text) {
      console.warn("Gemini returned empty text or was blocked.");
      res.json({ text: "I'm sorry, I couldn't generate a response. Please try again." });
    } else {
      res.json({ text });
    }
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// Text to Speech API
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MA AI Assistant running on http://localhost:${PORT}`);
  });
}

setupServer();
