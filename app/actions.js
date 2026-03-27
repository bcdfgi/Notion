'use server';
import { Resend } from 'resend';
import clientPromise from "@/lib/mongodb";


const resend = new Resend(process.env.RESEND_API_KEY);
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
export async function sendMagicLink(email) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");


        const token = Math.random().toString(36).substring(2, 15);
        const expires = new Date(Date.now() + 3600000);


        await db.collection("verificationTokens").updateOne(
            { email },
            { $set: { token, expires } },
            { upsert: true }
        );


        const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}&email=${email}`;


        await resend.emails.send({
            from: 'notion@resend.dev',
            to: email,
            subject: 'Log in to your Notion Workspace',
            html: `<p>Click the link below to log in:</p><a href="${magicLink}">Log in to Notion</a>`
        });

        return { success: true };
    } catch (error) {
        console.error("Email Error:", error);
        return { success: false };
    }
}

export async function updatePageContent(userEmail, data) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");

        await db.collection("users").updateOne(
            { email: userEmail },
            {
                $set: {

                    dashboardTitle: data.title,
                    dashboardContent: data.content,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return { success: true };
    } catch (e) {
        console.error("MongoDB Save Error:", e);
        return { success: false };
    }
}



export async function getUserData(email) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");

        const user = await db.collection("users").findOne({ email: email });

        return {
            success: true,

            data: {
                title: user?.dashboardTitle || "Untitled",
                content: user?.dashboardContent || ''
            }
        };
    } catch (e) {
        console.error("MongoDB Fetch Error:", e);
        return { success: false, data: { title: "Untitled", content: '' } };
    }
}