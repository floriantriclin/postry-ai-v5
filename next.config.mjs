/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ENABLE_PERSIST_FIRST: process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST || 'false',
  },
};

export default nextConfig;
