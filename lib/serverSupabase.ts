// 서버 전용 Supabase 클라이언트 - Service Role Key 사용
// 클라이언트에 절대 노출되어서는 안 됨!

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing env.SUPABASE_SERVICE_ROLE_KEY - Server-only environment variable required"
  );
}

// Service Role Key를 사용한 서버 전용 클라이언트 (RLS 우회)
export const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
