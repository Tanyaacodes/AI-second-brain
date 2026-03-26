import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const knowledgeSchema = new mongoose.Schema({
  title: String,
  url: String,
  content: String,
  type: { type: String, default: 'article' },
  tags: [String],
  summary: String,
  category: String,
  highlights: [String],
  embedding: [Number],
  user: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false }); // Disable timestamps so I can manually set createdAt

const Knowledge = mongoose.model('KnowledgeSeed', knowledgeSchema, 'knowledges'); // Direct collection access

const seedOldMemories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const now = new Date();
    
    // 1. One Week Ago (Smart Resurface Target)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 10);

    // 2. Two Months Ago (Historical Resurface Target)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    const oldMemories = [
      {
        title: "Mastering React Hooks and Context API",
        url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
        content: "Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.",
        summary: "Comprehensive guide to React Hooks, focusing on custom hooks and logic reuse.",
        category: "Frontend",
        tags: ["react", "hooks", "frontend"],
        createdAt: oneWeekAgo,
        embedding: Array(1536).fill(0.123)
      },
      {
        title: "The Future of AI and Large Language Models",
        url: "https://openai.com/blog/planning-for-agi",
        content: "Artificial general intelligence (AGI) has the potential to benefit everyone.",
        summary: "A deep dive into the long-term planning for AGI and the roadmap of LLMs.",
        category: "AI",
        tags: ["ai", "llm", "future"],
        createdAt: twoMonthsAgo,
        embedding: Array(1536).fill(0.456)
      },
      {
          title: "Setup Your Developer Environment in 2026",
          url: "https://github.com/features/codespaces",
          content: "Cloud developer environments are the new standard for modern teams.",
          summary: "Check out the best tools to set up your dev environment efficiently.",
          category: "Productivity",
          tags: ["dev", "environment", "tools"],
          createdAt: oneWeekAgo,
          embedding: Array(1536).fill(0.789)
      }
    ];

    await Knowledge.insertMany(oldMemories);
    console.log("Old memories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedOldMemories();
