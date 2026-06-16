"use client";
import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client (anon key). Subject to RLS. Use in Client Components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
