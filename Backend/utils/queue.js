import { EventEmitter } from 'events';
import Knowledge from '../models/knowledge.js';
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const jobEmitter = new EventEmitter();

jobEmitter.on('process-knowledge', async (data) => {
    const { itemId, processFunction, updateRelationsFunction, isVision, imageUrl } = data;
    try {
        const item = await Knowledge.findById(itemId);
        if (!item) return;

        let visionData = null;
        if (isVision && imageUrl) {
            console.log(`🖼️ Processing Vision for ${item.title}...`);
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Analyze this image. Provide a title, 3 key tags, a 1-sentence description, and 2 interesting highlights about the content in the image. Return JSON: {title:'', tags:[], summary:'', highlights:[]}" },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ],
                    },
                ],
                response_format: { type: "json_object" }
            });
            visionData = JSON.parse(response.choices[0].message.content);
        }

        // Perform AI processing (Embeddings, Tags etc)
        const textToProcess = visionData?.summary || item.content || item.title;
        const ai = await processFunction(textToProcess, item.tags);
        
        item.title = visionData?.title || item.title;
        item.tags = [...new Set([...item.tags, ...(ai.tags || []), ...(visionData?.tags || []), (item.type === 'pdf' ? 'pdf' : (item.type === 'image' ? 'image' : ''))])].filter(Boolean);
        item.summary = ai.summary || visionData?.summary || item.summary;
        item.highlights = ai.highlights || visionData?.highlights || item.highlights;
        item.embedding = ai.embedding;
        item.isProcessing = false;
        
        await item.save();

        // Perform relationship linking
        await updateRelationsFunction(item);
        
        console.log(`✅ Background processing complete for: ${item.title}`);
    } catch (err) {
        console.error(`❌ Background processing failed for ${itemId}:`, err);
    }
});

export default jobEmitter;
