import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Notion",
  description: "A professional workspace built with Next.js",
};

export default function RootLayout({ children }) {
  return (
      <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">
      {}
      <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        {children}
      </GoogleOAuthProvider>
      </body>
      </html>
  );
}
