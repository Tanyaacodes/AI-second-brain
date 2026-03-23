import { OpenAI } from "openai"
import natural from "natural"
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "optional_key_for_no_open_api_key_usage",
});

const tokenizer = new natural.WordTokenizer();

// Helper to generate a simple "mock" embedding if API is missing
const generateMockEmbedding = (text) => {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(1536).fill(hash / 1000).map(v => v * Math.random());
};

export const processKnowledge = async (text, providedTags = []) => {
  let tags = [...providedTags];
  let embedding = [];
  let summary = "";

  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "optional_key_for_no_open_api_key_usage") {
      // AI Processing (OpenAI)
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Extract 5 relevant tags and a 1-sentence summary from the following text." },
          { role: "user", content: text }
        ],
      });

      const aiContent = response.choices[0].message.content;
      // Extract tags (simple splitting logic)
      const lines = aiContent.split("\n");
      tags = [...new Set([...tags, ...lines[0].replace("Tags:", "").split(",").map(t => t.trim())])];
      summary = lines[1]?.replace("Summary:", "").trim();

      // Get Embeddings
      const embedResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      embedding = embedResponse.data[0].embedding;

    } else {
      // Fallback: Simple keyword extraction & mock embeddings
      summary = text.substring(0, 150) + "...";
      // Basic frequency-based tag extraction (simplified)
      const tfidf = new natural.TfIdf();
      tfidf.addDocument(text);
      const topTerms = tfidf.listTerms(0).slice(0, 5).map(item => item.term);
      tags = [...new Set([...tags, ...topTerms])];
      
      embedding = generateMockEmbedding(text);
    }

    return { tags, embedding, summary };

  } catch (error) {
    console.error("AI Processing error:", error.message);
    return { tags, embedding: generateMockEmbedding(text), summary: text.substring(0, 50) };
  }
};
