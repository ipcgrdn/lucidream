"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/Authcontext";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dream");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dream`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Logo in top left */}
      <Link href="/" className="absolute top-4 left-6 z-20 flex items-center">
        <Image
          src="/logo.png"
          alt="Lucidream Logo"
          width={40}
          height={40}
          priority
        />
        <span className="text-white text-xl font-orbitron font-medium tracking-tight">
          lucidream
        </span>
      </Link>

      {/* Video positioned on right side */}
      <div className="hidden lg:block absolute lg:right-12 top-1/2 transform -translate-y-1/2 w-256 h-144 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover rounded-4xl opacity-70"
        >
          <source src="/video/girl3.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Login Form - Can overlap with video */}
      <div className="relative z-10 min-h-screen flex mx-4 md:mx-0">
        <div className="flex-1 flex items-center justify-center lg:justify-start lg:pl-12">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-4xl p-8 shadow-2xl">
            <div className="text-center font-orbitron mb-8">
              <h1 className="text-4xl font-bold text-black mb-1">
                Get access to <br />
                lucidream
              </h1>
              <p className="text-gray-800">Sign up in just ten seconds</p>
            </div>

            <button
              className="w-full inline-flex items-center py-4 px-4 rounded-xl bg-black text-white text-sm font-orbitron font-medium hover:bg-black/90 transition-colors duration-200"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            <div className="mt-4 text-center font-orbitron text-xs">
              <p className="text-gray-600">
                By continuing, you agree with the
                <br />
                <Link href="/terms" className="hover:text-black">
                  Terms{" "}
                </Link>
                and{" "}
                <Link href="/privacy" className="hover:text-black">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
