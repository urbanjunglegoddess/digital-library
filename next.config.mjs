/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design-token layer and Button component live in this repo's
  // component-library package and are consumed directly by the app.
  // Keep the transpile allowance so their .tsx/.css resolve cleanly.
  transpilePackages: [],
};

export default nextConfig;
