import { OpenAI } from "openai"
import natural from "natural"
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tokenizer = new natural.WordTokenizer();

const generateMockEmbedding = (text) => {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(1536).fill(hash / 1000).map(v => v * Math.random());
};

// --- NEW VECTOR MATH ---
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
// -----------------------

const extractMockHighlights = (text) => {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.filter(s => s.length > 30).slice(0, 2).map(s => s.trim());
};

export const processKnowledge = async (text, providedTags = []) => {
  let tags = [...providedTags];
  let embedding = [];
  let summary = "";
  let highlights = [];

  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Extract 5 relevant tags, a 1-sentence summary, and 2 key highlight quotes from the following text." },
          { role: "user", content: text }
        ],
      });

      const aiContent = response.choices[0].message.content;
      const lines = aiContent.split("\n");
      tags = [...new Set([...tags, ...lines[0].replace("Tags:", "").split(",").map(t => t.trim())])];
      summary = lines[1]?.replace("Summary:", "").trim();
      highlights = extractMockHighlights(text); 

      const embedResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      embedding = embedResponse.data[0].embedding;

    } else {
      summary = text.substring(0, 150) + "...";
      const tfidf = new natural.TfIdf();
      tfidf.addDocument(text);
      const topTerms = tfidf.listTerms(0).slice(0, 5).map(item => item.term);
      tags = [...new Set([...tags, ...topTerms])];
      
      embedding = generateMockEmbedding(text);
      highlights = extractMockHighlights(text);
    }

    return { tags, embedding, summary, highlights };

  } catch (error) {
    console.error("AI Processing error:", error.message);
    return { tags, embedding: generateMockEmbedding(text), summary: text.substring(0, 50), highlights: extractMockHighlights(text) };
  }
};
