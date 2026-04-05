import axios from 'axios';
import * as cheerio from 'cheerio';
import { cloudinary } from '../config/cloudinary.js';

// ── Strategy 0: RapidAPI (Link Preview) ───────────────────────────────────
// Most reliable for blocked sites like YouTube, Hotstar, and Twitter.
// Uses proxies to bypass bot detection.
const scrapeViaRapidAPI = async (url) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return null;

    try {
        const options = {
            method: 'GET',
            url: 'https://link-preview12.p.rapidapi.com/bulk-preview',
            params: { url: url }, // The bulk-preview might need different params, but usually they support single 'url'
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'link-preview12.p.rapidapi.com'
            }
        };

        const { data } = await axios.request(options);
        if (data && data.title) {
            return {
                title: data.title,
                content: data.description || '',
                source: data.siteName || new URL(url).hostname,
                image: data.image || ''
            };
        }
    } catch (err) {
        console.warn(`[RapidAPI failed] ${err.message}`);
    }
    return null;
};

// ── Strategy 1: Microlink API ──────────────────────────────────────────────
const scrapeViaMicrolink = async (url) => {
    try {
        const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
        const { data: mlData } = await axios.get(microlinkUrl, { timeout: 10000 });
        if (mlData.status === 'success' && mlData.data?.title) {
            return {
                title: mlData.data.title,
                content: mlData.data.description || '',
                source: mlData.data.publisher || new URL(url).hostname,
                image: mlData.data.image?.url || mlData.data.logo?.url || ''
            };
        }
    } catch (e) {}
    return null;
};

// ── Strategy 2: Open Graph / HTML Meta scraper ─────────────────────────────
const scrapeViaCheerio = async (url) => {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
        maxRedirects: 5
    });
    const $ = cheerio.load(data);
    const title = $('meta[property="og:title"]').attr('content')
        || $('meta[name="twitter:title"]').attr('content')
        || $('title').text()
        || '';
    const description = $('meta[property="og:description"]').attr('content')
        || $('meta[name="description"]').attr('content')
        || $('meta[name="twitter:description"]').attr('content')
        || '';
    const image = $('meta[property="og:image"]').attr('content')
        || $('meta[name="twitter:image"]').attr('content')
        || '';
    if (!title) return null;
    return {
        title: title.trim(),
        content: description.trim(),
        source: new URL(url).hostname,
        image
    };
};

export const scrapeUrl = async (url) => {
    try {
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const isTwitter = url.includes('twitter.com') || url.includes('x.com');
        const isPDF = url.toLowerCase().endsWith('.pdf');
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

        // ── PDFs (Internal logic) ──────────────────────────────────────────
        if (isPDF) {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                let extractedText = "PDF Content";
                try {
                    const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
                    const pdfData = await pdf(response.data);
                    extractedText = pdfData.text;
                } catch (e) { console.warn("PDF mining failed."); }
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
            } catch (err) { console.error("PDF error:", err.message); }
        }

        // ── Strategy 0: RapidAPI (High Priority if Key exists) ─────────────
        const rapidResult = await scrapeViaRapidAPI(url);
        if (rapidResult) return rapidResult;

        // ── Strategy 1: Microlink (Standard Fallback) ─────────────────────
        const microlinkResult = await scrapeViaMicrolink(url);
        if (microlinkResult) return microlinkResult;

        // ── Strategy 2a: YouTube Specific ─────────────────────────────────
        if (isYouTube) {
            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const { data } = await axios.get(oembedUrl, { timeout: 6000 });
                return {
                    title: data.title || "YouTube Video",
                    content: `Watch video by ${data.author_name} on YouTube`,
                    source: "youtube.com",
                    image: data.thumbnail_url || ""
                };
            } catch (err) {
                 // Fallback to static thumb if oEmbed fails (blocked)
                 const videoId = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
                 return { title: "YouTube Video", content: "Watch on YouTube", source: "youtube.com", image: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "" };
            }
        }

        // ── Strategy 3: Cheerio (Final HTML Scraping) ─────────────────────
        try {
            const cheerioResult = await scrapeViaCheerio(url);
            if (cheerioResult) return cheerioResult;
        } catch (ce) {}

        return {
            title: new URL(url).hostname.replace('www.', ''),
            content: `Saved from ${new URL(url).hostname}`,
            source: new URL(url).hostname,
            image: ""
        };

    } catch (error) {
        console.error("Scraper Error:", error.message);
        return { title: "New Resource", content: "No detailed info found", source: new URL(url).hostname };
    }
};
