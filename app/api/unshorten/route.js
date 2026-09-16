import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Fetch the short link on the server, following redirects
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
        });

        // response.url contains the final expanded URL with /place/@lat,lng
        return NextResponse.json({ expandedUrl: response.url || url });
    } catch (err) {
        return NextResponse.json({ expandedUrl: url, error: err.message }, { status: 200 });
    }
}