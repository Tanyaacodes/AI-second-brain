import Knowledge from "../models/knowledge.js"
import { processKnowledge } from "../utils/ai.js"
import { scrapeUrl } from "../utils/scraper.js"

/*// DELETE /api/v1/knowledge/:id
// Description: Remove a specific knowledge item */
export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    await Knowledge.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Item purged from memory." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*// POST /api/v1/knowledge/scrape?url=...
// Description: Automatically extract info from a URL before saving */
export const fetchUrlMetadata = async (req, res) => {
  try {
    const { url } = req.query;
    if(!url) return res.status(400).json({ success: false, message: "URL is required" });
    
    const metadata = await scrapeUrl(url);
    res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*// POST /api/v1/knowledge/save
// Description: Save with AI-powered tagging and embedding storage */
export const saveKnowledge = async (req, res) => {
  try {
    const { title, url, content, type, tags: providedTags, user } = req.body;

    // Use URL scraper if title/content is missing
    let finalTitle = title;
    let finalContent = content;

    if (!finalTitle || !finalContent) {
        const metadata = await scrapeUrl(url);
        finalTitle = finalTitle || metadata.title || "New Resource";
        finalContent = finalContent || metadata.content || "No detailed content found";
    }

    // 1. AI Processing (Extracting tags and generating embeddings automatically)
    const { tags: aiTags, embedding, summary } = await processKnowledge(finalContent || finalTitle, providedTags || []);

    const knowledge = await Knowledge.create({
      title: finalTitle,
      url,
      content: finalContent,
      type: type || "article",
      tags: [...new Set([...(providedTags || []), ...aiTags])],
      embedding,
      user
    });

    res.status(201).json({
      success: true,
      message: "Knowledge organized successfully!",
      data: {
        ...knowledge._doc,
        aiSummary: summary
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*// GET /api/v1/knowledge
// Description: Get all saved knowledge items */
export const getallknowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET /api/v1/knowledge/search?q=query
// Description: Semantic or keyword search */
export const searchKnowledge = async (req, res) => {
  try {
    const { q } = req.query;
    if(!q) return res.status(200).json({ success: true, data: [] });

    // Simple Keyword Search for now (Regex)
    const results = await Knowledge.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { content: { $regex: q, $options: "i" } }
      ]
    }).limit(20);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET /api/v1/knowledge/resurface
// Description: Get memories from exactly X time ago (Recalling information) */
export const resurfaceMemories = async (req, res) => {
  try {
    // Logic for resurfacing: fetch items from months ago
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - 2); // 2 months ago (as per request)

    const memories = await Knowledge.find({
      createdAt: { 
        $gte: new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000), // Within a 2-day window 2 months ago
        $lte: new Date(targetDate.getTime() + 2 * 24 * 60 * 60 * 1000) 
      }
    }).limit(5);

    res.status(200).json({
      success: true,
      data: memories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};