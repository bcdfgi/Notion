'use server';

import clientPromise from "@/lib/mongodb";

export async function syncUser(userData) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");

        const user = await db.collection("users").updateOne(
            { email: userData.email },
            {
                $set: {
                    name: userData.name,
                    image: userData.picture,
                    lastLogin: new Date()
                }
            },
            { upsert: true }
        );

        return { success: true };
    } catch (e) {
        console.error("MongoDB Error:", e);
        return { success: false };
    }
}