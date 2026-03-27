import Knowledge from "../models/knowledge.js"
import { processKnowledge, cosineSimilarity } from "../utils/ai.js"
import { scrapeUrl } from "../utils/scraper.js"
import jobEmitter from "../utils/queue.js"
import axios from "axios"

export const deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Knowledge.findOne({ _id: id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: "Not found or unauthorized" });
    await item.deleteOne();
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
    let finalImage = "";

    if (!finalTitle || !finalContent) {
        const metadata = await scrapeUrl(url);
        finalTitle = finalTitle || metadata.title || "New Resource";
        finalContent = finalContent || metadata.content || "No detailed content found";
        finalImage = metadata.image || "";
    }

    const { tags: aiTags, embedding, summary, highlights } = await processKnowledge(finalContent || finalTitle, providedTags || []);

    const isVideo = url.includes('youtube.com') || url.includes('youtu.be');
    const finalType = type || (isVideo ? 'video' : 'article');

    let finalCollection = collectionName;

    // --- AUTO CLUSTERING LOGIC ---
    if (!finalCollection || finalCollection === "Uncategorized") {
      const neighbors = await Knowledge.find({ 
        user: req.user._id,
        embedding: { $exists: true, $not: { $size: 0 } },
        collectionName: { $ne: "Uncategorized" }
      });
      
      if (neighbors.length > 0) {
        const sorted = neighbors
          .map(n => ({ col: n.collectionName, similarity: cosineSimilarity(embedding, n.embedding) }))
          .filter(n => n.similarity > 0.85) // Very high threshold for auto-categorization
          .sort((a, b) => b.similarity - a.similarity);
          
        if (sorted.length > 0) {
          finalCollection = sorted[0].col;
        }
      }
    }
    // ------------------------------

    const knowledge = await Knowledge.create({
      title: finalTitle,
      url,
      content: finalContent,
      type: finalType,
      collectionName: finalCollection || "Uncategorized",
      tags: [...new Set([...(providedTags || []), ...(aiTags || [])])],
      image: finalImage,
      embedding,
      summary,
      highlights: highlights || [],
      user: req.user?._id || null
    });

    // --- AUTO RELATED ITEMS LOGIC ---
    if (embedding && embedding.length > 0) {
      const others = await Knowledge.find({ 
        _id: { $ne: knowledge._id }, 
        user: req.user._id,
        embedding: { $exists: true, $not: { $size: 0 } }
      });
      
      const related = others
        .map(other => ({ _id: other._id, similarity: cosineSimilarity(embedding, other.embedding) }))
        .filter(res => res.similarity > 0.8) // High similarity threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map(res => res._id);
      
      if (related.length > 0) {
        knowledge.relatedItems = related;
        await knowledge.save();
        
        // Back-link: add this to them too
        await Knowledge.updateMany(
            { _id: { $in: related } },
            { $addToSet: { relatedItems: knowledge._id } }
        );
      }
    }
    // --------------------------------
    // --- BACKGROUND PROCESSING (Queue) ---
    jobEmitter.emit('process-knowledge', {
        itemId: knowledge._id,
        processFunction: processKnowledge,
        updateRelationsFunction: updateRelations,
        isVision: knowledge.type === 'image' || !!finalImage,
        imageUrl: finalImage
    });
    // --------------------------------------

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

// Helper for background relations
export const updateRelations = async (knowledge) => {
    if (!knowledge.embedding || knowledge.embedding.length === 0) return;
    
    const others = await Knowledge.find({ 
        _id: { $ne: knowledge._id }, 
        user: knowledge.user,
        embedding: { $exists: true, $not: { $size: 0 } }
    });
    
    const related = others
        .map(other => ({ _id: other._id, similarity: cosineSimilarity(knowledge.embedding, other.embedding) }))
        .filter(res => res.similarity > 0.8)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10)
        .map(res => res._id);
    
    if (related.length > 0) {
        knowledge.relatedItems = related;
        await knowledge.save();
        
        await Knowledge.updateMany(
            { _id: { $in: related } },
            { $addToSet: { relatedItems: knowledge._id } }
        );
    }
}

export const getallknowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.find({ user: req.user._id }).sort({ createdAt: -1 });
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

    // 1. Regex Search (Exact-ish)
    const regexResults = await Knowledge.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { content: { $regex: q, $options: "i" } }
      ]
    }).limit(10);

    // 2. Semantic Search (AI-powered) - Automatic fallback/augmentation
    try {
        const { embedding: queryEmbedding } = await processKnowledge(q);
        const all = await Knowledge.find({ user: req.user._id, embedding: { $exists: true, $not: { $size: 0 } } });
        
        const semanticResults = all
            .map(item => ({ ...item._doc, similarity: cosineSimilarity(queryEmbedding, item.embedding) }))
            .filter(item => item.similarity > 0.75) 
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);
            
        // Merge results: Regex matches first, then Semantic matches
        const seen = new Set(regexResults.map(r => r._id.toString()));
        const hybridResults = [...regexResults];
        
        semanticResults.forEach(res => {
            if (!seen.has(res._id.toString())) {
                hybridResults.push(res);
            }
        });
        
        return res.status(200).json({ success: true, data: hybridResults });
    } catch (err) {
        console.error("Semantic search error:", err.message);
        return res.status(200).json({ success: true, data: regexResults });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resurfaceMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Manual revisit items (Pinned)
    const manualMemories = await Knowledge.find({ user: userId, revisit: true }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: manualMemories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRevisit = async (req, res) => {
    try {
        const item = await Knowledge.findOne({ _id: req.params.id, user: req.user._id });
        if (!item) return res.status(404).json({ success: false, message: "Not found or unauthorized" });
        item.revisit = !item.revisit;
        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const uploadFileKnowledge = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const { path: cloudinaryUrl, mimetype, originalname } = req.file;
        const isPDF = mimetype === 'application/pdf';
        const isImage = mimetype.startsWith('image/');

        let content = "File upload";
        let aiTags = [];
        let embedding = [];
        let summary = "";
        let highlights = [];

        if (isPDF) {
            try {
                const response = await axios.get(cloudinaryUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                
                try {
                    const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
                    const pdfData = await pdf(buffer);
                    content = pdfData.text.substring(0, 5000);
                } catch (e) {
                    console.warn("PDF mining failed in controller, using fallback.");
                }
            } catch (err) {
                console.error("PDF download error in controller:", err.message);
            }
        }

        const ai = await processKnowledge(content || originalname);
        
        const knowledge = await Knowledge.create({
            title: originalname,
            url: cloudinaryUrl,
            content: content,
            type: isPDF ? 'pdf' : (isImage ? 'image' : 'article'),
            collectionName: "Uploads",
            tags: ai.tags,
            image: cloudinaryUrl,
            embedding: ai.embedding,
            summary: ai.summary,
            highlights: ai.highlights,
            user: req.user._id
        });

        // Trigger background
        jobEmitter.emit('process-knowledge', {
            itemId: knowledge._id,
            processFunction: processKnowledge,
            updateRelationsFunction: updateRelations,
            isVision: isImage,
            imageUrl: cloudinaryUrl
        });

        res.status(201).json({ success: true, data: knowledge });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCollections = async (req, res) => {
    try {
        const collections = await Knowledge.distinct('collectionName', { user: req.user._id });
        const defaultCollections = ["Uncategorized", "General", "Frontend", "UI"]
        const allCollections = [...new Set([...collections, ...defaultCollections])]
        res.status(200).json({ success: true, data: allCollections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}