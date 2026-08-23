/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.gstatic.com',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },


    turbopack: {
        rules: {

        },
    },

    typescript: {

        ignoreBuildErrors: true,
    },
};

export default nextConfig;
