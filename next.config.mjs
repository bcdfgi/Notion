/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["pdfjs-dist", "cheerio", "mongodb"],

    // Dramatically reduces bundle compile time for icon and UI libraries
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/pm",
            "katex",
        ],
        serverActions: {
            bodySizeLimit: '1mb',
        },
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.gstatic.com',
                pathname: '/**',
            },
        ],
    },

    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;