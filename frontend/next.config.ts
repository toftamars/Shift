import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Allow external images from Supabase
  images: {
    domains: ['iggymtcteabswsrginyi.supabase.co'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://ttkefeagnivgxejmwhjr.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a2VmZWFnbml2Z3hlam13aGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzc5ODgsImV4cCI6MjA4NTcxMzk4OH0.YL3hVHCXXYgr3-33wNYAcmJ2euWoI2rtIkASMbzAPGI',
  },
};

export default nextConfig;
