import Knowledge from "../models/knowledge.js"
import { processKnowledge } from "../utils/ai.js"
import { scrapeUrl } from "../utils/scraper.js"

export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    await Knowledge.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Item purged from memory." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const saveKnowledge = async (req, res) => {
  try {
    const { title, url, content, type, tags: providedTags, collectionName, user } = req.body;

    let finalTitle = title;
    let finalContent = content;

    if (!finalTitle || !finalContent) {
        const metadata = await scrapeUrl(url);
        finalTitle = finalTitle || metadata.title || "New Resource";
        finalContent = finalContent || metadata.content || "No detailed content found";
    }

    const { tags: aiTags, embedding, summary, highlights } = await processKnowledge(finalContent || finalTitle, providedTags || []);

    const isVideo = url.includes('youtube.com') || url.includes('youtu.be');
    const finalType = type || (isVideo ? 'video' : 'article');

    const knowledge = await Knowledge.create({
      title: finalTitle,
      url,
      content: finalContent,
      type: finalType,
      collectionName: collectionName || "Uncategorized",
      tags: [...new Set([...(providedTags || []), ...(aiTags || [])])],
      embedding,
      summary,
      highlights: highlights || [],
      user
    });

    res.status(201).json({
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

export const getallknowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchKnowledge = async (req, res) => {
  try {
    const { q } = req.query;
    if(!q) return res.status(200).json({ success: true, data: [] });

    const results = await Knowledge.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { content: { $regex: q, $options: "i" } }
      ]
    }).limit(20);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resurfaceMemories = async (req, res) => {
  try {
    // Only fetch memories that have explicitly been pinned by the user
    const memories = await Knowledge.find({ revisit: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: memories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRevisit = async (req, res) => {
    try {
        const item = await Knowledge.findById(req.params.id);
        item.revisit = !item.revisit;
        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCollections = async (req, res) => {
    try {
        const collections = await Knowledge.distinct('collectionName');
        const defaultCollections = ["Uncategorized", "General", "Frontend", "UI"]
        const allCollections = [...new Set([...collections, ...defaultCollections])]
        res.status(200).json({ success: true, data: allCollections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}