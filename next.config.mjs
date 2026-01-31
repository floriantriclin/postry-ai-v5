/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ENABLE_PERSIST_FIRST: process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST || 'false',
    NEXT_PUBLIC_QUIZ_USE_MOCK: process.env.NEXT_PUBLIC_QUIZ_USE_MOCK || 'false',
  },
};

export default nextConfig;
