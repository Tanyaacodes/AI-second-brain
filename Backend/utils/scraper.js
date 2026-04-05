import axios from 'axios';
import * as cheerio from 'cheerio';
// Removed top level pdf import to avoid module conflict
import { cloudinary } from '../config/cloudinary.js';

// ── Strategy 1: Microlink API ──────────────────────────────────────────────
// Runs server-side so YouTube/Twitter/Hotstar/Disney+ browser blocks don't apply.
// Free tier: 100 req/day. No API key needed.
const scrapeViaMicrolink = async (url) => {
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
    return null;
};

// ── Strategy 2: Open Graph / HTML Meta scraper ─────────────────────────────
const scrapeViaCheerio = async (url) => {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

        // ── PDFs ──────────────────────────────────────────────────────────
        if (isPDF) {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                let extractedText = "PDF Content";
                try {
                    const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
                    const pdfData = await pdf(response.data);
                    extractedText = pdfData.text;
                } catch (e) { console.warn("PDF mining failed, using fallback."); }
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

        // ── Images ────────────────────────────────────────────────────────
        if (isImage) {
            return {
                title: url.split('/').pop() || "Image Resource",
                content: "Image content",
                source: new URL(url).hostname,
                image: url
            };
        }

        // ── Strategy 1: Microlink (best for all sites — works server-side) ─
        try {
            const result = await scrapeViaMicrolink(url);
            if (result) { console.log(`[Microlink OK] ${url}`); return result; }
        } catch (mlErr) {
            console.warn(`[Microlink failed] ${mlErr.message}`);
        }

        // ── Strategy 2a: YouTube oEmbed ───────────────────────────────────
        if (isYouTube) {
            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const { data } = await axios.get(oembedUrl, { timeout: 6000 });
                return {
                    title: data.title || "YouTube Video",
                    content: `Video by ${data.author_name} on YouTube`,
                    source: "youtube.com",
                    image: data.thumbnail_url || ""
                };
            } catch (err) {
                // Hard fallback using thumbnail URL from video ID
                let videoId = "";
                try {
                    const u = new URL(url);
                    videoId = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : (u.searchParams.get('v') || '');
                } catch(e) {}
                return {
                    title: "YouTube Video",
                    content: "Watch on YouTube",
                    source: "youtube.com",
                    image: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""
                };
            }
        }

        // ── Strategy 2b: Twitter/X oEmbed ────────────────────────────────
        if (isTwitter) {
            try {
                const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
                const { data } = await axios.get(oembedUrl, { timeout: 6000 });
                return {
                    title: data.author_name ? `@${data.author_name} on X` : "Post on X",
                    content: data.html ? data.html.replace(/<[^>]*>/g, '').trim().substring(0, 280) : "Social post",
                    source: "x.com",
                    image: ""
                };
            } catch (err) {
                return { title: "Post on X (Twitter)", content: "Social media post", source: "x.com", image: "" };
            }
        }

        // ── Strategy 3: Cheerio HTML scraper (generic fallback) ───────────
        try {
            const result = await scrapeViaCheerio(url);
            if (result) { console.log(`[Cheerio OK] ${url}`); return result; }
        } catch (cheerioErr) {
            console.warn(`[Cheerio failed] ${cheerioErr.message}`);
        }

        // ── Last resort: return domain info ──────────────────────────────
        return {
            title: new URL(url).hostname.replace('www.', ''),
            content: `Saved from ${new URL(url).hostname}`,
            source: new URL(url).hostname,
            image: ""
        };

    } catch (error) {
        console.error("Scraper Error:", error.message);
        return { title: "", content: "", source: "" };
    }
};
