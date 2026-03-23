import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeUrl = async (url) => {
  try {
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
    
    // Fallback: Use some domain-specific scraping if needed (like YouTube)
    // For now, generic metadata extraction
    
    return { 
      title: title.trim(), 
      content: description.trim(), 
      source: new URL(url).hostname 
    };
  } catch (error) {
    console.error("Scraper Error:", error.message);
    return { title: "", content: "", source: "" };
  }
};
