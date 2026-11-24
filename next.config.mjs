const base = process.env.BASE_PATH ?? '';
/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: base,
  assetPrefix: base,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
  env: { NEXT_PUBLIC_BASE_PATH: base, NEXT_PUBLIC_SITE_URL: process.env.SITE_URL || 'https://yesyesgame.app' },
};
