"use client";

import Link from "next/link";
import Image from "next/image";

export default function Privacy() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center justify-between min-w-xs md:min-w-xl px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow shadow-black/10">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Lucidream Logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-white text-xl font-orbitron font-medium tracking-tight hidden md:block">
              lucidream
            </span>
          </Link>
          <Link
            href="/auth"
            className="bg-white text-black px-4 py-2 rounded-lg transition-all duration-200 font-orbitron font-medium hover:bg-black hover:text-white"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 font-orbitron">
              Privacy Policy
            </h1>

            <div className="text-gray-200 space-y-8 leading-relaxed">
              <div className="text-sm text-gray-400 mb-8">
                Last updated: August 12, 2025
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  1. Introduction
                </h2>
                <p>
                  Welcome to LuciDream ("we," "our," or "us"). This Privacy
                  Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our AI avatar chat application
                  and related services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  2. Information We Collect
                </h2>

                <h3 className="text-lg font-semibold text-white mb-3">
                  2.1 Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email address and authentication credentials</li>
                  <li>Display name and profile information</li>
                  <li>
                    Payment information (processed securely through
                    LemonSqueezy)
                  </li>
                  <li>Subscription and billing history</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  2.2 Usage Data
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Chat messages and conversation history with AI avatars
                  </li>
                  <li>
                    Voice recordings (processed for speech-to-text conversion)
                  </li>
                  <li>
                    Affection system data and character relationship progress
                  </li>
                  <li>Custom character creations and preferences</li>
                  <li>Premium content access patterns and preferences</li>
                  <li>Application usage analytics and performance metrics</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  2.3 Technical Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                  <li>Session data and access logs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our AI avatar chat services</li>
                  <li>Process conversations through OpenAI's GPT models</li>
                  <li>Convert speech to text using OpenAI Whisper</li>
                  <li>
                    Generate voice responses using ElevenLabs text-to-speech
                  </li>
                  <li>Track relationship progression with AI characters</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Improve our services and user experience</li>
                  <li>Send important service updates and notifications</li>
                  <li>Provide customer support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  4. Third-Party Services
                </h2>
                <p>We integrate with the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>
                    <strong>OpenAI:</strong> AI chat responses and
                    speech-to-text processing
                  </li>
                  <li>
                    <strong>ElevenLabs:</strong> Text-to-speech voice generation
                  </li>
                  <li>
                    <strong>Supabase:</strong> Database and authentication
                    services
                  </li>
                  <li>
                    <strong>LemonSqueezy:</strong> Payment processing and
                    subscription management
                  </li>
                  <li>
                    <strong>Vercel:</strong> Hosting and content delivery
                  </li>
                </ul>
                <p className="mt-4">
                  Each service has its own privacy policy governing their use of
                  your data. We encourage you to review their respective privacy
                  policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  5. Data Storage and Security
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Your data is stored securely using industry-standard
                    encryption
                  </li>
                  <li>
                    We implement appropriate technical and organizational
                    security measures
                  </li>
                  <li>
                    Voice recordings are processed in real-time and not
                    permanently stored
                  </li>
                  <li>
                    Payment information is handled exclusively by LemonSqueezy
                  </li>
                  <li>
                    We regularly update our security practices and conduct
                    audits
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  6. Data Retention
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Account information: Retained while your account is active
                  </li>
                  <li>
                    Chat history: Stored to maintain character relationship
                    continuity
                  </li>
                  <li>
                    Usage analytics: Aggregated data retained for service
                    improvement
                  </li>
                  <li>
                    Voice data: Processed in real-time and immediately discarded
                  </li>
                  <li>
                    Custom characters: Retained while your account is active
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  7. Your Rights
                </h2>
                <p>
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Object to certain types of data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  8. Children's Privacy
                </h2>
                <p>
                  LuciDream is suitable for users 13 years and older with
                  parental consent for minors. We take special care to protect
                  children's privacy. If we become aware that we have collected
                  personal information from a child under 13 without parental
                  consent, we will delete such information promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  9. International Users
                </h2>
                <p>
                  LuciDream operates globally and your information may be
                  transferred to and processed in countries other than your own.
                  We ensure appropriate safeguards are in place for
                  international data transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  10. Updates to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new Privacy
                  Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  11. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us through our Discord server
                  or support channels.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
