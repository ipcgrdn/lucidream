"use client";

import Link from "next/link";
import Image from "next/image";

export default function Terms() {
  return (
    <div className="min-h-screen bg-black">
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
              Terms of Service
            </h1>

            <div className="text-gray-200 space-y-8 leading-relaxed">
              <div className="text-sm text-gray-400 mb-8">
                Last updated: August 12, 2025
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  1. Agreement to Terms
                </h2>
                <p>
                  By accessing or using LuciDream ("Service," "we," "us," or
                  "our"), you agree to be bound by these Terms of Service
                  ("Terms"). If you disagree with any part of these terms, you
                  may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  2. Description of Service
                </h2>
                <p>
                  LuciDream is an AI-powered virtual reality chat application
                  that allows users to interact with lifelike 3D avatars through
                  text and voice conversations. The Service includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>
                    Real-time conversations with AI-powered virtual characters
                  </li>
                  <li>
                    Voice interaction capabilities using speech-to-text and
                    text-to-speech
                  </li>
                  <li>
                    Relationship progression system with affection mechanics
                  </li>
                  <li>Custom character creation and customization</li>
                  <li>Premium subscription features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  3. User Eligibility
                </h2>

                <h3 className="text-lg font-semibold text-white mb-3">
                  3.1 General Access
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must be at least 13 years old to use this Service</li>
                  <li>
                    You must provide accurate and complete registration
                    information
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  3.2 Premium Content Access
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Premium features require a valid subscription
                  </li>
                  <li>
                    Custom character creation is available to premium users
                  </li>
                  <li>
                    Premium users get access to additional chat features
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  3.3 Account Requirements
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    You may not create multiple accounts for the same person
                  </li>
                  <li>You may not share your account with others</li>
                  <li>
                    Parents are responsible for monitoring minors' use of the
                    Service
                  </li>
                  <li>
                    Account holders are responsible for all activity on their
                    account
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  4. Acceptable Use Policy
                </h2>
                <p>You agree NOT to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Engage in illegal, harmful, or abusive behavior</li>
                  <li>
                    Share content that is hateful, discriminatory, or
                    threatening
                  </li>
                  <li>Attempt to manipulate or exploit the AI systems</li>
                  <li>
                    Reverse engineer or attempt to extract proprietary
                    algorithms
                  </li>
                  <li>
                    Use automated tools or bots to interact with the Service
                  </li>
                  <li>
                    Share or distribute inappropriate content involving minors
                  </li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Interfere with the proper functioning of the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  5. AI Content and Service Features
                </h2>

                <h3 className="text-lg font-semibold text-white mb-3">
                  5.1 AI-Generated Content
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    All AI responses are generated automatically and do not
                    represent human opinions
                  </li>
                  <li>
                    AI characters are fictional entities and do not represent
                    real individuals
                  </li>
                  <li>
                    We do not guarantee the accuracy or appropriateness of
                    AI-generated content
                  </li>
                  <li>
                    The Service is for entertainment purposes and not a
                    substitute for human relationships
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  5.2 Content Categories
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Basic characters</strong> are available to all users
                  </li>
                  <li>
                    <strong>Premium and custom characters</strong> are available
                    with subscription
                  </li>
                  <li>
                    All conversations are powered by OpenAI and follow content
                    guidelines
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  5.3 User Responsibility
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Users are responsible for their own emotional well-being
                    during interactions
                  </li>
                  <li>Parents should monitor minors' use of the Service</li>
                  <li>
                    We reserve the right to moderate and filter content at our
                    discretion
                  </li>
                  <li>
                    Users must comply with applicable laws in their jurisdiction
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  6. Premium Subscriptions
                </h2>

                <h3 className="text-lg font-semibold text-white mb-3">
                  6.1 Subscription Terms
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Premium subscriptions are billed monthly or annually</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Premium features are subject to change</li>
                  <li>No refunds for partial subscription periods</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  6.2 Payment Processing
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Payments are processed securely through LemonSqueezy</li>
                  <li>
                    You are responsible for keeping payment information current
                  </li>
                  <li>Failed payments may result in service suspension</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  6.3 Cancellation
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may cancel your subscription at any time</li>
                  <li>
                    Cancellation takes effect at the end of the current billing
                    period
                  </li>
                  <li>
                    You retain access to premium features until the subscription
                    expires
                  </li>
                  <li>
                    Account data is retained according to our Privacy Policy
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  7. Intellectual Property
                </h2>

                <h3 className="text-lg font-semibold text-white mb-3">
                  7.1 Our Rights
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>LuciDream, logos, and branding are our trademarks</li>
                  <li>AI models, algorithms, and software are proprietary</li>
                  <li>
                    3D avatars and animations are our intellectual property
                  </li>
                  <li>
                    You may not reproduce, distribute, or create derivative
                    works
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3 mt-6">
                  7.2 User Content
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    You retain ownership of content you create (custom
                    characters, messages)
                  </li>
                  <li>
                    You grant us license to use your content to provide the
                    Service
                  </li>
                  <li>
                    You represent that you own or have rights to any content you
                    upload
                  </li>
                  <li>We may remove content that violates these Terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  8. Privacy and Data Protection
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Our Privacy Policy governs how we collect and use your
                    information
                  </li>
                  <li>
                    You consent to data processing as described in our Privacy
                    Policy
                  </li>
                  <li>We implement security measures to protect your data</li>
                  <li>Third-party services have their own privacy policies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  9. Service Availability
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    We strive for high availability but cannot guarantee 100%
                    uptime
                  </li>
                  <li>Maintenance may temporarily interrupt service</li>
                  <li>We may modify or discontinue features with notice</li>
                  <li>Emergency maintenance may occur without prior notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  10. Disclaimer of Warranties
                </h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY
                  KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
                  INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                  AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
                  BE ERROR-FREE OR UNINTERRUPTED.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  11. Limitation of Liability
                </h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE,
                  ARISING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  12. Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless LuciDream and its
                  affiliates from any claims, damages, or expenses arising from
                  your use of the Service, violation of these Terms, or
                  infringement of any rights of another.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  13. Termination
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Either party may terminate this agreement at any time</li>
                  <li>
                    We may suspend or terminate accounts that violate these
                    Terms
                  </li>
                  <li>
                    Upon termination, your right to use the Service ceases
                    immediately
                  </li>
                  <li>Data retention follows our Privacy Policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  14. Governing Law
                </h2>
                <p>
                  These Terms are governed by and construed in accordance with
                  applicable international law and regulations. Any disputes
                  will be resolved through binding arbitration.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  15. Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms at any time.
                  Material changes will be communicated through the Service or
                  via email. Continued use constitutes acceptance of modified
                  Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  16. Contact Information
                </h2>
                <p>
                  Questions about these Terms of Service should be directed to
                  our support team through our Discord server or official
                  support channels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
                  17. Severability
                </h2>
                <p>
                  If any provision of these Terms is found to be unenforceable,
                  the remaining provisions will continue in full force and
                  effect.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
