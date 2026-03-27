import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const client = await clientPromise;
    const db = client.db("notion_clone");


    const verifiedToken = await db.collection("verificationTokens").findOne({
        email,
        token,
        expires: { $gt: new Date() }
    });

    if (verifiedToken) {

        await db.collection("verificationTokens").deleteOne({ _id: verifiedToken._id });


        return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
        return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }
}