import axios from 'axios';
import * as cheerio from 'cheerio';
// Removed top level pdf import to avoid module conflict
import { cloudinary } from '../config/cloudinary.js';

export const scrapeUrl = async (url) => {
  try {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const isPDF = url.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

    // --- Special YouTube Scraper ---
    if (isYouTube) {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const { data } = await axios.get(oembedUrl);
            return {
                title: data.title || "YouTube Video",
                content: `Video by ${data.author_name} (YouTube)`,
                source: "youtube.com",
                image: data.thumbnail_url || ""
            };
        } catch (err) {
            console.error("YouTube oEmbed failed:", err.message);
        }
    }

    // --- Special Twitter/X Scraper ---
    if (isTwitter) {
        try {
            const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(oembedUrl);
            return {
                title: data.author_name ? `Tweet by ${data.author_name}` : "Tweet",
                content: data.html ? data.html.replace(/<[^>]*>/g, '').substring(0, 200) : "Social post content",
                source: "twitter.com",
                image: "" // Twitter oembed doesn't always provide image easily
            };
        } catch (err) {
            console.error("Twitter oEmbed failed:", err.message);
        }
    }

    if (isPDF) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            
            let extractedText = "PDF Content";
            try {
                const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
                const data = await pdf(response.data);
                extractedText = data.text;
            } catch (e) {
                console.warn("PDF mining failed, using fallback.");
            }
            
            // Mirror to Cloudinary
            const uploadRes = await new Promise((resolve) => {
                cloudinary.uploader.upload_stream({ folder: 'burfi-pdfs', resource_type: 'raw' }, (err, res) => {
                    resolve(res);
                }).end(response.data);
            });

            return {
                title: url.split('/').pop() || "PDF Document",
                content: extractedText.substring(0, 5000), 
                source: new URL(url).hostname,
                image: uploadRes?.secure_url || ""
            };
        } catch (err) {
            console.error("PDF download/mirror error:", err.message);
        }
    }

    if (isImage) {
        return {
            title: url.split('/').pop() || "Image Resource",
            content: "Image content",
            source: new URL(url).hostname,
            image: url // Image processing will handle this via Vision in queue.js
        };
    }

    // Existing Cheerio logic for HTML
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || "";
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || "";
    const image = $('meta[property="og:image"]').attr('content') || "";
    
    return { 
      title: title.trim(), 
      content: description.trim(), 
      source: new URL(url).hostname,
      image: image 
    };
  } catch (error) {
    console.error("Scraper Error:", error.message);
    return { title: "", content: "", source: "" };
  }
};
