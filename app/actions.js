
'use server';
import { Resend } from 'resend';
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import {redirect} from "next/navigation";
import { ObjectId } from "mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);



export async function syncUser(accessToken) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) return { success: false };

        const googleUser = await response.json();
        const client = await clientPromise;
        const db = client.db("notion_clone");

        await db.collection("users").updateOne(
            { email: googleUser.email },
            {
                $set: {
                    name: googleUser.name,
                    image: googleUser.picture,
                    lastLogin: new Date()
                }
            },
            { upsert: true }
        );


        const cookieStore = await cookies();
        cookieStore.set("user_email", googleUser.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return { success: true };
    } catch (e) {
        console.error("Sync Error:", e);
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





// export async function getUserData(email) {
//     try {
//         const client = await clientPromise;
//         const db = client.db("notion_clone");
//
//         const user = await db.collection("users").findOne({ email: email });
//
//         return {
//             success: true,
//
//             data: {
//                 title: user?.dashboardTitle || "Untitled",
//                 content: user?.dashboardContent || ''
//             }
//         };
//     } catch (e) {
//         console.error("MongoDB Fetch Error:", e);
//         return { success: false, data: { title: "Untitled", content: '' } };
//     }
// }

export async function logout(){
    const cookieStore = await cookies();
    cookieStore.delete("user_email");
    redirect("/");
}



export async function createPage(userEmail) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");

        const newPage = {
            userEmail,
            title: "Untitled",
            content: { type: 'doc', content: [{type: 'paragraph'}] },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("pages").insertOne(newPage);
        return { success: true, pageId: result.insertedId.toString() };
    } catch (e) {
        return { success: false };
    }
}

export async function getPages(userEmail) {
    try {
        const client = await clientPromise;
        const db = client.db("notion_clone");
        const pages = await db.collection("pages")
            .find({ userEmail })
            .sort({ updatedAt: -1 })
            .toArray();

        return {
            success: true,
            pages: pages.map(p => ({ ...p, _id: p._id.toString() }))
        };
    } catch (e) {
        return { success: false, pages: [] };
    }
}


export async function updatePageContent(pageId, data) {
    try {

        if (!pageId || !ObjectId.isValid(pageId)) {
            console.error("Invalid Page ID provided");
            return { success: false, error: "Invalid ID" };
        }

        const client = await clientPromise;
        const db = client.db("notion_clone");


        const cookieStore = await cookies();
        const userEmail = cookieStore.get("user_email")?.value;

        const updateResult = await db.collection("pages").updateOne(
            {
                _id: new ObjectId(pageId),
                userEmail: userEmail
            },
            {
                $set: {
                    title: data.title || "Untitled",
                    content: data.content,
                    updatedAt: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, error: "Page not found or unauthorized" };
        }

        return { success: true };
    } catch (e) {
        console.error("Save Error:", e);
        return { success: false };
    }
}

export async function deletePage(pageId) {
    try {
        if (!pageId || !ObjectId.isValid(pageId)) return { success: false };

        const client = await clientPromise;
        const db = client.db("notion_clone");

        const cookieStore = await cookies();
        const userEmail = cookieStore.get("user_email")?.value;

        const result = await db.collection("pages").deleteOne({
            _id: new ObjectId(pageId),
            userEmail: userEmail
        });

        return { success: result.deletedCount > 0 };
    } catch (e) {
        console.error("Delete Error:", e);
        return { success: false };
    }
}