/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled because React 18 Strict Mode double-mounts in dev, which makes
  // react-leaflet throw "Map container is already initialized" and blanks the
  // Site map / Deliveries maps. Production is unaffected.
  reactStrictMode: false,
  // The app runs fully on bundled mock data when NEXT_PUBLIC_DEMO_MODE=true,
  // so it can be demoed without the API/DB stack.
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? "true",
  },
};
export default nextConfig;
