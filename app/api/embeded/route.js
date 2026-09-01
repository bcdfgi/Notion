import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });

        const html = await response.text();
        const $ = cheerio.load(html);

        const data = {
            title: $('meta[property="og:title"]').attr('content') || $('title').text() || url,
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
            image: $('meta[property="og:image"]').attr('content') || null,
            favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '',
            url
        };

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Could not resolve metadata' }, { status: 500 });
    }
}

