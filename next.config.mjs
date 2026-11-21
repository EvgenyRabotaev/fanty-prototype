const base = process.env.BASE_PATH ?? '/fanty-prototype';
/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: base,
  assetPrefix: base,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
  env: { NEXT_PUBLIC_BASE_PATH: base },
};
