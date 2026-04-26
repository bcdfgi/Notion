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


    turbopack: {
        rules: {

        },
    },

    typescript: {

        ignoreBuildErrors: true,
    },
};

export default nextConfig;
